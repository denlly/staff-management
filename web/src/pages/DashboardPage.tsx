import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { apiClient } from '../api/client';
import type { StaffRecord } from '../types';
import { RecordForm } from '../components/RecordForm';

export function DashboardPage() {
  const [records, setRecords] = useState<StaffRecord[]>([]);
  const [editing, setEditing] = useState<StaffRecord | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const parseError = (err: unknown) => {
    if (!axios.isAxiosError(err)) {
      return '操作失败，请稍后再试';
    }
    const message = err.response?.data?.message ?? '操作失败，请稍后再试';
    return Array.isArray(message) ? message.join(', ') : message;
  };

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get<StaffRecord[]>('/records');
      setRecords(response.data);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const createRecord = async (payload: { title: string; content: string }) => {
    await apiClient.post('/records', payload);
    await loadRecords();
  };

  const updateRecord = async (payload: { title: string; content: string }) => {
    if (!editing) {
      return;
    }
    await apiClient.patch(`/records/${editing.id}`, payload);
    setEditing(null);
    await loadRecords();
  };

  const removeRecord = async (id: string) => {
    await apiClient.delete(`/records/${id}`);
    await loadRecords();
  };

  return (
    <section className="dashboard">
      <div className="card">
        <h2>新增记录</h2>
        <RecordForm onSubmit={createRecord} submitText="创建记录" />
      </div>

      {editing && (
        <div className="card">
          <h2>编辑记录</h2>
          <RecordForm
            onSubmit={updateRecord}
            submitText="保存修改"
            defaultTitle={editing.title}
            defaultContent={editing.content}
          />
          <button className="text-button" onClick={() => setEditing(null)}>
            取消编辑
          </button>
        </div>
      )}

      <div className="card">
        <h2>记录列表</h2>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p>加载中...</p>
        ) : records.length === 0 ? (
          <p className="muted">暂无记录，先创建一条吧。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>标题</th>
                  <th>内容</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.title}</td>
                    <td>{record.content}</td>
                    <td>{new Date(record.updatedAt).toLocaleString()}</td>
                    <td className="row">
                      <button onClick={() => setEditing(record)}>编辑</button>
                      <button className="danger" onClick={() => void removeRecord(record.id)}>
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

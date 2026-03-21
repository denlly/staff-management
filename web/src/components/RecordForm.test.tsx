import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RecordForm } from './RecordForm';

describe('RecordForm', () => {
  it('submits entered title and content', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<RecordForm onSubmit={onSubmit} submitText="创建记录" />);

    fireEvent.change(screen.getByPlaceholderText('例如：周报记录'), {
      target: { value: '测试标题' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入详细内容'), {
      target: { value: '测试内容' },
    });

    fireEvent.click(screen.getByRole('button', { name: '创建记录' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: '测试标题',
      content: '测试内容',
    });
  });
});

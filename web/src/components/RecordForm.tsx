import { useState } from 'react';

interface RecordFormProps {
  onSubmit: (payload: { title: string; content: string }) => Promise<void>;
  submitText: string;
  defaultTitle?: string;
  defaultContent?: string;
}

export function RecordForm({
  onSubmit,
  submitText,
  defaultTitle = '',
  defaultContent = '',
}: RecordFormProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ title, content });
      setTitle('');
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <label>
        标题
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例如：周报记录"
          minLength={2}
          maxLength={100}
          required
        />
      </label>
      <label>
        内容
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="请输入详细内容"
          minLength={2}
          maxLength={2000}
          required
        />
      </label>
      <button disabled={submitting} type="submit">
        {submitting ? '提交中...' : submitText}
      </button>
    </form>
  );
}

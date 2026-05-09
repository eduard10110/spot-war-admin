import { Spin } from 'antd';

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <Spin size="large" />
    </div>
  );
}

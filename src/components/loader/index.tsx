import { Spin } from 'antd';

export default function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Spin size="large" />
    </div>
  );
}

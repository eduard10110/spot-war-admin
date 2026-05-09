import MainLayout from '@pages/mainLayout';
import Home from '@pages/home';
import Online from '@pages/online';
import Practice from '@pages/practice';
import { Navigate, Route, Routes } from 'react-router';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="practice" element={<Practice />} />
        <Route path="online" element={<Online />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

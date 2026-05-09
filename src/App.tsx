import Loader from '@components/loader';
import { UserProvider, type AdminSession } from '@contexts/user';
import LoginModal from '@modals/login';
import AppRoutes from '@routes/index';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import { useState } from 'react';
import { BrowserRouter } from 'react-router';

type SessionState = 'loading' | 'guest' | AdminSession;

const MOCK_SESSION: AdminSession = {
  uid: 'hardcoded-admin',
  email: 'admin',
  profile: null,
};

export default function App() {
  const [session, setSession] = useState<SessionState>('guest');

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { borderRadius: 8, colorPrimary: '#7c3aed' },
      }}
    >
      <AntApp>
        {session === 'loading' ? (
          <Loader />
        ) : session === 'guest' ? (
          <LoginModal onSuccess={() => setSession(MOCK_SESSION)} />
        ) : (
          <UserProvider value={session}>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </UserProvider>
        )}
      </AntApp>
    </ConfigProvider>
  );
}

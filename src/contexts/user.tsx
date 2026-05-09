import type { AdminUserFirestoreProfile } from '@helpers/types/admin';
import { createContext, useContext } from 'react';

export interface AdminSession {
  uid: string;
  email: string | null;
  profile: AdminUserFirestoreProfile | null;
}

const UserContext = createContext<AdminSession | null>(null);

export const UserProvider = UserContext.Provider;

export function useAdminUser(): AdminSession {
  const v = useContext(UserContext);
  if (!v) throw new Error('useAdminUser must be used within UserProvider');
  return v;
}

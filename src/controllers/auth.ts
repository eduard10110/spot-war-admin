import { Collections } from '@core/enums';
import { auth, fireStoreDb } from '@core/services/firebase';
import type {
  AdminUserFirestoreProfile,
  FirebaseAuthErrorShape,
  LoginResult,
} from '@helpers/types/admin';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthController = {
  getUserInfo: async (uid: string): Promise<AdminUserFirestoreProfile | null> => {
    const docRef = doc(fireStoreDb, Collections.Users, uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as AdminUserFirestoreProfile) : null;
  },

  login: async (email: string, password: string): Promise<LoginResult> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (err) {
      const e = err as FirebaseAuthErrorShape;
      return {
        ok: false,
        errorCode: e.code ?? 'unknown',
        errorMessage: e.message ?? 'Login failed',
      };
    }
  },

  logOut: () => signOut(auth),
};

export default AuthController;

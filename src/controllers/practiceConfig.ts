import { Collections } from '@core/enums';
import { fireStoreDb } from '@core/services/firebase';
import type {
  LevelProgressionBand,
  PracticeGameplayConfig,
  PracticeLevelCatalog,
} from '@helpers/types/backend';
import { notification } from 'antd';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';

const practiceLevelsRef = () => collection(fireStoreDb, Collections.PracticeLevelsCatalog);
const progressionRef = () => collection(fireStoreDb, Collections.LevelProgression);
const gameMetaRef = () => doc(fireStoreDb, Collections.GameConfig, 'meta');
const DEFAULT_PRACTICE_GAMEPLAY_CONFIG: PracticeGameplayConfig = {
  hintCoinCost: 100,
  maxWrongTaps: 3,
};

const PracticeConfigController = {
  listPracticeLevels: async (): Promise<PracticeLevelCatalog[]> => {
    const q = query(practiceLevelsRef(), orderBy('level', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PracticeLevelCatalog);
  },

  upsertPracticeLevel: async (row: PracticeLevelCatalog): Promise<boolean> => {
    try {
      await setDoc(doc(fireStoreDb, Collections.PracticeLevelsCatalog, String(row.level)), row, {
        merge: true,
      });
      notification.success({ message: 'Practice level saved' });
      return true;
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : 'Failed to save practice level',
      });
      return false;
    }
  },

  deletePracticeLevel: async (level: number): Promise<boolean> => {
    try {
      await deleteDoc(doc(fireStoreDb, Collections.PracticeLevelsCatalog, String(level)));
      notification.success({ message: 'Practice level removed' });
      return true;
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : 'Failed to delete',
      });
      return false;
    }
  },

  listLevelProgression: async (): Promise<LevelProgressionBand[]> => {
    const q = query(progressionRef(), orderBy('level', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as LevelProgressionBand);
  },

  upsertLevelProgression: async (row: LevelProgressionBand): Promise<boolean> => {
    try {
      await setDoc(doc(fireStoreDb, Collections.LevelProgression, String(row.level)), row, {
        merge: true,
      });
      notification.success({ message: 'Progression band saved' });
      return true;
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : 'Failed to save progression',
      });
      return false;
    }
  },

  deleteLevelProgression: async (level: number): Promise<boolean> => {
    try {
      await deleteDoc(doc(fireStoreDb, Collections.LevelProgression, String(level)));
      notification.success({ message: 'Progression band removed' });
      return true;
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : 'Failed to delete',
      });
      return false;
    }
  },

  getPracticeGameplayConfig: async (): Promise<PracticeGameplayConfig> => {
    const snap = await getDoc(gameMetaRef());
    if (!snap.exists()) return DEFAULT_PRACTICE_GAMEPLAY_CONFIG;
    const raw = snap.data() as Partial<PracticeGameplayConfig>;
    return {
      hintCoinCost:
        typeof raw.hintCoinCost === 'number' && raw.hintCoinCost > 0
          ? Math.floor(raw.hintCoinCost)
          : DEFAULT_PRACTICE_GAMEPLAY_CONFIG.hintCoinCost,
      maxWrongTaps:
        typeof raw.maxWrongTaps === 'number' && raw.maxWrongTaps > 0
          ? Math.floor(raw.maxWrongTaps)
          : DEFAULT_PRACTICE_GAMEPLAY_CONFIG.maxWrongTaps,
    };
  },

  upsertPracticeGameplayConfig: async (cfg: PracticeGameplayConfig): Promise<boolean> => {
    try {
      await setDoc(
        gameMetaRef(),
        {
          hintCoinCost: Math.max(1, Math.floor(cfg.hintCoinCost)),
          maxWrongTaps: Math.max(1, Math.floor(cfg.maxWrongTaps)),
          updatedAt: Date.now(),
        },
        { merge: true },
      );
      notification.success({ message: 'Practice gameplay config saved' });
      return true;
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : 'Failed to save gameplay config',
      });
      return false;
    }
  },
};

export default PracticeConfigController;

import { Collections } from '@core/enums';
import { fireStoreDb } from '@core/services/firebase';
import StorageUpload from '@controllers/storageUpload';
import type { OnlineGameLevel, OnlineSpotDifference } from '@helpers/types/backend';
import { notification } from 'antd';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';

const col = () => collection(fireStoreDb, Collections.OnlineGameLevels);

const defaultDifferences = (): OnlineSpotDifference[] =>
  [1, 2, 3, 4, 5].map((id) => ({
    id,
    x: [25, 60, 40, 75, 15][id - 1] ?? 20,
    y: [30, 45, 70, 25, 60][id - 1] ?? 50,
  }));

export type OnlineImageUploads = {
  original?: File;
  differences?: File;
};

const OnlineGameController = {
  list: async (): Promise<OnlineGameLevel[]> => {
    const q = query(col(), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Omit<OnlineGameLevel, 'id'>;
      return { ...data, id: d.id };
    });
  },

  create: async (
    input: Omit<OnlineGameLevel, 'id' | 'updatedAt'>,
    files?: OnlineImageUploads
  ): Promise<string | null> => {
    try {
      const refDoc = doc(col());
      const id = refDoc.id;
      let imageUri = input.imageUri;
      let referenceUri = input.referenceUri;

      if (files?.differences) {
        imageUri = await StorageUpload.onlineLevelImage(id, files.differences, 'differences');
      }
      if (files?.original) {
        referenceUri = await StorageUpload.onlineLevelImage(id, files.original, 'original');
      }

      const payload: Omit<OnlineGameLevel, 'id'> = {
        order: input.order,
        name: input.name,
        imageUri,
        referenceUri,
        differences: input.differences?.length ? input.differences : defaultDifferences(),
        timeLimitSec: input.timeLimitSec,
        active: input.active,
        updatedAt: Date.now(),
      };

      await setDoc(refDoc, payload);
      notification.success({ message: 'Online level created' });
      return id;
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : 'Failed to create online level',
      });
      return null;
    }
  },

  update: async (
    id: string,
    input: Partial<Omit<OnlineGameLevel, 'id'>>,
    files?: OnlineImageUploads
  ): Promise<boolean> => {
    try {
      const refDoc = doc(fireStoreDb, Collections.OnlineGameLevels, id);
      let imageUri = input.imageUri;
      let referenceUri = input.referenceUri;

      if (files?.differences) {
        imageUri = await StorageUpload.onlineLevelImage(id, files.differences, 'differences');
      }
      if (files?.original) {
        referenceUri = await StorageUpload.onlineLevelImage(id, files.original, 'original');
      }

      await setDoc(
        refDoc,
        {
          ...input,
          ...(imageUri !== undefined ? { imageUri } : {}),
          ...(referenceUri !== undefined ? { referenceUri } : {}),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      notification.success({ message: 'Online level updated' });
      return true;
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : 'Failed to update online level',
      });
      return false;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(fireStoreDb, Collections.OnlineGameLevels, id));
      notification.success({ message: 'Online level removed' });
      return true;
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : 'Failed to delete',
      });
      return false;
    }
  },
};

export default OnlineGameController;

import { storage } from '@core/services/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

function extFromFile(file: File): string {
  const fromName = file.name.includes('.') ? file.name.split('.').pop() : '';
  if (fromName && /^[a-z0-9]+$/i.test(fromName)) return fromName.toLowerCase();
  return 'jpg';
}

const StorageUpload = {
  /**
   * Practice catalog — two separate objects in Storage:
   * `practice-catalog/{level}/original.{ext}` and `practice-catalog/{level}/differences.{ext}`
   */
  practiceLevelImage: async (
    level: number,
    file: File,
    role: 'original' | 'differences'
  ): Promise<string> => {
    const path = `practice-catalog/${level}/${role}.${extFromFile(file)}`;
    const r = ref(storage, path);
    await uploadBytes(r, file, { contentType: file.type || undefined });
    return getDownloadURL(r);
  },

  /**
   * Online rounds — `online-game/{id}/original.{ext}` and `online-game/{id}/differences.{ext}`
   */
  onlineLevelImage: async (
    docId: string,
    file: File,
    role: 'original' | 'differences'
  ): Promise<string> => {
    const path = `online-game/${docId}/${role}.${extFromFile(file)}`;
    const r = ref(storage, path);
    await uploadBytes(r, file, { contentType: file.type || undefined });
    return getDownloadURL(r);
  },
};

export default StorageUpload;

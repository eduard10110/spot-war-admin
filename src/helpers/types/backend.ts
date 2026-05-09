/** Mirrors `spot-war/types/backend.ts` — practice catalog consumed by the mobile app. */

/** Spot positions on the playfield (% of image width/height). */
export interface OnlineSpotDifference {
  id: number;
  x: number;
  y: number;
}

export interface PracticeLevelCatalog {
  level: number;
  name: string;
  /** Playfield: image containing the differences (user taps here). */
  imageUri: string;
  /** Original clean image (reference comparison). */
  referenceUri: string;
  /** Hotspots on the playfield — placed in admin by clicking the image. */
  differences: OnlineSpotDifference[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitSec: number;
}

export interface PracticeGameplayConfig {
  hintCoinCost: number;
  maxWrongTaps: number;
}

export interface LevelProgressionBand {
  level: number;
  minXp: number;
  maxXp: number;
  title: string;
  rewardCoins: number;
}

/** Managed in Firestore; upload images separately: original + with-differences. */
export interface OnlineGameLevel {
  id: string;
  order: number;
  name: string;
  /** Playfield: image containing the differences. */
  imageUri: string;
  /** Original clean image (reference). */
  referenceUri: string;
  differences: OnlineSpotDifference[];
  timeLimitSec: number;
  active: boolean;
  updatedAt?: number;
}

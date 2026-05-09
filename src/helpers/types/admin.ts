import type { Timestamp } from 'firebase/firestore';

import type { LevelProgressionBand, OnlineGameLevel, PracticeLevelCatalog } from '@helpers/types/backend';

/** Firestore `users/{uid}` document — mirrors mobile `UserProfileDoc` / `UserProfile`. */
export interface AdminUserFirestoreProfile {
  uid?: string;
  name?: string;
  coins?: number;
  xp?: number;
  practiceGames?: number;
  practiceBestStars?: number;
  practiceTotalStars?: number;
  practiceHighScore?: number;
  wins?: number;
  losses?: number;
  streak?: number;
  bestStreak?: number;
  totalMatches?: number;
  accuracy?: number;
  level?: number;
  rankPoints?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface OnlineLevelModalState {
  open: boolean;
  row: OnlineGameLevel | null;
}

export interface PracticeLevelModalState {
  open: boolean;
  row: PracticeLevelCatalog | null;
}

export interface LevelProgressionModalState {
  open: boolean;
  row: LevelProgressionBand | null;
}

export interface LoginSuccess {
  ok: true;
}

export interface LoginFailure {
  ok: false;
  errorCode: string;
  errorMessage: string;
}

export type LoginResult = LoginSuccess | LoginFailure;

export interface FirebaseAuthErrorShape {
  code?: string;
  message?: string;
}

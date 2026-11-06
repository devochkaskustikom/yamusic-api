export interface AccountPlus {
  readonly hasPlus: boolean;
  readonly isTutorialCompleted: boolean;
}

export interface Account {
  readonly uid: number;
  readonly login?: string;
  readonly displayName?: string;
  readonly fullName?: string;
  readonly firstName?: string;
  readonly secondName?: string;
  readonly serviceAvailable?: boolean;
  readonly plus?: AccountPlus;
}

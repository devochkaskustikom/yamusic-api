export interface AuthProvider {
  getToken(): Promise<string> | string;
  invalidate?(): void;
}

export type AuthConfig =
  | { readonly token: string }
  | { readonly getToken: () => string | Promise<string> }
  | { readonly provider: AuthProvider };

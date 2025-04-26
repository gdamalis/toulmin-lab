export type AuthMode = 'signin' | 'signup';

export interface AuthFormProps {
  readonly onSuccess?: () => void;
  readonly redirectPath?: string;
}

export interface AuthError {
  readonly code: string;
  readonly message: string;
}

export interface FormState {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly rememberMe: boolean;
} 
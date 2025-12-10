// API 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  message: string;
  errors?: Record<string, string[]>;
  error_code?: number;
}

// 에러 코드
export const ERROR_CODES = {
  UNKNOWN: 10000,
  BAD_REQUEST: 10001,
  NOT_FOUND: 10002,
  CONFLICT: 10003,
  AUTH_FAILED: 20000,
  INVALID_CREDENTIALS: 20001,
  INACTIVE_ACCOUNT: 20002,
  TOKEN_EXPIRED: 20003,
  INVALID_TOKEN: 20004,
  PERMISSION_DENIED: 20005,
  EMAIL_NOT_FOUND: 30001,
  EMAIL_DUPLICATE: 30002,
  USERNAME_DUPLICATE: 30003,
  VALIDATION_FAILED: 40000,
  PASSWORD_MISMATCH: 40001,
  CURRENT_PASSWORD_WRONG: 40002,
} as const;

// User 타입
export interface User {
  id: number;
  username: string;
  email: string;
  gender?: 'M' | 'F' | 'O' | null;
  birth_date?: string | null;
  phone_number?: string | null;
  date_joined: string;
}

// 토큰 타입
export interface Tokens {
  access: string;
  refresh: string;
}

// 회원가입 요청
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  gender?: 'M' | 'F' | 'O';
  birth_date?: string;
  phone_number?: string;
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 로그인 응답 데이터
export interface LoginResponseData {
  user: User;
  tokens: Tokens;
}

// 이메일 중복 체크 요청
export interface CheckEmailRequest {
  email: string;
}

// 이메일 중복 체크 응답 데이터
export interface CheckEmailResponseData {
  available: boolean;
}

// 토큰 갱신 요청
export interface RefreshTokenRequest {
  refresh: string;
}

// 토큰 갱신 응답 데이터
export interface RefreshTokenResponseData {
  access: string;
}

// 내 정보 수정 요청
export interface UpdateProfileRequest {
  gender?: 'M' | 'F' | 'O';
  birth_date?: string;
  phone_number?: string;
}

// 비밀번호 변경 요청
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

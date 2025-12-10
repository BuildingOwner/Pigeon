import apiClient, { tokenStorage } from '@/lib/api-client';
import {
  ApiResponse,
  SignupRequest,
  LoginRequest,
  LoginResponseData,
  CheckEmailRequest,
  CheckEmailResponseData,
  RefreshTokenRequest,
  RefreshTokenResponseData,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@/types/api';

// 회원가입
export async function signup(data: SignupRequest): Promise<ApiResponse<User>> {
  const response = await apiClient.post<ApiResponse<User>>('/v1/users/auth/signup', data);
  return response.data;
}

// 로그인
export async function login(data: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>(
    '/v1/users/auth/login',
    data
  );

  // 토큰 저장
  if (response.data.success && response.data.data?.tokens) {
    tokenStorage.setTokens(response.data.data.tokens.access, response.data.data.tokens.refresh);
  }

  return response.data;
}

// 이메일 중복 체크
export async function checkEmail(
  data: CheckEmailRequest
): Promise<ApiResponse<CheckEmailResponseData>> {
  const response = await apiClient.post<ApiResponse<CheckEmailResponseData>>(
    '/v1/users/auth/check-email',
    data
  );
  return response.data;
}

// 토큰 갱신
export async function refreshToken(
  data: RefreshTokenRequest
): Promise<ApiResponse<RefreshTokenResponseData>> {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponseData>>(
    '/v1/users/auth/token/refresh',
    data
  );

  if (response.data.success && response.data.data?.access) {
    tokenStorage.setAccessToken(response.data.data.access);
  }

  return response.data;
}

// 내 정보 조회
export async function getMe(): Promise<ApiResponse<User>> {
  const response = await apiClient.get<ApiResponse<User>>('/v1/users/me');
  return response.data;
}

// 내 정보 수정
export async function updateMe(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
  const response = await apiClient.patch<ApiResponse<User>>('/v1/users/me', data);
  return response.data;
}

// 비밀번호 변경
export async function changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>('/v1/users/change-password', data);
  return response.data;
}

// 로그아웃 (클라이언트 측)
export function logout(): void {
  tokenStorage.clearTokens();
}

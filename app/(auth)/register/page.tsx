'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { signup, checkEmail as apiCheckEmail } from '@/lib/api/auth';
import { ApiErrorResponse, ERROR_CODES } from '@/types/api';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    birthDate: '',
    phone: '',
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    passwordConfirm?: string;
    birthDate?: string;
    phone?: string;
    general?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 전화번호 자동 포맷팅
    if (name === 'phone') {
      const numbers = value.replace(/[^0-9]/g, '');
      let formatted = numbers;
      if (numbers.length > 3 && numbers.length <= 7) {
        formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      } else if (numbers.length > 7) {
        formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
      }
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // 이메일 변경 시 중복체크 상태 초기화
    if (name === 'email') {
      setIsEmailChecked(false);
    }

    // 입력 시 해당 필드의 에러 초기화
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleEmailCheck = async () => {
    // 이메일 유효성 검사
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: '이메일을 입력해주세요' }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: '올바른 이메일 형식이 아닙니다' }));
      return;
    }

    setIsCheckingEmail(true);
    setErrors((prev) => ({ ...prev, email: undefined }));

    try {
      const response = await apiCheckEmail({ email: formData.email });

      if (response.success && response.data?.available) {
        setIsEmailChecked(true);
      } else {
        setErrors((prev) => ({ ...prev, email: '이미 사용 중인 이메일입니다' }));
        setIsEmailChecked(false);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorCode = axiosError.response?.data?.error_code;

      if (errorCode === ERROR_CODES.EMAIL_DUPLICATE) {
        setErrors((prev) => ({ ...prev, email: '이미 사용 중인 이메일입니다' }));
      } else {
        setErrors((prev) => ({ ...prev, email: '중복 확인에 실패했습니다' }));
      }
      setIsEmailChecked(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    } else if (!isEmailChecked) {
      newErrors.email = '이메일 중복 확인을 해주세요';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = '생년월일을 입력해주세요';
    }

    if (!formData.phone) {
      newErrors.phone = '핸드폰 번호를 입력해주세요';
    } else if (!/^01[0-9]-[0-9]{3,4}-[0-9]{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 핸드폰 번호 형식이 아닙니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // 이메일에서 username 추출 (@ 앞부분)
      const username = formData.email.split('@')[0];

      const response = await signup({
        username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.passwordConfirm,
        birth_date: formData.birthDate || undefined,
        phone_number: formData.phone || undefined,
      });

      if (response.success) {
        // 회원가입 성공 시 로그인 페이지로 이동
        router.push('/login?registered=true');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorCode = axiosError.response?.data?.error_code;
      const errorMessage = axiosError.response?.data?.message;

      if (errorCode === ERROR_CODES.EMAIL_DUPLICATE) {
        setErrors({ email: '이미 사용 중인 이메일입니다' });
        setIsEmailChecked(false);
      } else if (errorCode === ERROR_CODES.USERNAME_DUPLICATE) {
        setErrors({ email: '이미 사용 중인 사용자명입니다' });
      } else if (errorCode === ERROR_CODES.PASSWORD_MISMATCH) {
        setErrors({ passwordConfirm: '비밀번호가 일치하지 않습니다' });
      } else {
        setErrors({
          general: errorMessage || '회원가입에 실패했습니다. 다시 시도해주세요.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-gray-600">Pigeon과 함께 메일을 정리하세요</p>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이메일 + 중복체크 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일 (아이디)</label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={`
                  flex-1 px-4 py-3 rounded-lg border transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
                `}
              />
              <Button
                type="button"
                variant={isEmailChecked ? 'secondary' : 'outline'}
                onClick={handleEmailCheck}
                disabled={isCheckingEmail || isEmailChecked}
                className="whitespace-nowrap"
              >
                {isCheckingEmail ? '확인 중...' : isEmailChecked ? '확인됨' : '중복확인'}
              </Button>
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            {isEmailChecked && !errors.email && (
              <p className="mt-1 text-sm text-green-600">사용 가능한 이메일입니다</p>
            )}
          </div>

          <Input
            label="비밀번호"
            type="password"
            name="password"
            placeholder="8자 이상 입력하세요"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
          />

          <Input
            label="비밀번호 확인"
            type="password"
            name="passwordConfirm"
            placeholder="비밀번호를 다시 입력하세요"
            value={formData.passwordConfirm}
            onChange={handleChange}
            error={errors.passwordConfirm}
            autoComplete="new-password"
          />

          <Input
            label="생년월일"
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            error={errors.birthDate}
          />

          <Input
            label="핸드폰 번호"
            type="tel"
            name="phone"
            placeholder="010-0000-0000"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            autoComplete="tel"
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            회원가입
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-500">또는</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Gmail Sign Up */}
        <Button variant="outline" className="w-full" size="lg">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Gmail로 계속하기
          </span>
        </Button>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

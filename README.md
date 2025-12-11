# Pigeon Frontend

AI 기반 메일 분류 시스템 Pigeon의 프론트엔드 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## 프로젝트 구조

```
Pigeon-FE/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 관련 페이지
│   │   ├── login/           # 로그인 페이지
│   │   └── callback/        # OAuth 콜백 페이지
│   ├── (main)/              # 메인 애플리케이션
│   │   ├── layout.tsx       # 메인 레이아웃 (인증 확인)
│   │   └── mail/            # 메일함
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 랜딩 페이지
│   └── globals.css          # 글로벌 스타일
│
├── components/              # 재사용 가능한 컴포넌트
│   ├── ui/                  # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Badge.tsx
│   │   └── Pagination.tsx
│   ├── layout/              # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── StatusBar.tsx
│   └── mail/                # 메일 관련 컴포넌트
│       ├── MailList.tsx
│       ├── MailListItem.tsx
│       └── MailDetail.tsx
│
├── stores/                  # Zustand 상태 관리
│   ├── authStore.ts         # 인증 상태
│   ├── folderStore.ts       # 폴더 상태
│   ├── mailStore.ts         # 메일 상태
│   └── syncStore.ts         # 동기화 상태
│
├── types/                   # TypeScript 타입 정의
│   ├── user.ts
│   ├── folder.ts
│   ├── mail.ts
│   ├── sync.ts
│   ├── api.ts
│   └── index.ts
│
├── lib/                     # 유틸리티 함수
│   ├── api.ts              # Axios 인스턴스 및 인터셉터
│   ├── utils.ts            # 공통 유틸리티 (cn, formatDate 등)
│   └── constants.ts        # 상수 정의
│
└── public/                  # 정적 파일
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example` 파일을 `.env.local`로 복사하고 수정합니다:

```bash
cp .env.local.example .env.local
```

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 주요 기능

### 인증
- Google OAuth 2.0 로그인
- JWT 토큰 기반 인증
- 자동 토큰 갱신

### 메일 관리
- 3단 레이아웃 (폴더 트리, 메일 목록, 메일 상세)
- 가상 폴더 (전체, 안읽음, 별표, 미분류)
- 페이지네이션
- 메일 검색
- 첨부파일 다운로드

### 폴더 관리
- 계층 구조 폴더 트리
- 폴더 생성/수정/삭제
- 메일 폴더 이동

### 동기화
- Gmail 메일 동기화
- 실시간 동기화 상태 표시
- 백그라운드 동기화

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

## API 연동

백엔드 API는 `lib/api.ts`에 정의된 Axios 인스턴스를 통해 호출됩니다.

### 인터셉터
- **Request**: `localStorage`에서 액세스 토큰을 가져와 Authorization 헤더에 추가
- **Response**: 401 에러 시 자동으로 토큰 갱신 시도

### 사용 예시

```typescript
import api from '@/lib/api';

// 메일 목록 조회
const { data } = await api.get('/mails/', {
  params: { page: 1, page_size: 20 }
});

// 메일 상세 조회
const { data } = await api.get(`/mails/${mailId}/`);
```

## 상태 관리

Zustand를 사용한 전역 상태 관리:

```typescript
// authStore 사용 예시
import { useAuthStore } from '@/stores';

const { user, login, logout } = useAuthStore();

// folderStore 사용 예시
import { useFolderStore } from '@/stores';

const { folders, selectedFolderId, selectFolder } = useFolderStore();
```

## 스타일링

Tailwind CSS를 사용하여 스타일링하며, `lib/utils.ts`의 `cn()` 함수로 조건부 클래스를 적용합니다:

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)} />
```

## 참고 문서

- [Next.js 14 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Zustand 문서](https://github.com/pmndrs/zustand)
- [API 명세서](../Pigeon-DOCS/docs/API_SPEC.md)
- [UI 설계 문서](../Pigeon-DOCS/docs/UI_SPEC.md)

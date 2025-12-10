# 기술 결정 기록 (ADR - Architecture Decision Records)

이 문서는 Pigeon 프로젝트에서 내린 주요 기술적 결정사항들을 기록합니다.

> **작성일**: 2025-12-10
> **마지막 수정**: 2025-12-10

---

## 결정 사항 목록

| # | 결정 | 상태 | 날짜 |
|---|------|------|------|
| 001 | Backend Framework: Django | ✅ 확정 | 2025-12-10 |
| 002 | Frontend Framework: Next.js | ✅ 확정 | 2025-12-10 |
| 003 | Next.js 라우터: App Router | ✅ 확정 | 2025-12-10 |
| 004 | Database: PostgreSQL | ✅ 확정 | 2025-12-10 |
| 005 | LLM: Gemini 2.5 Flash + LangChain | ✅ 확정 | 2025-12-10 |
| 006 | CSS Framework: Tailwind CSS | ✅ 확정 | 2025-12-09 |
| 007 | State Management: Zustand | ✅ 확정 | 2025-12-09 |
| 008 | 메일 연동: Gmail API (OAuth2) | ✅ 확정 | 2025-12-09 |
| 009 | 동기화 범위: 최근 6개월 | ✅ 확정 | 2025-12-09 |
| 010 | 초기 동기화 UX: 즉시 메인화면 진입 | ✅ 확정 | 2025-12-09 |
| 011 | 분류 실패 처리: 1회 재시도 후 "미분류" | ✅ 확정 | 2025-12-10 |
| 012 | 동기화 대상 라벨: 받은편지함만 (MVP) | ✅ 확정 | 2025-12-09 |
| 013 | 메일 본문 저장: 하이브리드 (HTML 저장 + 이미지/첨부 참조) | ✅ 확정 | 2025-12-10 |
| 014 | 초기 동기화 배치 크기: 20개 | ✅ 확정 | 2025-12-09 |
| 015 | 알림 방식: Web Notification API | ✅ 확정 | 2025-12-09 |
| 016 | 폴더 깊이 제한: 최대 5단계 | ✅ 확정 | 2025-12-10 |
| 017 | Gmail API 할당량 관리: 단순 Rate Limiting | ✅ 확정 | 2025-12-10 |
| 018 | 백그라운드 폴링 주기: 3분 | ✅ 확정 | 2025-12-10 |
| 019 | 새 메일 분류 방식: 즉시 1개씩 | ✅ 확정 | 2025-12-10 |
| 020 | Frontend 배포: Vercel | ✅ 확정 | 2025-12-10 |
| 021 | Backend 배포: Railway | ✅ 확정 | 2025-12-10 |
| 022 | API 문서화: Swagger (drf-spectacular) | ✅ 확정 | 2025-12-10 |

---

## 상세 결정 기록

### ADR-001: Backend Framework

**결정**: Django (Python)

**상태**: ✅ 확정

**일자**: 2025-12-10

**맥락**:
- 3일 해커톤 프로젝트로 빠른 개발 속도가 중요
- LLM API 연동이 핵심 기능
- REST API 서버 구축 필요

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| Django | 풀스택 프레임워크, Admin 내장, ORM 강력 | 다소 무거움 |
| FastAPI | 빠른 성능, 자동 문서화, 비동기 | 에코시스템 작음 |
| Node.js + Express | 프론트엔드와 동일 언어 | LLM 라이브러리 상대적 부족 |

**이유**:
- Django ORM으로 DB 작업 편리
- Django Admin으로 데이터 관리 용이
- Python LLM 라이브러리(LangChain 등) 연동 용이
- 풀스택 프레임워크로 빠른 개발 가능

---

### ADR-002: Frontend Framework

**결정**: Next.js + TypeScript

**상태**: ✅ 확정

**일자**: 2025-12-10

**맥락**:
- 트리 구조 UI가 핵심 기능
- 타입 안정성 필요
- SSR/SSG 옵션 필요

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| Next.js | SSR/SSG 지원, React 기반, 풍부한 에코시스템 | 러닝 커브 |
| React + Vite | 빠른 개발 환경, 간단 | SSR 미지원 |
| Vue 3 | 낮은 러닝 커브 | 트리 라이브러리 상대적 부족 |

**이유**:
- SSR로 SEO 및 초기 로딩 성능 개선 가능
- React 기반으로 풍부한 트리 UI 라이브러리 활용
- TypeScript 완벽 지원
- API Routes로 BFF 패턴 가능

---

### ADR-003: Next.js 라우터

**결정**: App Router (Next.js 14+)

**상태**: ✅ 확정

**일자**: 2025-12-10

**맥락**:
- 메일 앱 UI는 중첩 레이아웃 필요 (폴더트리 | 메일목록 | 메일상세)
- Vercel 배포 최적화
- 장기적으로 표준이 될 방식

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| App Router | RSC, 중첩 레이아웃 네이티브, Server Actions | Zustand는 클라이언트에서만 사용 |
| Pages Router | 검증된 안정성, Zustand 바로 사용 | 레거시화 진행 중, 레이아웃 불편 |

**이유**:
- 메일 앱에 중첩 레이아웃 필수 → App Router가 구조적으로 유리
- Vercel 배포 시 최적화 잘 됨
- Zustand는 `'use client'` 디렉티브만 붙이면 문제없음
- React Server Components로 번들 사이즈 최적화

**구현 시 주의사항**:
```tsx
// Zustand 사용하는 컴포넌트
'use client'

import { useMailStore } from '@/stores/mailStore'

export function MailList() {
  const mails = useMailStore((state) => state.mails)
  // ...
}
```

---

### ADR-004: Database

**결정**: PostgreSQL

**상태**: ✅ 확정

**일자**: 2025-12-10

**맥락**:
- Django 백엔드와 호환성 필요
- Gmail API 응답의 가변 데이터 (헤더, 라벨 등) 저장 필요
- Railway에서 쉽게 추가 가능해야 함

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| PostgreSQL | JSONB 인덱싱, ArrayField, Django 통합 우수 | - |
| MySQL | 안정성, 익숙함 | JSON 쿼리 제한적, 배열 미지원 |
| MongoDB | 스키마 유연성 | Django ORM 미지원 |

**이유**:
- **JSONB 지원** → Gmail 메타데이터, LLM 분류 결과 저장에 유용
- **ArrayField 네이티브** → `label_ids` 등 배열 데이터 깔끔하게 저장
- **django.contrib.postgres** → Django ORM과 완벽 통합
- Railway에서 클릭 한 번으로 추가 가능

**활용 예시**:
```python
from django.contrib.postgres.fields import ArrayField
from django.db import models

class Mail(models.Model):
    # 배열 필드
    label_ids = ArrayField(models.CharField(max_length=50), default=list)

    # JSONB 필드
    gmail_headers = models.JSONField(default=dict)
    classification_meta = models.JSONField(default=dict)  # confidence, alternatives 등
```

```python
# JSONB 쿼리
Mail.objects.filter(classification_meta__confidence__gte=0.9)
Mail.objects.filter(label_ids__contains=['UNREAD'])
```

**인덱스 전략**:
```sql
CREATE INDEX idx_mail_user_id ON mail(user_id);
CREATE INDEX idx_mail_folder_id ON mail(folder_id);
CREATE INDEX idx_mail_is_read ON mail(is_read);
CREATE INDEX idx_mail_received_at ON mail(received_at);
CREATE INDEX idx_mail_label_ids ON mail USING GIN(label_ids);  -- 배열 인덱스
CREATE INDEX idx_mail_classification ON mail USING GIN(classification_meta);  -- JSONB 인덱스
```

---

### ADR-005: LLM Provider

**결정**: Gemini 2.5 Flash (기본) + LangChain (확장성)

**상태**: ✅ 확정

**일자**: 2025-12-10

**맥락**:
- 메일 분류 핵심 로직에 LLM 활용
- 비용과 성능의 균형 필요
- 다양한 모델로 쉽게 교체 가능해야 함

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| Gemini 2.5 Flash | 빠른 응답, 비용 효율적 | - |
| GPT-4o-mini | 안정적, 검증됨 | 비용 상대적 높음 |
| Claude 3.5 Sonnet | 높은 성능 | API 비용 |

**이유**:
- Gemini 2.5 Flash는 빠르고 비용 효율적
- LangChain 사용으로 모델 교체 용이
  - OpenAI, Anthropic, Google 등 다양한 모델 지원
  - 프롬프트 템플릿, 체인 구성 편리
- 추후 모델 성능 비교 후 쉽게 변경 가능

**구현 방향**:
```python
# LangChain을 활용한 모델 추상화
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

# 기본 모델
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

# 필요 시 쉽게 교체
# llm = ChatOpenAI(model="gpt-4o-mini")
```

---

### ADR-006: CSS Framework

**결정**: Tailwind CSS

**상태**: ✅ 확정

**일자**: 2025-12-09

**이유**:
- 유틸리티 퍼스트로 빠른 UI 개발
- Next.js와 완벽 호환
- 프로덕션 빌드 시 미사용 클래스 자동 제거

---

### ADR-007: State Management

**결정**: Zustand

**상태**: ✅ 확정

**일자**: 2025-12-09

**맥락**:
- 전역 상태 관리 필요 (폴더 트리, 메일 목록, 동기화 상태)
- Next.js와 호환 필요

**이유**:
- 최소한의 보일러플레이트로 빠른 개발
- TypeScript 지원 우수
- Next.js App Router에서 클라이언트 컴포넌트에서 사용 가능

**Next.js에서 사용 시 주의사항**:
- `'use client'` 디렉티브 필요
- 서버 컴포넌트에서는 직접 사용 불가
- Hydration 이슈 방지를 위한 초기화 패턴 필요

---

### ADR-008: 메일 연동 방식

**결정**: Gmail API (OAuth2)

**상태**: ✅ 확정

**일자**: 2025-12-09

**이유**:
- 실제 Gmail 데이터로 분류 기능 테스트 가능
- OAuth2로 안전한 인증
- Gmail API로 메일 조회, 삭제, 발송 모두 지원

---

### ADR-009: 동기화 범위 (기간)

**결정**: 최근 6개월

**상태**: ✅ 확정

**일자**: 2025-12-09

**이유**:
- 대부분의 활성 메일은 최근 6개월 내에 있음
- Gmail API 쿼리로 효율적 필터링 가능 (`after:{timestamp}`)
- 빠른 초기 동기화로 사용자 경험 개선

---

### ADR-010: 초기 동기화 UX

**결정**: 즉시 메인화면 진입 (백그라운드 동기화)

**상태**: ✅ 확정

**일자**: 2025-12-09

**이유**:
- 로그인 후 즉시 메인화면으로 이동
- 백그라운드에서 20개씩 동기화 + 분류 병렬 처리
- 동기화된 메일은 바로 조회 가능
- 하단 상태바에서 진행 상황 확인

---

### ADR-011: 분류 실패 처리

**결정**: 1회 재시도 후 "미분류" 폴더로 이동

**상태**: ✅ 확정

**일자**: 2025-12-10

**이유**:
- 1회 재시도로 일시적 오류 복구 가능
- 재시도 실패 시 "미분류" 폴더에 배치
- 사용자가 미분류 메일을 확인하고 수동으로 분류 가능
- 추후 피드백 기반 학습에 활용 가능

---

### ADR-012: 동기화 대상 라벨

**결정**: 받은편지함만 (MVP)

**상태**: ✅ 확정

**일자**: 2025-12-09

**이유**:
- MVP에서는 받은편지함(INBOX)만 대상
- 보낸편지함, 스팸 등은 분류 대상이 아님
- 향후 확장 시 추가 라벨 지원 고려

---

### ADR-013: 메일 본문 저장 방식

**결정**: 하이브리드 (HTML 저장 + 이미지/첨부파일 참조)

**상태**: ✅ 확정

**일자**: 2025-12-10

**맥락**:
- 메일에는 텍스트, 이미지, 첨부파일이 포함됨
- 이미지/첨부파일까지 저장하면 DB 부담 큼 (수MB~25MB/메일)
- Gmail은 iframe 임베딩 차단 (X-Frame-Options)

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| Full body + 이미지 + 첨부 | 완전한 오프라인 | DB 폭발 (수십GB) |
| Snippet + 매번 Fetch | 저장 공간 최소 | 상세 보기마다 API 호출, UX 저하 |
| Gmail 링크로 새 탭 | 구현 초간단 | 앱 이탈, UX 단절 |
| **하이브리드** | 적절한 균형 | - |

**이유**:
- **텍스트/HTML만 저장** → 메일당 10-50KB로 관리 가능
- **이미지는 Gmail 서버에서 로드** → HTML 내 URL 그대로 유지
- **첨부파일은 온디맨드** → 메타데이터만 저장, 다운로드 시 API 호출
- 앱 내에서 상세 보기 가능 (UX 유지)

**저장 구조**:
```python
class Mail(models.Model):
    # 저장 O
    subject = models.CharField(max_length=500)
    sender = models.CharField(max_length=200)
    snippet = models.TextField()  # 목록용 미리보기
    body_html = models.TextField()  # HTML 본문 (이미지 URL 포함)
    body_text = models.TextField()  # Plain text 본문

    # 첨부파일 메타데이터만
    attachments = models.JSONField(default=list)
    # [{"id": "xxx", "name": "file.pdf", "size": 1024, "mimeType": "application/pdf"}]
```

**이미지 처리**:
```html
<!-- HTML 본문 내 이미지 URL은 그대로 유지 -->
<img src="https://mail.google.com/mail/u/0?ui=2&ik=xxx&attid=0.1&...">
<!-- Gmail 서버에서 직접 로드됨 (저장 불필요) -->
```

**첨부파일 다운로드**:
```python
# 사용자가 첨부파일 클릭 시에만 API 호출
def download_attachment(mail_id, attachment_id):
    attachment = gmail_service.users().messages().attachments().get(
        userId='me', messageId=mail_id, id=attachment_id
    ).execute()
    return base64.urlsafe_b64decode(attachment['data'])
```

---

### ADR-014: 초기 동기화 배치 크기

**결정**: 20개 단위

**상태**: ✅ 확정

**일자**: 2025-12-09

**이유**:
- 20개는 LLM API 호출에 적절한 단위 (토큰 제한 고려)
- UI 업데이트 주기로도 적절
- Gmail API 할당량 관리에 효율적

---

### ADR-015: 알림 방식

**결정**: Web Notification API (브라우저 알림)

**상태**: ✅ 확정

**일자**: 2025-12-09

**이유**:
- 다른 탭에서 작업 중에도 알림 수신 가능
- OS 레벨 알림으로 눈에 잘 띔
- 권한 거부 시 인앱 폴더 카운트로 대체

---

### ADR-016: 폴더 깊이 제한

**결정**: 최대 5단계

**상태**: ✅ 확정

**일자**: 2025-12-10

**이유**:
- 5단계면 대부분의 분류 케이스 커버 가능
- 예: `업무/프로젝트A/클라이언트B/계약/2025`
- 너무 깊은 구조는 사용성 저하
- LLM 프롬프트에 깊이 제한 명시

---

### ADR-017: Gmail API 할당량 관리

**결정**: 단순 Rate Limiting

**상태**: ✅ 확정

**일자**: 2025-12-10

**이유**:
- MVP에서는 단순한 Rate Limiting으로 충분
- 초당/분당 요청 수 제한
- 복잡한 큐 시스템은 과도한 엔지니어링
- 추후 필요 시 확장

**구현 방향**:
- API 호출 전 간단한 딜레이
- 429 에러 시 exponential backoff

---

### ADR-018: 백그라운드 폴링 주기

**결정**: 3분

**상태**: ✅ 확정

**일자**: 2025-12-10

**이유**:
- 실시간성과 API 효율의 균형
- 3분이면 일반적인 이메일 사용에 충분
- Gmail API 할당량 절약
- 사용자가 직접 새로고침 버튼으로 즉시 확인 가능

---

### ADR-019: 새 메일 분류 방식

**결정**: 즉시 1개씩 분류

**상태**: ✅ 확정

**일자**: 2025-12-10

**이유**:
- 새 메일 도착 시 즉각적인 분류로 실시간 경험 제공
- 사용자가 새 메일을 바로 분류된 상태로 확인 가능
- LLM API 호출 횟수는 증가하지만 UX 우선

---

### ADR-020: Frontend 배포

**결정**: Vercel

**상태**: ✅ 확정

**일자**: 2025-12-10

**맥락**:
- Next.js 프로젝트 배포 필요
- 빠른 배포 및 프리뷰 환경 필요

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| Vercel | Next.js 공식 지원, 자동 배포, 프리뷰 URL | - |
| Netlify | 간편한 설정 | Next.js 기능 일부 제한 |
| AWS Amplify | AWS 생태계 통합 | 설정 복잡 |

**이유**:
- Vercel은 Next.js 제작사로 완벽한 호환성
- Git push 시 자동 배포
- PR별 프리뷰 URL 자동 생성
- 무료 플랜으로 MVP 충분

---

### ADR-021: Backend 배포

**결정**: Railway

**상태**: ✅ 확정

**일자**: 2025-12-10

**맥락**:
- Django 백엔드 배포 필요
- 해커톤이므로 빠르고 간단한 방식 선호
- 데모 시 콜드 스타트 없어야 함

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| Railway | 간편, Git 연동, 콜드스타트 없음, DB 쉽게 추가 | $5/월 크레딧 제한 |
| Render | 무료 플랜, 자동 배포 | 15분 후 슬립 → 콜드 스타트 |
| Fly.io | 빠른 응답, 글로벌 엣지 | 설정 약간 복잡 |

**이유**:
- 설정 초간단: GitHub 연결 → 자동 감지 → 배포
- 콜드 스타트 없음: 데모 시 첫 요청 지연 문제 없음
- DB 추가 쉬움: MySQL/PostgreSQL 클릭 한 번으로 추가
- $5 무료 크레딧: 해커톤 3일에 충분

**구현 방향**:
- GitHub 연동으로 main 브랜치 push 시 자동 배포
- Railway에서 MySQL/PostgreSQL 인스턴스 추가
- 환경변수로 시크릿 관리

---

### ADR-022: API 문서화

**결정**: Swagger (drf-spectacular)

**상태**: ✅ 확정

**일자**: 2025-12-10

**맥락**:
- API 문서화 필요
- 데모 시 API 테스트 UI 있으면 유용
- 해커톤에서 빠른 설정 중요

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| drf-spectacular | 최신, 활발한 유지보수, OpenAPI 3.0 | - |
| drf-yasg | 오래됨, 인기 있음 | 유지보수 느림 |
| 수동 문서화 | - | 시간 낭비 |

**이유**:
- 설정 5분 이내로 완료
- Django REST Framework와 완벽 호환
- Swagger UI로 API 테스트 가능
- 데모할 때 전문적으로 보임

**구현**:
```python
# settings.py
INSTALLED_APPS = [
    ...
    'drf_spectacular',
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Pigeon API',
    'DESCRIPTION': 'AI 메일 폴더링 시스템 API',
    'VERSION': '1.0.0',
}

# urls.py
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
```

**접속 URL**: `http://localhost:8000/api/docs/`

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2025-12-10 | Backend: FastAPI → Django로 변경 |
| 2025-12-10 | Frontend: React+Vite → Next.js로 변경 |
| 2025-12-10 | LLM: GPT-4o-mini → Gemini 2.5 Flash + LangChain으로 변경 |
| 2025-12-10 | Database: SQLite 확정 → TBD (RDB vs NoSQL 비교 필요) |
| 2025-12-10 | 폴더 깊이 제한: 최대 5단계 확정 |
| 2025-12-10 | 폴링 주기: 3분 확정 |
| 2025-12-10 | 분류 방식: 즉시 1개씩 확정 |
| 2025-12-10 | 분류 실패 처리: "미분류" → 1회 재시도 후 "미분류"로 변경 |
| 2025-12-10 | API 관리: 단순 Rate Limiting 확정 |
| 2025-12-10 | Next.js 버전/라우터: TBD 추가 |
| 2025-12-10 | 메일 본문 저장 방식: TBD 추가 |
| 2025-12-10 | Frontend 배포: Vercel 확정 |
| 2025-12-10 | Backend 배포: Railway 확정 |
| 2025-12-10 | Next.js 라우터: App Router 확정 |
| 2025-12-10 | Database: MySQL → PostgreSQL로 변경 (JSONB, ArrayField 활용) |
| 2025-12-10 | 메일 본문 저장: 하이브리드 방식 확정 (HTML 저장 + 이미지/첨부 참조) |

---

## 요약

### 확정된 결정사항 (22개)
- **Backend**: Django
- **Frontend**: Next.js + TypeScript + App Router
- **Database**: PostgreSQL
- **LLM**: Gemini 2.5 Flash + LangChain
- **CSS**: Tailwind CSS
- **상태관리**: Zustand
- **메일 연동**: Gmail API (OAuth2)
- **동기화 범위**: 6개월
- **배치 크기**: 20개
- **알림**: Web Notification API
- **폴더 깊이**: 최대 5단계
- **폴링 주기**: 3분
- **분류 방식**: 즉시 1개씩
- **분류 실패**: 1회 재시도 후 미분류
- **API 관리**: 단순 Rate Limiting
- **동기화 대상**: 받은편지함만
- **초기 UX**: 즉시 메인화면
- **Frontend 배포**: Vercel
- **Backend 배포**: Railway
- **메일 본문 저장**: 하이브리드 (HTML 저장 + 이미지/첨부 참조)
- **API 문서화**: Swagger (drf-spectacular)

### 미정 사항
**모든 결정사항 확정 완료!** 🎉

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*

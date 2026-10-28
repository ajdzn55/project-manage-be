## ProjectHub Backend

### 📌 프로젝트 소개

ProjectHub는 프로젝트, 작업, 구성원을 한곳에서 관리하는 협업 서비스입니다.

이 저장소는 ProjectHub의 인증, 사용자, 프로젝트, 구성원 및 작업 데이터를 관리하는 REST API 서버입니다.

### ✨ 주요 기능

- HttpOnly 쿠키 기반 JWT 회원가입·로그인·로그아웃 및 토큰 재발급
- 사용자 정보 및 마감 임박 작업 알림 확인 시각 관리
- 프로젝트 생성·조회·수정·삭제와 이름·상태·생성자 기반 검색
- 프로젝트 구성원 및 역할 관리
- 프로젝트별 작업 진행률, 상태별 작업 건수 및 일별 완료 건수 집계
- 작업 생성·조회·수정·삭제와 프로젝트·담당자·마감 월 기반 조회
- 작업 담당자 지정 시 프로젝트 구성원 자동 등록

### 🛠 기술 스택

- **Language:** TypeScript
- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **API Docs:** Swagger
- **Test:** Jest

### 💻 실행 방법

#### 사전 요구사항

- Node.js 22.23.4 이상, 23 미만
- npm
- PostgreSQL

#### 설치 및 환경 변수 설정

```bash
git clone https://github.com/ajdzn55/project-manage-be.git
cd project-manage-be
npm install
cp .env.example .env.development
```

`.env.development`에 아래 값을 설정합니다.

```dotenv
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
DB_HOST=localhost
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

#### 데이터베이스 및 서버 실행

```bash
npm run migration:run
npm run start:dev
```

- API: [http://localhost:3001/api](http://localhost:3001/api)
- Swagger: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

### 🚀 배포

- **Production:** [https://project-manage-be.onrender.com](https://project-manage-be.onrender.com)
- **API Endpoint:** [https://project-manage-be.onrender.com/api](https://project-manage-be.onrender.com/api)
- **Platform:** Render
- **Database:** Supabase
- **CI:** GitHub Actions
- **CD:** Render Deploy Hook
- **Deployment Trigger:** `master` 브랜치 push 후 CI 성공 시 Render Deploy Hook을 호출하여 배포
- **Environment Variables:** Render 서비스 설정 및 GitHub Actions Secrets에서 관리
- **Monitoring:** UptimeRobot을 통해 백엔드 및 데이터베이스 연결 상태를 주기적으로 확인
- **Workflow:** [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

#### 배포 흐름

```text
dev → master Pull Request 생성
        ↓
CI 검사 및 Pull Request 승인
        ↓
Pull Request 병합 → master 브랜치 push
        ↓
CI 재검사
        ↓
Render Deploy Hook 호출
        ↓
Render 운영 환경 배포
```

#### Health Check

UptimeRobot이 [백엔드 API 엔드포인트](https://project-manage-be.onrender.com/api)를 주기적으로 호출합니다.

Health Check는 TypeORM을 통한 PostgreSQL `SELECT 1` 쿼리와 Supabase API의 `health_check` RPC를 모두 호출해 데이터베이스 직접 연결과 API 경로를 확인합니다. 하나라도 실패하면 `503 Service Unavailable`을 반환합니다.

### 🧪 테스트 및 검증

```bash
npm test
```

CI에서는 ESLint, Jest 단위 테스트, 프로덕션 빌드를 순서대로 실행하며, 모든 검사가 성공한 경우에만 운영 배포를 요청합니다.

### 📁 폴더 구조

```text
src/
├── auth/            # 인증 및 JWT
├── user/            # 사용자 관리
├── project/         # 프로젝트 관리
├── project-member/  # 프로젝트 구성원 관리
├── task/            # 작업 관리
├── config/          # 데이터베이스 설정
├── migrations/      # 데이터베이스 마이그레이션
└── common/          # 공통 데코레이터, 타입 및 유틸리티
```

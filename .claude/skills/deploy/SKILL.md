---
name: deploy
description: Build, commit, and deploy The Curator to Vercel production. Run this when you want to ship changes.
disable-model-invocation: true
---

# Deploy to Production

The Curator를 Vercel 프로덕션에 배포한다.

## 배포 절차

### 1. 빌드 검증
```bash
npm run build
```
빌드 실패 시 에러를 수정하고 재시도. 배포 진행 금지.

### 2. 변경사항 확인
```bash
git status
git diff --stat
```

### 3. 커밋 (스테이징되지 않은 변경사항이 있는 경우)
```bash
git add <관련 파일들>
git commit -m "적절한 커밋 메시지"
```

### 4. Vercel 프로덕션 배포
```bash
vercel --prod --yes
```

### 5. 배포 완료 확인
배포 URL을 출력하고 성공 여부를 알려줄 것.

## 배포 URL
- Production: https://the-curator-virid.vercel.app
- Vercel Dashboard: https://vercel.com/limhyojuns-projects/the-curator

## 환경변수 확인 (배포 전)
Vercel에 설정된 환경변수 목록 (`.env.local`과 동일해야 함):
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_MODE`

## 주의
- `.env.local`은 절대 커밋하지 말 것 (`.gitignore`에 포함됨)
- `PAYPAL_MODE=live` 확인 (sandbox가 아닌지 체크)

지금 바로 빌드부터 시작할 것.

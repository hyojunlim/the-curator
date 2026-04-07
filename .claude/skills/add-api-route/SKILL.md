---
name: add-api-route
description: Scaffold a new Next.js API route with The Curator's standard boilerplate (Clerk auth, rate limit, subscription check). Use when creating any new API endpoint.
disable-model-invocation: true
argument-hint: [route-path] [GET|POST|PATCH|DELETE]
---

# New API Route: $ARGUMENTS

이 프로젝트의 표준 패턴으로 `src/app/api/$ARGUMENTS/route.ts`를 생성한다.

## 표준 패턴 (항상 따를 것)

```typescript
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { getSubscription } from "@/lib/subscription";
import { supabaseAdmin } from "@/lib/supabase";
import { PLAN_FEATURES } from "@/lib/config";

export async function POST(request: Request) {
  // 1. Clerk 인증
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Rate limit
  const rl = checkRateLimit(userId);
  if (!rl.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  // 3. 구독 조회 (plan-gated 기능인 경우)
  const usage = await getSubscription(userId);
  if (!PLAN_FEATURES[usage.plan].search) { // feature 이름 변경
    return Response.json({ error: "Upgrade required" }, { status: 403 });
  }

  // 4. 비즈니스 로직
  // TODO: 구현

  // 5. Supabase 쿼리
  const { data, error } = await supabaseAdmin
    .from("contracts")
    .select("*")
    .eq("user_id", userId);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json(data);
}
```

## 체크리스트
- [ ] `auth()`로 userId 확인
- [ ] `checkRateLimit(userId)` 호출
- [ ] plan-gated 기능이면 `PLAN_FEATURES[plan]` 체크
- [ ] Supabase 쿼리에 항상 `.eq("user_id", userId)` 포함 (다른 유저 데이터 차단)
- [ ] 에러 핸들링: 401 / 429 / 403 / 500

## 인수 파싱
- `$ARGUMENTS`의 첫 번째 단어 = 라우트 경로 (예: `contracts/export`)
- `$ARGUMENTS`의 나머지 = HTTP 메서드들 (예: `GET POST`)

라우트 파일을 생성하고, 필요한 plan feature가 `src/lib/config.ts`의 `PLAN_FEATURES`에 없으면 추가까지 제안할 것.

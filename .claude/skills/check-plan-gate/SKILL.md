---
name: check-plan-gate
description: Audit the codebase for missing subscription plan gates. Checks that every plan-gated feature in config.ts is actually enforced in both API routes and UI components.
disable-model-invocation: true
---

# Plan Gate Audit

`src/lib/config.ts`의 `PLAN_FEATURES`에 선언된 기능이 실제로 적용되어 있는지 전수 감사한다.

## 감사 절차

### 1. config.ts에서 plan-gated 기능 목록 추출
`src/lib/config.ts`를 읽어 `PLAN_FEATURES` 객체에서 free/pro/business 간 값이 다른 모든 키를 추출:
```
search, pdfExport, sharing, priorityProcessing, historyDays, analysisLimit, languages
```

### 2. API Route 감사
`src/app/api/` 아래 모든 route.ts 파일을 검사:
- `PLAN_FEATURES[usage.plan].<feature>` 체크가 있는가?
- `checkUsage()` / `getSubscription()` 호출 없이 민감한 작업을 하는 route는 없는가?
- plan-gated이어야 하는데 인증만 하고 plan 체크를 빠뜨린 route가 있는가?

### 3. UI 컴포넌트 감사
`src/app/` 아래 page.tsx 파일들과 `src/components/` 를 검사:
- `sub?.plan`으로 기능을 조건부 렌더링하는가?
- lock 아이콘(`lock`)을 보여줘야 하는데 안 보여주는 기능은?
- `useSubscription()`을 import하지 않는 페이지에 plan-gated UI가 있는가?

### 4. 보고서 출력
다음 형식으로 출력:

```
=== PLAN GATE AUDIT REPORT ===

✅ 정상 적용된 기능:
  - search: API(api/search/route.ts) + UI(history/page.tsx) ✓
  - ...

⚠️ 누락 또는 불완전:
  - [기능명]: API에서 체크 없음 → api/XXX/route.ts 수정 필요
  - [기능명]: UI에 lock 없음 → page.tsx 수정 필요

🔴 심각 (API 무방어):
  - [기능명]: plan 체크 없이 데이터 반환 중
```

### 5. 수정 제안
발견된 문제에 대해 구체적인 코드 수정을 제안할 것.

## 참고 파일
- `src/lib/config.ts` → `PLAN_FEATURES` 정의
- `src/hooks/useSubscription.ts` → 클라이언트 구독 훅
- `src/lib/subscription.ts` → 서버 구독 조회

지금 바로 전체 감사를 시작할 것.

---
name: add-page
description: Scaffold a new authenticated app page with The Curator's standard layout shell (AppSidebar, AppFooter, subscription hook, mobile offset). Use when adding any new page under /dashboard area.
disable-model-invocation: true
argument-hint: [route-name] [description]
---

# New Authenticated Page: $ARGUMENTS

`src/app/$ARGUMENTS/page.tsx`를 이 프로젝트의 정확한 레이아웃 쉘로 생성한다.

## 표준 페이지 쉘 (항상 이 구조 사용)

```typescript
"use client";

import { useState, useEffect } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import { useSubscription } from "@/hooks/useSubscription";

export default function [PageName]Page() {
  const { sub, loading: subLoading } = useSubscription();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 데이터 페치
  }, []);

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <AppSidebar />

      <div className="ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline font-extrabold text-2xl text-on-surface">
            Page Title
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Subtitle
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-surface-container-high rounded-xl" />
            <div className="h-32 bg-surface-container-high rounded-xl" />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="space-y-6">
            {/* TODO: 내용 */}
          </div>
        )}
      </div>

      <AppFooter />
    </div>
  );
}
```

## 중요 클래스 (절대 바꾸지 말 것)
- 외부: `flex min-h-screen bg-surface font-body text-on-surface`
- 콘텐츠: `ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-20`
  - `ml-0 lg:ml-64` = 사이드바 오프셋 (모바일 0, 데스크탑 64)
  - `pt-16 lg:pt-6` = 모바일 햄버거 버튼 공간 확보

## Plan Gate (구독 필요한 페이지)
```typescript
if (!subLoading && sub?.plan === "free") {
  return (
    <div className="ml-0 lg:ml-64 flex-1 flex items-center justify-center p-10">
      <div className="text-center">
        <p className="font-headline font-bold text-on-surface mb-2">Pro Required</p>
        <p className="text-sm text-on-surface-variant">Upgrade to access this feature.</p>
      </div>
    </div>
  );
}
```

인수에서 라우트 경로와 설명을 파악해 적절한 파일을 생성할 것.
`src/app/` 아래 AppSidebar도 추가하려면 `src/components/layout/AppSidebar.tsx`의 `navItems`에도 추가 제안할 것.

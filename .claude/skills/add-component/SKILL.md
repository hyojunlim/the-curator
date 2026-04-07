---
name: add-component
description: Scaffold a new React component using The Curator's MD3 design token conventions. Use when creating any new UI component to avoid using raw hex/Tailwind colors instead of the project's token system.
disable-model-invocation: true
argument-hint: [ComponentName] [ui|layout|results]
---

# New Component: $ARGUMENTS

`src/components/[category]/[ComponentName].tsx`를 이 프로젝트의 MD3 디자인 토큰으로 생성한다.

## MD3 토큰 레퍼런스 (절대 hex나 blue-500 같은 raw color 사용 금지)

### 색상 토큰 (Tailwind 유틸리티)
```
배경/표면:
  bg-surface              → 페이지 배경
  bg-surface-container-lowest → 카드 (가장 밝음)
  bg-surface-container-low    → 섹션 배경
  bg-surface-container        → 중간
  bg-surface-container-high   → 비활성/disabled
  bg-surface-container-highest → 가장 진한 컨테이너

텍스트:
  text-on-surface         → 주요 텍스트
  text-on-surface-variant → 보조 텍스트 (설명, 라벨)
  text-primary            → 강조/링크
  text-secondary          → 성공/완료
  text-error              → 에러/위험

테두리:
  border-outline-variant/15  → 미묘한 구분선
  border-outline-variant/30  → 기본 테두리
  border-primary             → 선택된 상태

브랜드:
  bg-primary / text-primary  → 주요 액션
  bg-primary/10              → 연한 primary 배경
  bg-primary-fixed/30        → 아이콘 배경 (연한 파랑)
  bg-error / text-error      → 위험/삭제
  bg-error-container/30      → 에러 메시지 배경
```

### 인터랙션 패턴
```
호버: hover:opacity-90 (그라디언트 버튼) / hover:bg-surface-container-high (일반 버튼)
포커스: focus:ring-2 focus:ring-primary/20
전환: transition-all transition-colors
```

### 아이콘 시스템 (Material Symbols)
```tsx
<span className="material-symbols-outlined text-[20px] text-primary">icon_name</span>
// FILL 효과:
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
```

### 버튼 패턴
```tsx
// Primary (그라디언트)
<button className="btn-primary-gradient text-white font-headline font-bold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-all">

// Secondary (테두리)
<button className="border border-outline-variant/30 text-on-surface hover:bg-surface-container-high text-sm font-medium px-4 py-2 rounded-lg transition-colors">

// Danger
<button className="border border-error/30 text-error hover:bg-error/5 text-sm font-bold px-4 py-2 rounded-lg transition-colors">
```

### 카드 패턴
```tsx
<div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
  {/* 콘텐츠 */}
</div>
```

### 폰트
```
font-headline font-bold   → 헤드라인
font-headline font-extrabold → 큰 제목
font-body (default)       → 본문
text-xs / text-sm / text-base / text-lg / text-xl
```

## 컴포넌트 카테고리
- `ui/` → 재사용 가능한 UI 원자 (버튼, 배너, 모달)
- `layout/` → 레이아웃 구조 (사이드바, 네비게이션)
- `results/` → 분석 결과 표시 컴포넌트

인수에서 컴포넌트 이름과 카테고리를 파악해서 적절한 폴더에 파일을 생성할 것.
다크모드(`dark:`)는 별도로 추가하지 않아도 됨 — 토큰이 자동으로 처리함.

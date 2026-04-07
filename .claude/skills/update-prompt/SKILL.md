---
name: update-prompt
description: Safely edit the Gemini analysis prompt in src/lib/prompts.ts while keeping the TypeScript types in sync. Use when changing AI output behavior, adding new fields, or tuning risk analysis quality.
disable-model-invocation: true
argument-hint: [description of desired change]
---

# Update Gemini Prompt: $ARGUMENTS

`src/lib/prompts.ts`의 `GEMINI_PROMPT`를 안전하게 수정한다.
반드시 `src/types/index.ts`의 타입과 동기화를 맞춰야 한다.

## 현재 JSON 스키마 계약

Gemini가 반환해야 하는 JSON 구조:
```typescript
{
  risk_score: number,        // 0-100
  summary: string,
  parties: [
    { role: "party_a"|"party_b", name: string, description: string }
  ],
  risks: [
    {
      title: string,
      clause: string,
      explanation: string,
      severity: "high"|"medium"|"low",
      suggestion: string,
      suggestion_party_a: string,
      suggestion_party_b: string,
      rewrite: string
    }
  ]
}
```

## 프롬프트 수정 전 체크리스트
1. **타입 동기화**: 새 필드 추가 시 `src/types/index.ts`의 `RiskItem` 또는 `AnalysisResult` 인터페이스도 업데이트
2. **파싱 가드**: `src/lib/gemini.ts`의 `parseResponse()`가 새 필드를 처리할 수 있는지 확인
3. **하위 호환**: 기존에 저장된 계약서 결과(DB의 result JSONB)와 호환되는가?
4. **선택적 필드**: 새 필드는 `optional`(`?`)로 추가해야 기존 데이터가 깨지지 않음

## 수정 절차

1. `src/lib/prompts.ts` 읽기
2. `src/types/index.ts` 읽기
3. `src/lib/gemini.ts`의 `parseResponse()` 확인
4. `$ARGUMENTS`의 요구사항에 맞게 프롬프트 수정
5. 타입 변경이 필요하면 `src/types/index.ts`도 함께 수정
6. `parseResponse()`에 새 필드 처리가 필요하면 `src/lib/gemini.ts`도 수정
7. 변경 사항 요약 출력

## 자주 하는 수정 유형

### 심각도 기준 강화
```
// prompts.ts에서 severity 기준 수정:
high: ... → 더 구체적인 조건
```

### 새 분석 필드 추가
```typescript
// types/index.ts
export interface RiskItem {
  // 기존 필드들...
  new_field?: string; // optional로 추가
}
```

### 언어/톤 변경
- 프롬프트에서 "plain English" 지침 수정

## 주의
- `responseMimeType: "application/json"`이 설정되어 있으므로 Gemini는 JSON만 반환
- `temperature: 0`으로 설정됨 — 결정적 출력
- 프롬프트 마지막에 반드시 "Return ONLY valid JSON" 지시 유지

지금 `src/lib/prompts.ts`와 `src/types/index.ts`를 읽고 `$ARGUMENTS`의 변경사항을 적용할 것.

# voicenote-ai

Expo + tRPC ボイスメモアプリ

## Entry Points
- Client: `app/_layout.tsx`
- Server: `apps/server/_core/index.ts`

## Structure
```
app/               # Expo Router pages (クライアント)
  (tabs)/          # Tab navigation (record, index, settings)
  note/[id]        # Note detail
apps/              # 実行可能アプリケーション
  server/          # tRPC backend
    _core/         # Framework (trpc, llm)
    routers.ts     # API routes
packages/          # 共有ライブラリ
  components/      # UI components
  hooks/           # React hooks
  lib/             # Client utilities
  types/           # Type definitions
  constants/       # Constants
  infra/           # Terraform IaC
```

## Tech Stack
- Expo 54 + React Native 0.81
- tRPC 11 + Express
- ElevenLabs STT, Gemini AI

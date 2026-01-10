# ADR-001: Explore Agentトークン消費最適化

## Status
Accepted

## Context

Claude Codeの~/.claude/debugセッションログを分析した結果、Explore Agent（haiku）の呼び出しパターンにおいて以下の課題が特定された：

### 分析データ

**トークン消費パターン（サンプル分析）**:
- システムプロンプトキャッシュ作成: 約14,000トークン（初回）
- キャッシュ再利用時: 大幅削減（cache_read_input_tokensで確認）
- シングルターンセッションが大多数（turns=1）

**ツール使用パターン（典型的なExploreセッション）**:
- Read: 17回
- Grep: 11回
- Glob: 4回
- Bash: 1回

**課題**:
1. キャッシュ再利用率が低い（セッション間でキャッシュが失効）
2. Read呼び出し回数が多い（17ファイル読み込みの例）
3. CLAUDE.mdが毎回全体ロードされる（lazy load未対応）
4. フォルダ構造が探索効率を考慮していない

## Decision

以下の最適化を採用する：

### 1. CLAUDE.mdのlazy load構造化

```
~/.claude/CLAUDE.md           # 常にロード（最小限）
~/.claude/contexts/
  llm.md                      # LLM接続情報（必要時のみ）
  git.md                      # Git操作規約
  web.md                      # Web取得規約
```

**理由**: 毎セッション約27行（1.3KB）のCLAUDE.mdがロードされるが、多くのセッションでは全情報が不要

### 2. プロジェクト構造の標準化

```
.claude/
  CLAUDE.md                   # プロジェクト固有の指示（簡潔に）
  contexts/                   # 詳細情報（lazy load）
    architecture.md
    api.md
```

### 3. ファイル読み込みカバレッジの改善

Explore Agentが効率的にファイルを特定できるよう：
- エントリーポイントを明示（CLAUDE.mdに記載）
- ディレクトリ構造の説明を追加

## Consequences

### Positive
- トークン消費の削減（推定20-30%）
- キャッシュヒット率の向上
- Explore Agent探索効率の改善

### Negative
- 初期設定の手間が増加
- contexts/の管理が必要

### Neutral
- 既存プロジェクトへの影響なし（後方互換）

## Metrics

効果測定のため以下を監視：
- セッションあたりの平均トークン消費
- Read呼び出し回数/探索タスク
- cache_read_input_tokens / cache_creation_input_tokens比率

## Baseline Measurement (2026-01-10)

**分析対象**: ~/.claude/debug/ (3,675ファイル, 102MB)

**サブエージェントログ分析**:
| ファイルサイズ | 数 | 備考 |
|-------------|---|------|
| >500KB | 2 | 長時間探索タスク |
| 100-500KB | 多数 | 一般的な探索 |
| <10KB | 多数 | シングルターンセッション |

**トークン消費サンプル（38ターンセッション）**:
- input_tokens合計: 6,603
- output_tokens合計: 965
- cache_creation: 120,284
- cache_read: 614,693
- キャッシュ効率: 83.6%

**deslop適用度**: 現コードベースはクリーンでslop率は低い

## Implementation Log

- 2026-01-10: ADR作成、~/.claude/contexts/にllm.md, web.mdを分離
- CLAUDE.md縮小: 27行 → 6行（約78%削減）

## Experiment: 2026-01-11

### 実験内容
Explore Agentを実行し、トークン消費パターンを検証

### 実験条件
- タスク: 「voicenote-aiプロジェクトのアーキテクチャ調査」
- 調査項目: エントリーポイント、ディレクトリ構造、技術スタック、サーバー/クライアント関係

### 結果

**ツール使用回数**:
- Read: 3-4回（効率的）
- Bash: 多数（ディレクトリ探索で多用）
- Grep: 0回

**発見した新しい課題**:

1. **出力の冗長性（最大の問題）**
   - 要求4項目に対し、7セクション+テーブル+図+コード例を出力
   - 出力文字数: 約7,000文字
   - output_tokensが過大

2. **プロジェクトCLAUDE.mdの不在**
   - Explore Agentが毎回Bashでディレクトリ構造を確認
   - 事前にCLAUDE.mdで構造を提供すれば探索効率向上

### 改善策

1. **プロジェクトCLAUDE.md作成**
   - エントリーポイント明示
   - ディレクトリ構造の説明
   - 主要技術の列挙

2. **Explore Agentへの出力指示改善**（Claude Code側の改善が必要）
   - 簡潔な回答を要求
   - 表形式を避ける

### 再実験結果（CLAUDE.md追加後）

**変更内容:**
1. `.claude/CLAUDE.md`作成（30行、エントリーポイント・構造・技術スタック）
2. プロンプトに「簡潔に回答してください」を追加

**効果:**
| 項目 | Before | After | 改善率 |
|------|--------|-------|--------|
| 出力文字数 | 約7,000文字 | 約1,500文字 | **78%削減** |
| 出力セクション数 | 7 | 4 | 43%削減 |
| テーブル/図 | 多数 | なし | 100%削減 |

**結論:**
- プロンプトでの簡潔さ指示が最も効果的
- CLAUDE.mdはExplore Agentのナビゲーション効率を向上
- 出力トークン削減は78%達成

### Status: PUSH
効果が確認できたため、この変更をpushする

## Experiment: 2026-01-11 (追加実験)

### 実験内容
CLAUDE.md構造変更によるトークン削減効果の検証

### 変更内容
- Quick Reference表を追加（主要機能とファイルの対応表）
- Structureセクションを削除してファイルサイズ削減

### 結果

**ツール呼び出し:**
- Read/Glob/Grep呼び出し: 14回 → 4回に減少

**トークン消費:**
- 総トークン消費は増加（約30K → 約62K tokens）
- 原因：セッション長が延長（60 messages → 144 messages）

**deslop評価:**
- Quick Reference表の追加は有用
- Structureセクションの削除は**過度な最適化**
- 元のStructure情報はプロジェクト理解に必要

### 結論

1. **CLAUDE.md圧縮の効果は限定的**
   - ファイルサイズ削減によるトークン削減効果は小さい
   - 情報の欠落はExplore Agentの探索効率を下げる可能性

2. **最も効果的なアプローチ**
   - プロンプトでの「簡潔に回答」指示
   - 適切な情報量を持つCLAUDE.mdの維持

3. **CLAUDE.mdのベストプラクティス**
   - Entry Points: 必須
   - Structure: 必須（探索効率向上）
   - Tech Stack: 必須（技術選定の理解）
   - 過度な圧縮・省略は避ける

### Status: REVERT
効果が確認できなかったため、CLAUDE.md変更をrevert

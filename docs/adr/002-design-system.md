# ADR-002: Indigoベースモダンデザインシステム

## Status
Accepted

## Context

Expo + React Nativeボイスメモアプリにおいて、一貫性のあるUI/UXを実現するためのデザインシステムが必要。

### 要件
- ライト/ダークモード対応
- iOS/Android/Webでの一貫したスタイル
- NativeWindによるTailwind CSSライクなスタイリング
- Single Source of Truth（SSOT）によるカラー管理

### 参考にしたプロダクト
- **Apple Voice Memos**: 録音UIの直感性、波形表示
- **Linear**: 余白設計、タイポグラフィ重視
- **Vercel**: 黒/白コントラスト、ミニマルなボーダー
- **shadcn/ui**: コンポーネント構造、variantパターン

## Decision

**Indigoをアクセントカラーとしたモダン・ミニマルデザイン**を採用。

### デザイン原則（Design Principles）

| 原則 | 説明 | 実装例 |
|------|------|--------|
| **1. コンテンツファースト** | UIよりコンテンツを目立たせる | 背景は`#FFFFFF`/`#0F172A`でニュートラル |
| **2. 余白で区切る** | 線やボーダーより余白で要素を分離 | `p-4`, `gap-3`を多用、border最小限 |
| **3. 控えめなアクセント** | Indigoはインタラクティブ要素のみ | ボタン、アクティブタブ、録音中のみ |
| **4. 触覚フィードバック** | 操作感を重視、タップに即応 | HapticTab、録音ボタンで振動 |
| **5. プラットフォーム準拠** | iOS/Android各プラットフォームらしさ | SF Symbols、システムフォント |
| **6. ステート明示** | 状態をカラーで即座に伝達 | recording=緑、error=赤、warning=黄 |

### 視覚的一貫性ルール

```
角丸（border-radius）
├── カード/コンテナ: rounded-lg (8px)
├── ボタン: rounded-md (6px)
├── バッジ/チップ: rounded-full
└── 入力フィールド: rounded-md (6px)

シャドウ
├── カード: shadow-sm（控えめ）
├── モーダル: shadow-lg
└── フローティングボタン: shadow-md

スペーシング（4px基準）
├── セクション間: 24px (p-6)
├── カード内: 16px (p-4)
├── 要素間: 12px (gap-3)
└── インライン: 8px (gap-2)
```

### カラーパレット

**SSOT**: `theme.config.js`

#### ライトモード
```
// ベース
Background:     #FFFFFF    # 純白ベース
Surface:        #F8FAFC    # カード背景（slate-50）
Foreground:     #0F172A    # テキスト（slate-900）
Muted:          #64748B    # セカンダリテキスト（slate-500）
Border:         #E2E8F0    # ボーダー（slate-200）

// ブランド
Primary:        #6366F1    # Indigo-500（アクセント）
Secondary:      #8B5CF6    # Violet-500（セカンダリアクセント）

// セマンティック
Success:        #22C55E    # 録音中、完了
Warning:        #F59E0B    # ハイライト、注意
Error:          #EF4444    # エラー、削除
```

#### ダークモード
```
// ベース
Background:     #0F172A    # ディープダーク（slate-900）
Surface:        #1E293B    # カード背景（slate-800）
Foreground:     #F8FAFC    # テキスト（slate-50）
Muted:          #94A3B8    # セカンダリテキスト（slate-400）
Border:         #334155    # ボーダー（slate-700）

// ブランド（明度上げ）
Primary:        #818CF8    # Indigo-400
Secondary:      #A78BFA    # Violet-400

// セマンティック（明度上げ）
Success:        #4ADE80    # green-400
Warning:        #FBBF24    # amber-400
Error:          #F87171    # red-400
```

### タイポグラフィ

```typescript
// 階層
H1: text-2xl font-bold     # 24px - 画面タイトル
H2: text-xl font-semibold  # 20px - セクションタイトル
H3: text-lg font-medium    # 18px - カードタイトル
Body: text-base            # 16px - 本文
Caption: text-sm text-muted # 14px - 補足情報
Micro: text-xs text-muted  # 12px - タイムスタンプ

// フォントファミリー（プラットフォーム別）
iOS: system-ui (SF Pro)
Android: normal (Roboto)
Web: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

### コンポーネントバリアント

| Component | バリアント | 用途 |
|-----------|-----------|------|
| **Button** | primary, secondary, ghost, destructive | アクション |
| **Badge** | default, success, warning, error | ステータス表示 |
| **Card** | default, interactive | コンテナ |
| **Input** | default, error | フォーム入力 |

### アーキテクチャ

```
theme.config.js              # SSOT: カラートークン定義
    │
    ├── tailwind.config.js   # NativeWind注入
    │   └── CSS変数化 → bg-primary, text-foreground等
    │
    └── packages/lib/_core/theme.ts   # ランタイムユーティリティ
        └── Colors.light/dark → StyleSheet用
```

### 共有コンポーネント (`packages/components/`)

| Component | 説明 | Props |
|-----------|------|-------|
| `ScreenContainer` | SafeArea + 背景統合ラッパー | edges, className |
| `ThemedView` | テーマ対応View | className |
| `HapticTab` | 触覚フィードバック付きタブ | - |
| `IconSymbol` | SF Symbolsアイコン | name, size, color |
| `GlobalRecordingBar` | 録音状態バー | - |

### スタイリング方針

| 用途 | 方法 | 例 |
|------|------|-----|
| 静的スタイル | NativeWind className | `className="bg-primary text-foreground"` |
| 動的スタイル | Colors定数 | `style={{ color: Colors[scheme].primary }}` |
| 条件付きスタイル | cn()ユーティリティ | `cn("p-4", isActive && "bg-surface")` |

### コンポーネント設計原則

```typescript
// ✅ 推奨パターン
interface Props {
  className?: string;  // 拡張用
  children?: ReactNode;
}

export function Component({ className, children }: Props) {
  return (
    <View className={cn(
      "bg-surface rounded-lg p-4",  // デフォルトスタイル
      className                      // オーバーライド可能
    )}>
      {children}
    </View>
  );
}

// ❌ 非推奨
// - inline styleの多用
// - ハードコードされた色
// - classNameを受け取らない
```

## Consequences

### Positive
- **一貫性**: 全画面で統一されたビジュアル言語
- **保守性**: カラー変更は`theme.config.js`のみ
- **拡張性**: NativeWindでTailwindエコシステム活用
- **アクセシビリティ**: 適切なコントラスト比確保
- **プラットフォーム感**: システムフォント・SF Symbols使用

### Negative
- NativeWindの学習コスト
- 複雑なアニメーションはStyleSheet必要
- Web版でのスタイル差異の可能性

## Usage Examples

```tsx
// 画面レイアウト
<ScreenContainer className="p-4">
  <Text className="text-2xl font-bold text-foreground">
    ノート一覧
  </Text>
  <Text className="text-sm text-muted">
    12件のメモ
  </Text>
</ScreenContainer>

// インタラクティブカード
<Pressable
  className={cn(
    "p-4 rounded-lg bg-surface",
    "active:bg-surface/80",
    isSelected && "border-2 border-primary"
  )}
>
  <Text className="text-foreground font-medium">{title}</Text>
  <Text className="text-xs text-muted">{date}</Text>
</Pressable>

// ステータスバッジ
<View className="px-2 py-1 rounded-full bg-success/20">
  <Text className="text-xs text-success font-medium">録音完了</Text>
</View>
```

## File Structure

```
theme.config.js                    # SSOT: カラートークン
tailwind.config.js                 # Tailwind/NativeWind設定
global.css                         # Tailwindベース読み込み
packages/
  lib/_core/theme.ts               # ランタイムカラー
  constants/theme.ts               # 再エクスポート
  components/
    screen-container.tsx           # スクリーンラッパー
    themed-view.tsx                # テーマ対応View
    haptic-tab.tsx                 # タブコンポーネント
    global-recording-bar.tsx       # 録音バー
    ui/icon-symbol.tsx             # アイコン
```

## References

- NativeWind: https://www.nativewind.dev/
- Tailwind CSS: https://tailwindcss.com/
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- Material Design 3: https://m3.material.io/

/**
 * リアルタイム翻訳フック
 *
 * 文字起こしセグメントを受け取り、設定された言語に翻訳します。
 * - Debounce: partialテキストの頻繁な更新を制御
 * - バッチ処理: 複数セグメントをまとめて翻訳
 * - キャッシュ: 翻訳済みテキストの再利用
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { trpc } from "@/packages/lib/trpc";
import type {
  TranscriptSegment,
  TranslationStatus,
} from "@/packages/types/realtime-transcription";

interface UseRealtimeTranslationOptions {
  enabled: boolean;
  targetLanguage: string;
  debounceMs?: number;
  batchDelayMs?: number;
}

interface TranslationState {
  translations: Map<string, string>;
  pendingIds: Set<string>;
  errors: Map<string, string>;
}

export function useRealtimeTranslation(options: UseRealtimeTranslationOptions) {
  const {
    enabled,
    targetLanguage,
    debounceMs = 500,
    batchDelayMs = 300,
  } = options;

  const [state, setState] = useState<TranslationState>({
    translations: new Map(),
    pendingIds: new Set(),
    errors: new Map(),
  });

  const translateMutation = trpc.ai.translate.useMutation();

  // キャッシュ: テキスト -> 翻訳結果
  const cacheRef = useRef<Map<string, string>>(new Map());

  // Debounce用タイマー
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // バッチ処理用キュー
  const pendingQueueRef = useRef<{ id: string; text: string }[]>([]);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // バッチ翻訳を実行
  const executeBatchTranslation = useCallback(async () => {
    if (!enabled || pendingQueueRef.current.length === 0) return;

    const batch = [...pendingQueueRef.current];
    pendingQueueRef.current = [];

    // キャッシュヒットをフィルタ
    const uncachedItems = batch.filter(
      (item) => !cacheRef.current.has(item.text)
    );

    // キャッシュヒットした翻訳を即座に適用
    const cachedTranslations = new Map<string, string>();
    batch.forEach((item) => {
      const cached = cacheRef.current.get(item.text);
      if (cached) {
        cachedTranslations.set(item.id, cached);
      }
    });

    if (cachedTranslations.size > 0) {
      setState((prev) => {
        const newTranslations = new Map(prev.translations);
        const newPending = new Set(prev.pendingIds);
        cachedTranslations.forEach((text, id) => {
          newTranslations.set(id, text);
          newPending.delete(id);
        });
        return { ...prev, translations: newTranslations, pendingIds: newPending };
      });
    }

    // 未キャッシュのみAPI呼び出し
    if (uncachedItems.length === 0) return;

    try {
      const result = await translateMutation.mutateAsync({
        texts: uncachedItems,
        targetLanguage,
      });

      // キャッシュ更新 & 状態更新
      setState((prev) => {
        const newTranslations = new Map(prev.translations);
        const newPending = new Set(prev.pendingIds);

        result.translations.forEach((t) => {
          newTranslations.set(t.id, t.translatedText);
          newPending.delete(t.id);

          // 元テキストでキャッシュ
          const originalItem = uncachedItems.find((i) => i.id === t.id);
          if (originalItem) {
            cacheRef.current.set(originalItem.text, t.translatedText);
          }
        });

        return { ...prev, translations: newTranslations, pendingIds: newPending };
      });
    } catch (error) {
      console.error("[useRealtimeTranslation] Translation error:", error);
      setState((prev) => {
        const newErrors = new Map(prev.errors);
        const newPending = new Set(prev.pendingIds);
        uncachedItems.forEach((item) => {
          newErrors.set(item.id, "Translation failed");
          newPending.delete(item.id);
        });
        return { ...prev, errors: newErrors, pendingIds: newPending };
      });
    }
  }, [enabled, targetLanguage, translateMutation]);

  // セグメントを翻訳キューに追加
  const queueTranslation = useCallback(
    (segment: TranscriptSegment) => {
      if (!enabled || !segment.text.trim()) return;

      // pending状態に追加
      setState((prev) => {
        const newPending = new Set(prev.pendingIds);
        newPending.add(segment.id);
        return { ...prev, pendingIds: newPending };
      });

      // キューに追加
      pendingQueueRef.current.push({ id: segment.id, text: segment.text });

      // バッチタイマーをリセット
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
      batchTimerRef.current = setTimeout(executeBatchTranslation, batchDelayMs);
    },
    [enabled, batchDelayMs, executeBatchTranslation]
  );

  // Debounced翻訳 (partialテキスト用)
  const translatePartial = useCallback(
    (segment: TranscriptSegment) => {
      console.log('[useRealtimeTranslation] translatePartial called:', { enabled, segment: segment.text.substring(0, 30) });
      if (!enabled) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        queueTranslation(segment);
      }, debounceMs);
    },
    [enabled, debounceMs, queueTranslation]
  );

  // 即座に翻訳 (committedテキスト用)
  const translateCommitted = useCallback(
    (segment: TranscriptSegment) => {
      console.log('[useRealtimeTranslation] translateCommitted called:', { enabled, segment: segment.text.substring(0, 30) });
      if (!enabled) return;
      queueTranslation(segment);
    },
    [enabled, queueTranslation]
  );

  // セグメントの翻訳テキストを取得
  const getTranslation = useCallback(
    (segmentId: string): string | undefined => {
      return state.translations.get(segmentId);
    },
    [state.translations]
  );

  // セグメントの翻訳ステータスを取得
  const getTranslationStatus = useCallback(
    (segmentId: string): TranslationStatus | undefined => {
      if (state.pendingIds.has(segmentId)) return "pending";
      if (state.errors.has(segmentId)) return "error";
      if (state.translations.has(segmentId)) return "completed";
      return undefined;
    },
    [state]
  );

  // キャッシュクリア
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    setState({
      translations: new Map(),
      pendingIds: new Set(),
      errors: new Map(),
    });
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
    };
  }, []);

  // targetLanguageが変わったらキャッシュをクリア
  useEffect(() => {
    clearCache();
  }, [targetLanguage, clearCache]);

  return {
    translatePartial,
    translateCommitted,
    getTranslation,
    getTranslationStatus,
    clearCache,
    isTranslating: state.pendingIds.size > 0,
    translations: state.translations,
  };
}

# DIY Cutter アーキテクチャ

## 1. 概要

現行実装は、材料算出に必要なドメインロジックを React UI から分離したシングルページ構成である。
責務は以下の 4 層に分かれる。

- `models`: ドメインデータ型
- `domain`: 材料規格定義、算出ロジック、表示向け集約ロジック
- `services`: 永続化
- `hooks` / `pages` / `components`: UI 状態管理と表示

## 2. ディレクトリ構成

```text
src/
  components/
  domain/
    constants/
    services/
  hooks/
  models/
  pages/
  services/
  styles/
  utils/
```

## 3. 主要モデル

### `src/models/material.ts`

材料規格の基本型を定義する。

- `MaterialTypeId`
- `StockLengthLabel`
- `StockLengthSpec`
- `MaterialSpec`

`MaterialSpec` が規格追加の拡張ポイントであり、UI と算出ロジックの両方で参照される。

### `src/models/materialRequirement.ts`

計算用に正規化済みの必要部材を表す。

- `id`
- `materialType`
- `lengthMm`
- `quantity`

### `src/models/cutPlan.ts`

算出結果の型を定義する。

- `CutPiece`
- `CutPlan`
- `MaterialSummary`
- `OptimizationResult`

### `src/models/materialEstimateSnapshot.ts`

保存用スナップショットを定義する。

- `DraftRequirementSnapshot`
- `MaterialEstimateSnapshot`
- `PersistedMaterialEstimateSnapshot`

## 4. ドメイン定数

### `src/domain/constants/materialSpecs.ts`

材料規格のマスタ定義を保持する。

- `MATERIAL_SPECS`
- `MATERIAL_SPEC_MAP`
- `DEFAULT_KERF_MM`

追加規格は原則このファイルの配列へ追加する。

## 5. ドメインサービス

### `MaterialEstimationService`

配置:
[materialEstimationService.ts](/Users/yamaguchitakumi/DIY_-Cutter/src/domain/services/materialEstimationService.ts)

責務:

- 正規化済み部材入力を受け取る
- 材料種別ごとのサマリーを作る
- 母材長さ選択と刃厚を考慮してカット計画を生成する

主な内部処理:

- 部材を本数分 `CutPiece` に展開
- 長い順ソート
- mixed best-fit 案を作成
- 母材長さ固定順の複数案を作成
- 総端材量と母材本数で最良案を選択

出力:

- `summaries`
- `cutPlans`

### `materialEstimateViewService.ts`

配置:
[materialEstimateViewService.ts](/Users/yamaguchitakumi/DIY_-Cutter/src/domain/services/materialEstimateViewService.ts)

責務:

- UI 入力行の初期値生成
- 下書き入力の正規化
- 表示用の集約データ生成

主な関数:

- `createDraftRequirement`
- `buildDefaultStockSelection`
- `normalizeRequirements`
- `formatGroupedLengths`
- `buildStockAggregates`
- `buildInputAggregates`
- `buildStockByMaterial`

このファイルは UI 専用の整形を持つが、React 依存は持たない。

## 6. 永続化サービス

### `MaterialEstimateStorage`

配置:
[materialEstimateStorage.ts](/Users/yamaguchitakumi/DIY_-Cutter/src/services/materialEstimateStorage.ts)

責務:

- `localStorage` からスナップショット一覧を読込
- スナップショット一覧を保存
- 破損データとバージョン不一致データを無視

保存形式は `version + snapshot` の配列に固定している。

## 7. UI 構成

### エントリ

- [main.tsx](/Users/yamaguchitakumi/DIY_-Cutter/src/main.tsx)
- [App.tsx](/Users/yamaguchitakumi/DIY_-Cutter/src/App.tsx)

`App` は `MaterialEstimatePage` を描画するだけの薄い構成。

### ページ

- [MaterialEstimatePage.tsx](/Users/yamaguchitakumi/DIY_-Cutter/src/pages/MaterialEstimatePage.tsx)

ページ責務:

- ワークスペースフックから状態と操作を受け取る
- 各セクションコンポーネントへ props を受け渡す

### 状態管理

- [useMaterialEstimateWorkspace.ts](/Users/yamaguchitakumi/DIY_-Cutter/src/hooks/useMaterialEstimateWorkspace.ts)

責務:

- 画面状態の保持
- 保存データのロード
- ドメインサービスの呼び出し
- UI イベントに対応する更新関数の提供

保持する主な状態:

- `kerfMm`
- `saveName`
- `requirements`
- `stockSelection`
- `savedSnapshots`

導出値:

- `normalizedRequirements`
- `result`
- `stockAggregates`
- `inputAggregates`
- `stockByMaterial`

### コンポーネント

- [MaterialInputSection.tsx](/Users/yamaguchitakumi/DIY_-Cutter/src/components/MaterialInputSection.tsx)
- [SavedEstimateSection.tsx](/Users/yamaguchitakumi/DIY_-Cutter/src/components/SavedEstimateSection.tsx)
- [MaterialSummarySection.tsx](/Users/yamaguchitakumi/DIY_-Cutter/src/components/MaterialSummarySection.tsx)
- [CutPlanDiagram.tsx](/Users/yamaguchitakumi/DIY_-Cutter/src/components/CutPlanDiagram.tsx)
- [MaterialResultSection.tsx](/Users/yamaguchitakumi/DIY_-Cutter/src/components/MaterialResultSection.tsx)

各コンポーネントは表示とイベント通知に専念し、計算ロジックを持たない。

## 8. データフロー

1. UI で下書き入力を編集する
2. `useMaterialEstimateWorkspace` が状態を保持する
3. `normalizeRequirements` が計算用 `MaterialRequirement[]` を生成する
4. `MaterialEstimationService.estimate` が材料集計とカット計画を返す
5. `materialEstimateViewService` が表示用集約へ整形する
6. ページと各コンポーネントが結果を描画する
7. 保存時は `MaterialEstimateStorage` が LocalStorage へ永続化する

## 9. 設計上の判断

- ドメインロジックは React 非依存に保つ
- UI 入力は文字列のまま保持し、計算前に正規化する
- 材料規格は配列定義で管理し、追加時の変更点を局所化する
- 厳密最適化より、MVP として十分軽いヒューリスティックを優先する
- 保存データはバージョン付きにして将来の移行余地を確保する

## 10. 拡張ポイント

- `MATERIAL_SPECS` への規格追加
- `MaterialEstimationService` の最適化アルゴリズム差し替え
- LocalStorage から外部保存先への置換
- 現在の入力 UI を図面入力 UI へ差し替えるページ拡張

## 11. 現時点の制約

- ルーティングなしの単一ページ構成
- テストコード未整備
- 入力検証は軽量で、ユーザー向けエラー表示は限定的
- カット最適化は厳密解保証を持たない

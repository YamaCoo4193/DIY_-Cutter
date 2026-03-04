# DIY Cutter

公開 URL: https://yamacoo4193.github.io/DIY_-Cutter/

DIY Cutter は、DIY 木工で必要になる「部材整理」「必要材料の見積もり」「カット計画の把握」を 1 画面で行うための Web アプリです。  
必要な部材を入力すると、材料規格ごとの必要本数、端材量、カット図をまとめて確認できます。

現状は MVP として、部材入力から材料算出までを素早く確認できるワークスペースに絞って実装しています。

DIY 初心者でも「何本買えばよいか」「どこで切ればよいか」を把握しやすいことを重視しています。

## スクリーンショット / Screenshots

### メイン画面 / Main Workspace

![DIY Cutter main workspace](./docs/images/main-workspace.png)

### カット図表示 / Cut Plan View

![DIY Cutter cut plan view](./docs/images/cut-plan.png)

### 保存済み結果 / Saved Estimates

![DIY Cutter saved estimates](./docs/images/saved-estimates.png)

`docs/images/` に画像を配置すると、そのまま README に反映できます。

## ひと目でわかること / At a Glance

- 必要部材を入力すると、買うべき母材本数がすぐ分かる
- 刃厚込みで端材量まで確認できる
- カット図で切断順のイメージを持てる
- 保存して案を比較できる

## 機能 / Features

- 必要部材の手入力
- 材料規格ごとの使用可能な母材長さの選択
- 刃厚を考慮したカット計画の算出
- 必要材料本数と端材量の可視化
- SVG によるカット図表示
- LocalStorage への保存、再読込、削除
- バックアップ JSON の出力 / 読込

## このプロダクトでできること / What This Product Does

- 作りたいものに必要な部材を長さと本数で整理できる
- 選択した材料規格ごとに必要な母材本数を確認できる
- 端材の量を見ながら、無駄の少ない切り方の目安を得られる
- 保存して、あとで別案と比較しながら見直せる

## 使い方 / How It Works

1. 必要な部材を材料種別、長さ、本数で入力する
2. 使いたい母材長さと刃厚を設定する
3. 必要材料、端材量、カット図を確認する
4. 結果を保存して別案と比較する

## 対応材料規格 / Supported Materials

現在対応している材料規格:

- `1x4`
- `2x4`
- `cafe`

対応している母材長さ:

- `1x4`: `6f`, `8f`, `12f`
- `2x4`: `6f`, `8f`, `12f`
- `cafe`: `1000mm`, `2000mm`, `4000mm`

## 技術スタック / Tech Stack

- React 18
- TypeScript
- Vite 7
- Tailwind CSS 4
- LocalStorage

## アーキテクチャ / Architecture

UI と材料算出ロジックを分離した構成です。

- `src/models`
  - ドメインモデル定義
- `src/domain/constants`
  - 材料規格マスタ
- `src/domain/services`
  - 材料算出、カット最適化、表示用集約
- `src/services`
  - LocalStorage 永続化
- `src/hooks`
  - UI 状態管理
- `src/components`
  - 表示コンポーネント

詳細は [ARCHITECTURE.md](./ARCHITECTURE.md) を参照してください。

## セットアップ / Getting Started

```bash
npm install
npm run dev
```

ブラウザで表示されたローカル URL を開いて確認します。

## デモ画像の置き場所 / Screenshot Asset Path

README で使う画像は次のパスを想定しています。

```text
docs/images/main-workspace.png
docs/images/cut-plan.png
docs/images/saved-estimates.png
```

## 利用可能なコマンド / Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
npm run test
npm run test:e2e
```

## GitHub Pages 公開 / GitHub Pages Deployment

`main` ブランチへ push すると、GitHub Actions で GitHub Pages へ自動デプロイされる構成です。

事前に GitHub のリポジトリ設定で次を有効にしてください。

1. `Settings` → `Pages`
2. `Source` を `GitHub Actions` に変更

公開 URL は通常 `https://<GitHubユーザー名>.github.io/<リポジトリ名>/` です。

## 現在のスコープ / Current Scope

このリポジトリで扱う範囲:

- 材料算出ワークスペース
- カット計画の簡易最適化
- 保存機能

まだ含まれていないもの:

- 図面エディタ
- 3D 表示
- 価格計算
- クラウド保存
- 認証

## 注意事項 / Notes

- カット最適化は厳密解保証ではなく、MVP 向けの軽量ヒューリスティックです
- 保存データはブラウザの LocalStorage に保存されます
- 端末変更やブラウザデータ削除に備えて、バックアップ JSON の出力を推奨します
- 壊れた保存データや旧バージョンの保存形式は読み込み時に無視します

## 今後の展開 / Roadmap

- 材料規格の追加
- 図面入力 UI の導入
- 最適化アルゴリズムの改善
- テスト整備
- 外部保存対応

## 関連ドキュメント / Documents

- [spec.md](./spec.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)


---

## 3. 主要ドメインモデル

### Design（設計）

- 責務  
  - 設計全体の状態を管理  
  - Board の集合を保持  
  - 刃厚（カーフ）設定を保持  

- 主な属性  
  - id  
  - name  
  - boards: Board[]  
  - kerf: number  

---

### Board（材料1本）

- 責務  
  - キャンバス上の材料オブジェクト  
  - 長さ・位置・向きを保持  

- 主な属性  
  - id  
  - materialType  
  - length  
  - x  
  - y  
  - rotation  

---

### MaterialType / MaterialSpec

- 責務  
  - 1×4, 2×4 などの材料規格を表現  
  - 将来の規格追加に対応  

- 主な属性  
  - id  
  - name  
  - width  
  - thickness  
  - availableLengths（6f, 8f, 12f など）  

---

### CutPlan（カット計画）

- 責務  
  - どの材料をどこで切るかの結果  
  - 材料取り最適化の出力モデル  

- 主な属性  
  - materialSpec  
  - usedLength  
  - cuts: number[]  

---

## 4. ドメインサービス

### MaterialCalculator

- 責務  
  - Design から必要材料量を算出  
  - 刃厚（カーフ）を考慮した合計長さ計算  

---

### CutOptimizer

- 責務  
  - 材料規格に割り当てる  
  - 無駄を最小化する簡易最適化アルゴリズム  

---

## 5. UI とドメインの責務分離ルール

- UI コンポーネントは状態の表示・入力のみ担当  
- 計算・最適化ロジックは domain / services に実装  
- UI からはサービス経由でドメインロジックを呼び出す  
- ドメインは React に依存しない  

---

## 6. データ永続化方針

- v1  
  - LocalStorage に Design を JSON 形式で保存  
- 将来  
  - クラウド保存  
  - ユーザーアカウント連携  

---

## 7. エラーハンドリング方針

- ドメイン層  
  - 不正な長さ、マイナス値などは例外 or Result 型で扱う  
- UI 層  
  - エラーメッセージをユーザー向けに整形して表示  

---

## 8. 拡張を見据えた設計ルール

- 新しい材料規格は MaterialSpec を追加するだけで対応可能にする  
- カット最適化アルゴリズムは差し替え可能な設計にする  
- 3D 表示機能は UI 層に閉じる  

---

## 9. COMDEX への指示文（コピペ用）

この ARCHITECTURE.md の設計方針に従って、  
TODO.md のタスクを順に実装してください。  
ドメインモデルとドメインサービスを先に実装し、  
その後 UI から利用する構成にしてください。

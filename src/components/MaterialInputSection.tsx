import { MATERIAL_SPECS } from '../domain/constants/materialSpecs';
import type { DraftRequirement } from '../domain/services/materialEstimateViewService';
import type { StockSelection } from '../domain/services/materialEstimationService';
import type { MaterialTypeId, StockLengthLabel } from '../models/material';
import { normalizeNumericInput } from '../utils/numericInput';

type Props = {
  readonly kerfMm: number;
  readonly saveName: string;
  readonly requirements: readonly DraftRequirement[];
  readonly stockSelection: StockSelection;
  readonly onKerfChange: (value: number) => void;
  readonly onSaveNameChange: (value: string) => void;
  readonly onSave: () => void;
  readonly onToggleStock: (materialType: MaterialTypeId, label: StockLengthLabel) => void;
  readonly onRequirementChange: (id: string, updater: (current: DraftRequirement) => DraftRequirement) => void;
  readonly onAddRequirement: () => void;
  readonly onRemoveRequirement: (id: string) => void;
  readonly onApplyRequirements: () => void;
};

export const MaterialInputSection = ({
  kerfMm,
  saveName,
  requirements,
  stockSelection,
  onKerfChange,
  onSaveNameChange,
  onSave,
  onToggleStock,
  onRequirementChange,
  onAddRequirement,
  onRemoveRequirement,
  onApplyRequirements,
}: Props): JSX.Element => (
  <section className="panel">
    <h2>必要部材の入力</h2>
    <div className="inline-group">
      <input
        type="text"
        value={saveName}
        placeholder="保存名を入力"
        onChange={(event) => onSaveNameChange(event.target.value)}
      />
      <button type="button" onClick={onSave}>
        結果を保存
      </button>
    </div>
    <label className="material-form-row">
      <span>刃厚 (mm)</span>
      <input
        type="text"
        inputMode="decimal"
        value={String(kerfMm)}
        onChange={(event) => onKerfChange(Math.max(0, Number(normalizeNumericInput(event.target.value)) || 0))}
      />
    </label>

    <div className="stock-selector-grid">
      {MATERIAL_SPECS.map((spec) => (
        <article key={spec.id} className="card">
          <h3>{spec.name} 規格</h3>
          <div className="inline-group">
            {spec.availableLengths.map((length) => (
              <label key={`${spec.id}-${length.label}`} className="stock-checkbox">
                <input
                  type="checkbox"
                  checked={(stockSelection[spec.id] ?? []).includes(length.label)}
                  onChange={() => onToggleStock(spec.id, length.label)}
                />
                {length.label}
              </label>
            ))}
          </div>
        </article>
      ))}
    </div>
    <div className="cards">
      {requirements.map((item) => (
        <article key={item.id} className="card requirement-card">
          <label className="material-field">
            <span>材料</span>
            <select
              value={item.materialType}
              onChange={(event) =>
                onRequirementChange(item.id, (current) => ({ ...current, materialType: event.target.value as MaterialTypeId | '' }))
              }
            >
              <option value="">選択してください</option>
              {MATERIAL_SPECS.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
          </label>
          <label className="material-field">
            <span>長さ(mm)</span>
            <input
              type="text"
              inputMode="numeric"
              value={item.lengthMmInput}
              placeholder="例: 1200"
              onChange={(event) =>
                onRequirementChange(item.id, (current) => ({
                  ...current,
                  lengthMmInput: normalizeNumericInput(event.target.value),
                }))
              }
            />
          </label>
          <label className="material-field">
            <span>本数</span>
            <input
              type="text"
              inputMode="numeric"
              value={item.quantityInput}
              placeholder="例: 4"
              onChange={(event) =>
                onRequirementChange(item.id, (current) => ({
                  ...current,
                  quantityInput: normalizeNumericInput(event.target.value),
                }))
              }
            />
          </label>
          <button className="delete-row-button" type="button" onClick={() => onRemoveRequirement(item.id)} disabled={requirements.length <= 1}>
            行削除
          </button>
        </article>
      ))}
    </div>
    <div className="input-actions">
      <button type="button" onClick={onAddRequirement}>
        + 行追加
      </button>
      <button type="button" onClick={onApplyRequirements}>
        OK
      </button>
    </div>
  </section>
);

import { useState } from 'react';
import { createEmptyCustomMaterialSpecDraft } from '../domain/services/materialSpecService';
import { buildMaterialSpecGroups } from '../domain/services/materialSpecViewService';
import type { CustomMaterialSpecDraft, MaterialSpec, MaterialTypeId } from '../models/material';
import { normalizeIntegerInput } from '../utils/numericInput';

const PRESET_LENGTH_OPTIONS = [
  { label: '6f', lengthMm: 1829 },
  { label: '8f', lengthMm: 2438 },
  { label: '10f', lengthMm: 3048 },
  { label: '12f', lengthMm: 3658 },
] as const;

type Props = {
  readonly materialSpecs: readonly MaterialSpec[];
  readonly onAddMaterialSpec: (draft: CustomMaterialSpecDraft) => boolean;
  readonly onDeleteMaterialSpec: (materialSpecId: MaterialTypeId) => void;
};

export const CustomMaterialSection = ({
  materialSpecs,
  onAddMaterialSpec,
  onDeleteMaterialSpec,
}: Props): JSX.Element => {
  const [customMaterialDraft, setCustomMaterialDraft] = useState<CustomMaterialSpecDraft>(createEmptyCustomMaterialSpecDraft());
  const [selectedLengthOption, setSelectedLengthOption] = useState<string>(PRESET_LENGTH_OPTIONS[0]!.label);
  const [customLengthInput, setCustomLengthInput] = useState('');
  const [isSpecListOpen, setIsSpecListOpen] = useState(false);
  const [addError, setAddError] = useState('');

  const groupedMaterialSpecs = buildMaterialSpecGroups(materialSpecs);

  const handleAddMaterialSpec = (): void => {
    const presetOption = PRESET_LENGTH_OPTIONS.find((option) => option.label === selectedLengthOption);
    const nextDraft =
      selectedLengthOption === 'custom'
        ? {
            ...customMaterialDraft,
            lengthLabel: customLengthInput.length > 0 ? `${customLengthInput}mm` : '',
            lengthMmInput: customLengthInput,
          }
        : {
            ...customMaterialDraft,
            lengthLabel: presetOption?.label ?? '',
            lengthMmInput: presetOption ? String(presetOption.lengthMm) : '',
          };
    if (!onAddMaterialSpec(nextDraft)) {
      setAddError('同じ規格と長さの組み合わせは登録できません。');
      return;
    }
    setAddError('');
    setCustomMaterialDraft(createEmptyCustomMaterialSpecDraft());
    setSelectedLengthOption(PRESET_LENGTH_OPTIONS[0]!.label);
    setCustomLengthInput('');
  };

  return (
    <section className="panel">
      <h2>ユーザー規格を追加</h2>
      <div className="custom-spec-toolbar">
        <button type="button" onClick={() => setIsSpecListOpen((current) => !current)}>
          一覧
        </button>
      </div>
      {isSpecListOpen && (
        <div className="custom-spec-list">
          {groupedMaterialSpecs.map((group) => (
            <article key={group.name} className="card custom-spec-item">
              <div>
                <h3>{group.name}</h3>
                <div className="custom-spec-lengths">
                  {group.specs.map((spec) => (
                    <div key={spec.id} className="custom-spec-length-row">
                      <p>{spec.stockLength.label}</p>
                      <button type="button" className="delete-spec-button" onClick={() => onDeleteMaterialSpec(spec.id)}>
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
          {materialSpecs.length === 0 && <p className="length-placeholder">追加済みの規格はありません。</p>}
        </div>
      )}
      <div className="cards custom-material-grid">
        <label className="material-field">
          <span>規格名</span>
          <input
            type="text"
            value={customMaterialDraft.name}
            placeholder="例: 2x6"
            onChange={(event) => {
              setAddError('');
              setCustomMaterialDraft((current) => ({ ...current, name: event.target.value }));
            }}
          />
        </label>
        <label className="material-field">
          <span>長さ</span>
          <div className="length-selector-row">
            <select
              value={selectedLengthOption}
              onChange={(event) => {
                setAddError('');
                setSelectedLengthOption(event.target.value);
              }}
            >
              {PRESET_LENGTH_OPTIONS.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
              <option value="custom">直接入力</option>
            </select>
            {selectedLengthOption === 'custom' && (
              <input
                type="text"
                inputMode="numeric"
                value={customLengthInput}
                placeholder="例: 3000"
                onChange={(event) => {
                  setAddError('');
                  setCustomLengthInput(normalizeIntegerInput(event.target.value));
                }}
              />
            )}
          </div>
        </label>
      </div>
      {addError.length > 0 && <p className="form-error">{addError}</p>}
      <div className="input-actions">
        <button type="button" onClick={handleAddMaterialSpec}>
          + 規格追加
        </button>
      </div>
    </section>
  );
};

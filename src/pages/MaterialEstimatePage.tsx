import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { CustomMaterialSection } from '../components/CustomMaterialSection';
import { CutPlanDiagram } from '../components/CutPlanDiagram';
import { MaterialInputSection } from '../components/MaterialInputSection';
import { MaterialResultSection } from '../components/MaterialResultSection';
import { MaterialSummarySection } from '../components/MaterialSummarySection';
import { SavedEstimateSection } from '../components/SavedEstimateSection';
import { useMaterialEstimateWorkspace } from '../hooks/useMaterialEstimateWorkspace';

const SavedPartsIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M3.75 6.75A2.25 2.25 0 0 1 6 4.5h3.15c.6 0 1.17.24 1.59.66l1.2 1.2c.14.14.33.22.53.22H18A2.25 2.25 0 0 1 20.25 8.8v7.45A2.25 2.25 0 0 1 18 18.5H6a2.25 2.25 0 0 1-2.25-2.25Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4.5 9.25h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const AddSpecIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 6.5h10m-10 5h10m-10 5h6m7-7.5v7m-3.5-3.5h7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 4.5h11a1.5 1.5 0 0 1 1.5 1.5V18A1.5 1.5 0 0 1 15.5 19.5h-11A1.5 1.5 0 0 1 3 18V6A1.5 1.5 0 0 1 4.5 4.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MaterialEstimatePage = (): JSX.Element => {
  const workspace = useMaterialEstimateWorkspace();
  const [isSavedEstimatesOpen, setIsSavedEstimatesOpen] = useState(false);
  const [isCustomMaterialOpen, setIsCustomMaterialOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const handlePrint = (): void => {
    window.print();
  };
  const handleExportBackup = (): void => {
    const backup = workspace.exportBackup();
    const blob = new Blob([backup.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backup.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };
  const handleImportClick = (): void => {
    workspace.clearBackupMessage();
    importInputRef.current?.click();
  };
  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    workspace.importBackup(content);
    event.target.value = '';
  };

  return (
    <main className="page">
      <header className="topbar">
        <h1 className="page-title">D.I.Y Cutter - 材料算出 -</h1>
        <div className="topbar-actions print-hide">
          <button
            type="button"
            className="header-action-button"
            aria-label="保存済みの部材"
            title="保存済みの部材"
            data-tooltip="保存済みの部材を表示"
            onClick={() => setIsSavedEstimatesOpen((current) => !current)}
          >
            <SavedPartsIcon />
            <span>保存部材</span>
          </button>
          <button
            type="button"
            className="header-action-button"
            aria-label="ユーザー規格を追加"
            title="ユーザー規格を追加"
            data-tooltip="ユーザー規格の入力フォームを表示"
            onClick={() => setIsCustomMaterialOpen((current) => !current)}
          >
            <AddSpecIcon />
            <span>規格追加</span>
          </button>
        </div>
      </header>
      <section className="panel print-hide deploy-note">
        <p>
          このアプリの保存データはブラウザの <code>LocalStorage</code> に保存されます。端末変更やブラウザデータ削除に備えて、
          定期的にバックアップを出力してください。
        </p>
      </section>
      {isSavedEstimatesOpen && (
        <div className="print-hide">
          <SavedEstimateSection
            savedSnapshots={workspace.savedSnapshots}
            onLoad={workspace.loadSnapshot}
            onDelete={workspace.deleteSnapshot}
            onExport={handleExportBackup}
            onImport={handleImportClick}
            backupMessage={workspace.backupMessage}
          />
        </div>
      )}
      {isCustomMaterialOpen && (
        <div className="print-hide">
          <CustomMaterialSection
            materialSpecs={workspace.materialSpecs}
            onAddMaterialSpec={workspace.addMaterialSpec}
            onDeleteMaterialSpec={workspace.deleteMaterialSpec}
          />
        </div>
      )}

      <div className="print-hide">
        <MaterialInputSection
          materialSpecs={workspace.materialSpecs}
          kerfMm={workspace.kerfMm}
          saveName={workspace.saveName}
          requirements={workspace.requirements}
          stockSelection={workspace.stockSelection}
          onKerfChange={workspace.setKerfMm}
          onSaveNameChange={workspace.setSaveName}
          onSave={workspace.saveCurrent}
          onToggleStock={workspace.toggleStockSelection}
          onRequirementChange={workspace.updateRequirement}
          onAddRequirement={workspace.addRequirement}
          onRemoveRequirement={workspace.removeRequirement}
          onApplyRequirements={workspace.applyRequirements}
        />
      </div>

      <div className="print-hide">
        <MaterialSummarySection stockAggregates={workspace.stockAggregates} />
      </div>

      <section className="panel print-section">
        <h2>カット図</h2>
        <CutPlanDiagram plans={workspace.result.cutPlans} />
      </section>

      <div className="print-section">
        <MaterialResultSection
          inputAggregates={workspace.inputAggregates}
          stockByMaterial={workspace.stockByMaterial}
        />
      </div>

      <div className="print-actions print-hide">
        <button type="button" className="print-button" onClick={handlePrint}>
          印刷プレビュー
        </button>
      </div>
      <input
        ref={importInputRef}
        className="visually-hidden"
        type="file"
        accept="application/json"
        onChange={handleImportFile}
      />
    </main>
  );
};

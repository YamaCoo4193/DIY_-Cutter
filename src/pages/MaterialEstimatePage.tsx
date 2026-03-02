import { CutPlanDiagram } from '../components/CutPlanDiagram';
import { MaterialInputSection } from '../components/MaterialInputSection';
import { MaterialResultSection } from '../components/MaterialResultSection';
import { MaterialSummarySection } from '../components/MaterialSummarySection';
import { SavedEstimateSection } from '../components/SavedEstimateSection';
import { useMaterialEstimateWorkspace } from '../hooks/useMaterialEstimateWorkspace';

export const MaterialEstimatePage = (): JSX.Element => {
  const workspace = useMaterialEstimateWorkspace();
  const handlePrint = (): void => {
    window.print();
  };

  return (
    <main className="page">
      <header className="topbar">
        <h1>材料算出</h1>
        <button type="button" className="print-button" onClick={handlePrint}>
          印刷プレビュー
        </button>
      </header>

      <div className="print-hide">
        <MaterialInputSection
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
        <SavedEstimateSection
          savedSnapshots={workspace.savedSnapshots}
          onLoad={workspace.loadSnapshot}
          onDelete={workspace.deleteSnapshot}
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
    </main>
  );
};

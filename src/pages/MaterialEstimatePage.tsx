import { CutPlanDiagram } from '../components/CutPlanDiagram';
import { MaterialInputSection } from '../components/MaterialInputSection';
import { MaterialResultSection } from '../components/MaterialResultSection';
import { MaterialSummarySection } from '../components/MaterialSummarySection';
import { SavedEstimateSection } from '../components/SavedEstimateSection';
import { useMaterialEstimateWorkspace } from '../hooks/useMaterialEstimateWorkspace';

export const MaterialEstimatePage = (): JSX.Element => {
  const workspace = useMaterialEstimateWorkspace();

  return (
    <main className="page">
      <header className="topbar">
        <h1>材料算出</h1>
      </header>

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
      />

      <SavedEstimateSection
        savedSnapshots={workspace.savedSnapshots}
        onLoad={workspace.loadSnapshot}
        onDelete={workspace.deleteSnapshot}
      />

      <MaterialSummarySection stockAggregates={workspace.stockAggregates} />

      <section className="panel">
        <h2>カット図</h2>
        <CutPlanDiagram plans={workspace.result.cutPlans} />
      </section>

      <MaterialResultSection
        inputAggregates={workspace.inputAggregates}
        stockByMaterial={workspace.stockByMaterial}
      />
    </main>
  );
};

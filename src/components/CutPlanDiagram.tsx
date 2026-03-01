import type { CutPlan } from '../models/cutPlan';

type Props = {
  readonly plans: readonly CutPlan[];
};

const CANVAS_WIDTH = 920;
const BAR_LEFT = 28;
const BAR_TOP = 72;
const BAR_HEIGHT = 30;
const TOTAL_DIM_Y = 24;
const PIECE_DIM_Y = 52;
const LABEL_Y = 14;
const KERF_GAP_PX = 2;

export const CutPlanDiagram = ({ plans }: Props): JSX.Element => {
  if (plans.length === 0) {
    return <p>表示できるカット図がありません。</p>;
  }

  return (
    <div className="cut-plan-list">
      {plans.map((plan, index) => {
        const usableWidth = CANVAS_WIDTH - BAR_LEFT * 2;
        const scale = usableWidth / plan.stockLengthMm;
        // 図の表示順とカット番号を一致させるため、処理順で並べ替える。
        const cutsInProcessOrder = [...plan.cuts].sort((a, b) => {
          const orderA = a.processOrder ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.processOrder ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
        let currentX = BAR_LEFT;

        return (
          <article key={`${plan.materialSpec.id}-${plan.stockLabel}-${index}`} className="card cut-plan-card">
            <h3>
              {plan.materialSpec.name} / {plan.stockLabel} ({plan.stockLengthMm}mm)
            </h3>
            <svg className="cut-plan-svg" viewBox={`0 0 ${CANVAS_WIDTH} 142`} role="img" aria-label="cut plan diagram">
              <defs>
                <marker id="dim-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="#1f1f1f" />
                </marker>
              </defs>

              <line x1={BAR_LEFT} y1={TOTAL_DIM_Y} x2={BAR_LEFT + usableWidth} y2={TOTAL_DIM_Y} stroke="#1f1f1f" strokeWidth={1.4} markerStart="url(#dim-arrow)" markerEnd="url(#dim-arrow)" />
              <line x1={BAR_LEFT} y1={TOTAL_DIM_Y} x2={BAR_LEFT} y2={BAR_TOP} stroke="#1f1f1f" strokeWidth={1.2} />
              <line x1={BAR_LEFT + usableWidth} y1={TOTAL_DIM_Y} x2={BAR_LEFT + usableWidth} y2={BAR_TOP} stroke="#1f1f1f" strokeWidth={1.2} />
              <text x={BAR_LEFT + usableWidth / 2} y={LABEL_Y} fontSize={13} fill="#111" textAnchor="middle">
                {plan.stockLabel} {plan.stockLengthMm}mm
              </text>

              <rect x={BAR_LEFT} y={BAR_TOP} width={usableWidth} height={BAR_HEIGHT} fill="#fff" stroke="#223c79" strokeWidth={1.2} />

              {cutsInProcessOrder.map((cut, cutIndex) => {
                const width = Math.max(1, cut.lengthMm * scale);
                const startX = currentX;
                currentX += width + KERF_GAP_PX;
                const cutOrderLabel = cut.processOrder ?? cutIndex + 1;
                return (
                  <g key={`${cut.boardId}-${cutIndex}`}>
                    <line
                      x1={startX}
                      y1={PIECE_DIM_Y}
                      x2={startX + width}
                      y2={PIECE_DIM_Y}
                      stroke="#1f1f1f"
                      strokeWidth={1.2}
                      markerStart="url(#dim-arrow)"
                      markerEnd="url(#dim-arrow)"
                    />
                    <line x1={startX} y1={PIECE_DIM_Y} x2={startX} y2={BAR_TOP} stroke="#1f1f1f" strokeWidth={1} />
                    <line x1={startX + width} y1={PIECE_DIM_Y} x2={startX + width} y2={BAR_TOP} stroke="#1f1f1f" strokeWidth={1} />
                    <text x={startX + width / 2} y={PIECE_DIM_Y - 6} fontSize={12} fill="#111" textAnchor="middle">
                      {cut.lengthMm}mm
                    </text>
                    <rect x={startX} y={BAR_TOP} width={width} height={BAR_HEIGHT} fill="#f2d266" stroke="#223c79" strokeWidth={1} />
                    <text x={startX + width / 2} y={BAR_TOP + BAR_HEIGHT - 6} fontSize={10} fill="#111" textAnchor="middle">
                      {cutOrderLabel}カット目
                    </text>
                  </g>
                );
              })}

              {plan.wasteMm > 0 && (
                <g>
                  <line
                    x1={Math.min(currentX, BAR_LEFT + usableWidth)}
                    y1={PIECE_DIM_Y}
                    x2={Math.min(currentX + Math.max(1, plan.wasteMm * scale), BAR_LEFT + usableWidth)}
                    y2={PIECE_DIM_Y}
                    stroke="#1f1f1f"
                    strokeWidth={1.2}
                    markerStart="url(#dim-arrow)"
                    markerEnd="url(#dim-arrow)"
                  />
                  <line x1={Math.min(currentX, BAR_LEFT + usableWidth)} y1={PIECE_DIM_Y} x2={Math.min(currentX, BAR_LEFT + usableWidth)} y2={BAR_TOP} stroke="#1f1f1f" strokeWidth={1} />
                  <line
                    x1={Math.min(currentX + Math.max(1, plan.wasteMm * scale), BAR_LEFT + usableWidth)}
                    y1={PIECE_DIM_Y}
                    x2={Math.min(currentX + Math.max(1, plan.wasteMm * scale), BAR_LEFT + usableWidth)}
                    y2={BAR_TOP}
                    stroke="#1f1f1f"
                    strokeWidth={1}
                  />
                  <rect
                    x={Math.min(currentX, BAR_LEFT + usableWidth)}
                    y={BAR_TOP}
                    width={Math.max(1, plan.wasteMm * scale)}
                    height={BAR_HEIGHT}
                    fill="none"
                    stroke="#223c79"
                    strokeWidth={1}
                    strokeDasharray="6 4"
                  />
                  <text x={Math.min(currentX + Math.max(1, plan.wasteMm * scale) / 2, BAR_LEFT + usableWidth - 30)} y={PIECE_DIM_Y - 6} fontSize={12} fill="#111" textAnchor="middle">
                    端材 {Math.round(plan.wasteMm)}mm
                  </text>
                </g>
              )}
            </svg>
          </article>
        );
      })}
    </div>
  );
};

import { ArrowUpRight, Table2 } from "lucide-react";
import { RiskBadge } from "@/components/ui/RiskBadge";
import type { CropComparison, CropId } from "@/domain/types";
import { formatCurrency } from "@/utils/formatters";

interface CropComparisonTableProps {
  activeCropId: CropId;
  comparisons: CropComparison[];
}

export function CropComparisonTable({ activeCropId, comparisons }: CropComparisonTableProps) {
  return (
    <section className="content-panel">
      <div className="section-title-row">
        <div className="section-title">
          <Table2 size={20} />
          <div>
            <h2>Crop Comparison</h2>
            <p>Same land size and available budget</p>
          </div>
        </div>
        <button className="link-button" type="button">
          View full comparison <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="table-wrap">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Crop</th>
              <th>Expected Profit</th>
              <th>Break-even</th>
              <th>Return</th>
              <th>Risk</th>
              <th>Best Action</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((item) => (
              <tr className={item.crop.id === activeCropId ? "is-active" : ""} key={item.crop.id}>
                <td data-label="Crop">
                  <span className="crop-dot" style={{ backgroundColor: item.crop.color }} />
                  {item.crop.name}
                </td>
                <td data-label="Expected Profit">{formatCurrency(item.expectedProfit)}</td>
                <td data-label="Break-even">
                  {formatCurrency(item.breakEvenPrice)} / {item.crop.unit}
                </td>
                <td data-label="Return">{item.cashReturnMonths} mo</td>
                <td data-label="Risk">
                  <RiskBadge level={item.riskLevel} />
                </td>
                <td data-label="Best Action">{item.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

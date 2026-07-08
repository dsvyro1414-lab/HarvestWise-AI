import type { PriceSensitivityPoint } from "@/domain/types";
import { formatCurrency } from "@/utils/formatters";

interface PriceSensitivityChartProps {
  points: PriceSensitivityPoint[];
  breakEvenPrice: number;
}

export function PriceSensitivityChart({ points, breakEvenPrice }: PriceSensitivityChartProps) {
  const width = 720;
  const height = 196;
  const padding = { left: 54, right: 22, top: 14, bottom: 34 };
  const xMin = Math.min(...points.map((point) => point.price), breakEvenPrice);
  const xMax = Math.max(...points.map((point) => point.price), breakEvenPrice);
  const yMin = Math.min(...points.map((point) => point.profit), 0);
  const yMax = Math.max(...points.map((point) => point.profit), 0);
  const xRange = Math.max(1, xMax - xMin);
  const yRange = Math.max(1, yMax - yMin);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const toX = (price: number) => padding.left + ((price - xMin) / xRange) * innerWidth;
  const toY = (profit: number) => padding.top + innerHeight - ((profit - yMin) / yRange) * innerHeight;
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${toX(point.price)} ${toY(point.profit)}`).join(" ");
  const breakEvenX = toX(breakEvenPrice);
  const zeroY = toY(0);

  return (
    <div className="chart" aria-label="Profit over market price range">
      <div className="chart__legend">
        <span>
          <i className="legend-line legend-line--profit" />
          Profit
        </span>
        <span>
          <i className="legend-line legend-line--break-even" />
          Break-even
        </span>
      </div>

      <svg className="chart__svg" viewBox={`0 0 ${width} ${height}`} role="img">
        <line className="chart__axis" x1={padding.left} x2={width - padding.right} y1={zeroY} y2={zeroY} />
        <line
          className="chart__break-even"
          x1={breakEvenX}
          x2={breakEvenX}
          y1={padding.top}
          y2={height - padding.bottom}
        />
        <path className="chart__area" d={`${linePath} L ${toX(points[points.length - 1].price)} ${zeroY} L ${toX(points[0].price)} ${zeroY} Z`} />
        <path className="chart__line" d={linePath} />
        {points.map((point) => (
          <circle className="chart__point" cx={toX(point.price)} cy={toY(point.profit)} key={point.price} r="4" />
        ))}
        <text className="chart__label chart__label--x" x={width / 2} y={height - 8}>
          Market price
        </text>
        <text className="chart__label" x={breakEvenX + 8} y={padding.top + 22}>
          Break-even {formatCurrency(breakEvenPrice, true)}
        </text>
      </svg>
    </div>
  );
}

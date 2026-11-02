import React from 'react';

interface SkillRadarChartProps {
  data?: {
    dimension: string;
    score: number; // 0 to 100
  }[];
  className?: string;
}

const DEFAULT_DIMENSIONS = [
  { dimension: 'Analytical', score: 85 },
  { dimension: 'Problem Solving', score: 90 },
  { dimension: 'Collaboration', score: 78 },
  { dimension: 'Creativity', score: 82 },
  { dimension: 'Adaptability', score: 76 },
];

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  data = DEFAULT_DIMENSIONS,
  className = '',
}) => {
  const size = 260;
  const center = size / 2;
  const radius = 80;
  const numAxes = data.length;
  const angleStep = (2 * Math.PI) / numAxes;

  // Concentric polygon levels: 25%, 50%, 75%, 100%
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, valueRatio: number) => {
    // Start at top (-PI/2) and rotate clockwise
    const angle = index * angleStep - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon string for a given level
  const getLevelPolygon = (ratio: number) => {
    return Array.from({ length: numAxes })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, ratio);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Generate data polygon string
  const dataPolygon = data
    .map((item, i) => {
      const ratio = Math.max(0.1, Math.min(1.0, item.score / 100));
      const { x, y } = getCoordinates(i, ratio);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className={`flex flex-col items-center justify-center p-2 select-none ${className}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[240px] h-auto overflow-visible"
        aria-label="Skill alignment radar chart"
      >
        {/* Background Grid Concentric Polygons */}
        {levels.map((level, idx) => (
          <polygon
            key={`grid-${idx}`}
            points={getLevelPolygon(level)}
            className="fill-transparent stroke-border/70 dark:stroke-border/50"
            strokeWidth="1"
            strokeDasharray={idx < levels.length - 1 ? '2 2' : 'none'}
          />
        ))}

        {/* Radial Axes */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-border/70 dark:stroke-border/50"
              strokeWidth="1"
            />
          );
        })}

        {/* Shaded Data Polygon */}
        <polygon
          points={dataPolygon}
          className="fill-primary/25 dark:fill-primary/30 stroke-primary transition-all duration-300"
          strokeWidth="2"
        />

        {/* Data Points */}
        {data.map((item, i) => {
          const ratio = Math.max(0.1, Math.min(1.0, item.score / 100));
          const { x, y } = getCoordinates(i, ratio);
          return (
            <circle
              key={`point-${i}`}
              cx={x}
              cy={y}
              r="3.5"
              className="fill-primary stroke-card transition-all duration-300"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Dimension Labels */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(i, 1.25);
          return (
            <text
              key={`label-${i}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-medium fill-muted-foreground transition-colors"
            >
              {item.dimension}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

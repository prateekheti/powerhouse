import React, { useState, useMemo } from 'react';
import { Session, DayGraphPoint } from '../types';

interface ProgressGraphCardProps {
  sessions: Session[];
  dailyGoalMinutes: number;
}

export const ProgressGraphCard: React.FC<ProgressGraphCardProps> = ({
  sessions,
  dailyGoalMinutes,
}) => {
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days'>('7days');
  const [hoveredPoint, setHoveredPoint] = useState<DayGraphPoint | null>(null);

  const graphData = useMemo(() => {
    const now = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (timeframe === 'today') {
      // 12 two-hour intervals (00-02, 02-04, ..., 22-24)
      const points: DayGraphPoint[] = [];
      const todayStr = formatDate(now);
      const todaySessions = sessions.filter((s) => s.date === todayStr);

      for (let h = 0; h < 24; h += 2) {
        const nextH = h + 2;
        const label = `${String(h).padStart(2, '0')}:00`;
        
        let minInSlot = 0;
        let countInSlot = 0;

        todaySessions.forEach((s) => {
          const sDate = new Date(s.startTime);
          const sHour = sDate.getHours();
          if (sHour >= h && sHour < nextH) {
            minInSlot += Math.round(s.duration / 60);
            countInSlot++;
          }
        });

        points.push({
          label,
          dateKey: `${todayStr} ${label}`,
          minutes: minInSlot,
          sessionCount: countInSlot,
        });
      }
      return points;
    }

    if (timeframe === '7days') {
      const points: DayGraphPoint[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = formatDate(d);
        const dayName = dayNames[d.getDay()];

        const daySessions = sessions.filter((s) => s.date === dateStr);
        const totalMinutes = Math.round(daySessions.reduce((acc, s) => acc + s.duration, 0) / 60);

        points.push({
          label: i === 0 ? 'Today' : dayName,
          dateKey: dateStr,
          minutes: totalMinutes,
          sessionCount: daySessions.length,
        });
      }
      return points;
    }

    // 30 days
    const points: DayGraphPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(d);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;

      const daySessions = sessions.filter((s) => s.date === dateStr);
      const totalMinutes = Math.round(daySessions.reduce((acc, s) => acc + s.duration, 0) / 60);

      points.push({
        label,
        dateKey: dateStr,
        minutes: totalMinutes,
        sessionCount: daySessions.length,
      });
    }
    return points;
  }, [sessions, timeframe]);

  // Compute SVG dimensions and path coordinates
  const width = 800;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  const maxMinutes = useMemo(() => {
    const rawMax = Math.max(...graphData.map((d) => d.minutes), dailyGoalMinutes, 60);
    return Math.ceil(rawMax / 30) * 30; // Round up to next 30m
  }, [graphData, dailyGoalMinutes]);

  const coordinates = useMemo(() => {
    const usableW = width - paddingX * 2;
    const usableH = height - paddingY * 2;
    const count = graphData.length;

    return graphData.map((d, index) => {
      const x = paddingX + (index / (count - 1 || 1)) * usableW;
      const y = height - paddingY - (d.minutes / (maxMinutes || 1)) * usableH;
      return { x, y, data: d };
    });
  }, [graphData, maxMinutes, width, height, paddingX, paddingY]);

  // SVG Line path string
  const linePath = useMemo(() => {
    if (coordinates.length === 0) return '';
    return coordinates.reduce((path, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.y}` : `${path} L ${pt.x},${pt.y}`;
    }, '');
  }, [coordinates]);

  // SVG Area path for fill under curve
  const areaPath = useMemo(() => {
    if (coordinates.length === 0) return '';
    const firstX = coordinates[0].x;
    const lastX = coordinates[coordinates.length - 1].x;
    const baselineY = height - paddingY;
    return `${linePath} L ${lastX},${baselineY} L ${firstX},${baselineY} Z`;
  }, [coordinates, linePath, height, paddingY]);

  const totalPeriodMinutes = graphData.reduce((acc, d) => acc + d.minutes, 0);
  const avgPeriodMinutes = Math.round(totalPeriodMinutes / (graphData.length || 1));

  return (
    <div className="progress-graph-card" id="progress-graph-card">
      <div className="progress-header-row">
        <div>
          <h2 className="blueprint-card-title">Productivity Progress</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            AVERAGE: {Math.floor(avgPeriodMinutes / 60)}h {avgPeriodMinutes % 60}m / period • TOTAL: {Math.floor(totalPeriodMinutes / 60)}h {totalPeriodMinutes % 60}m
          </span>
        </div>

        {/* Timeframe Buttons */}
        <div className="graph-timeframe-switch">
          <button
            className={`geo-btn geo-btn-sm ${timeframe === 'today' ? 'geo-btn-primary' : ''}`}
            onClick={() => setTimeframe('today')}
          >
            TODAY
          </button>
          <button
            className={`geo-btn geo-btn-sm ${timeframe === '7days' ? 'geo-btn-primary' : ''}`}
            onClick={() => setTimeframe('7days')}
          >
            7 DAYS
          </button>
          <button
            className={`geo-btn geo-btn-sm ${timeframe === '30days' ? 'geo-btn-primary' : ''}`}
            onClick={() => setTimeframe('30days')}
          >
            30 DAYS
          </button>
        </div>
      </div>

      {/* Blueprint Line Graph */}
      <div className="graph-svg-container" id="productivity-graph-view">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', display: 'block' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="blueprintGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7a00" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#ff7a00" stopOpacity="0.02" />
            </linearGradient>
            <pattern id="graphGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid background */}
          <rect width={width} height={height} fill="url(#graphGrid)" />

          {/* Horizontal Reference Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + (height - paddingY * 2) * (1 - ratio);
            const minsVal = Math.round(maxMinutes * ratio);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke={ratio === 0 ? '#000000' : 'rgba(0,0,0,0.12)'}
                  strokeWidth={ratio === 0 ? '2' : '1'}
                  strokeDasharray={ratio === 0 ? undefined : '3 3'}
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fill="#777"
                >
                  {minsVal}m
                </text>
              </g>
            );
          })}

          {/* Daily Goal Guide Line */}
          {dailyGoalMinutes <= maxMinutes && (
            <line
              x1={paddingX}
              y1={height - paddingY - (dailyGoalMinutes / maxMinutes) * (height - paddingY * 2)}
              x2={width - paddingX}
              y2={height - paddingY - (dailyGoalMinutes / maxMinutes) * (height - paddingY * 2)}
              stroke="#ea580c"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Shaded Area under Curve */}
          <path d={areaPath} fill="url(#blueprintGrad)" />

          {/* Main Blueprint Line (Matching Blueprint Line Graph) */}
          <path
            d={linePath}
            fill="none"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points & Labels */}
          {coordinates.map((pt, idx) => {
            // Show label based on density
            const showLabel =
              timeframe === '30days' ? idx % 4 === 0 || idx === coordinates.length - 1 : true;

            return (
              <g key={idx}>
                {showLabel && (
                  <text
                    x={pt.x}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    fontWeight="600"
                    fill="#333"
                  >
                    {pt.data.label}
                  </text>
                )}

                {/* Visible Data Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#000000"
                  stroke="#ffffff"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                />

                {/* Transparent touch/click hotspot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="16"
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint(pt.data)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 12,
              background: '#000000',
              color: '#ffffff',
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 700,
              border: '1px solid #000',
              pointerEvents: 'none',
              boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
            }}
          >
            {hoveredPoint.label} ({hoveredPoint.dateKey}): {Math.floor(hoveredPoint.minutes / 60)}h {hoveredPoint.minutes % 60}m ({hoveredPoint.sessionCount} sessions)
          </div>
        )}
      </div>
    </div>
  );
};

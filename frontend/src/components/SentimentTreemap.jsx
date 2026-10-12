import React, { useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

export default function SentimentTreemap() {
  const [drillDownPath, setDrillDownPath] = useState([]);

  // Mock nested data
  const data = [
    {
      name: 'Product Quality',
      children: [
        { name: 'Durability', size: 400, sentiment: 'positive' },
        { name: 'Materials', size: 300, sentiment: 'positive' },
        { name: 'Defects', size: 150, sentiment: 'negative' }
      ]
    },
    {
      name: 'Customer Service',
      children: [
        { name: 'Response Time', size: 250, sentiment: 'negative' },
        { name: 'Resolution', size: 350, sentiment: 'positive' },
        { name: 'Attitude', size: 200, sentiment: 'neutral' }
      ]
    },
    {
      name: 'Pricing & Value',
      children: [
        { name: 'Discounts', size: 100, sentiment: 'positive' },
        { name: 'Base Price', size: 320, sentiment: 'negative' },
        { name: 'Subscription', size: 180, sentiment: 'neutral' }
      ]
    }
  ];

  const COLORS = {
    positive: '#10b981', // emerald-500
    negative: '#ef4444', // red-500
    neutral: '#64748b'   // slate-500
  };

  const getActiveData = () => {
    if (drillDownPath.length === 0) {
      // Group at top level
      return data.map(category => ({
        name: category.name,
        children: category.children,
        size: category.children.reduce((acc, curr) => acc + curr.size, 0),
        sentiment: 'neutral' // Base color for category
      }));
    }
    // Drilled down to a specific category
    const category = data.find(c => c.name === drillDownPath[0]);
    return category ? category.children : [];
  };

  const handleClick = (node) => {
    if (drillDownPath.length === 0) {
      setDrillDownPath([node.name]);
    }
  };

  const handleBack = () => {
    setDrillDownPath([]);
  };

  const CustomContent = (props) => {
    const { root, depth, x, y, width, height, index, name, sentiment, size } = props;
    
    if (width < 25 || height < 20) return null;
    
    const nodeSentiment = sentiment || 'neutral';
    const bgColor = COLORS[nodeSentiment] || '#38bdf8';
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={6}
          ry={6}
          style={{
            fill: bgColor,
            stroke: '#0f172a',
            strokeWidth: 2,
            opacity: 0.85,
            cursor: 'pointer'
          }}
          onClick={() => handleClick({ name })}
        />
        {width > 45 && height > 28 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize={width < 70 ? 10 : 12}
            fontWeight={800}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {name}
          </text>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold">{data.name}</p>
          <p className="text-slate-400 text-sm">Mentions: {data.size || data.value}</p>
          {data.sentiment && (
            <p className="text-sm mt-1 uppercase tracking-wider font-bold" style={{ color: COLORS[data.sentiment] }}>
              {data.sentiment} Sentiment
            </p>
          )}
          {drillDownPath.length === 0 && (
            <p className="text-xs text-sky-400 mt-2 font-medium">Click to drill down</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card w-full h-[400px] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-slate-100">Topic Sentiment Distribution</h3>
        {drillDownPath.length > 0 && (
          <button 
            onClick={handleBack}
            className="btn btn-sm btn-ghost text-sky-400"
          >
            ← Back to Overview
          </button>
        )}
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={getActiveData()}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            content={<CustomContent />}
            isAnimationActive={true}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

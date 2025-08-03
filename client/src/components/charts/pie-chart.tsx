import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface PieChartProps {
  data: number[];
  labels?: string[];
  colors?: string[];
  cutout?: string;
  className?: string;
}

export function PieChart({ 
  data, 
  labels = [], 
  colors = ['hsl(var(--primary))', 'hsl(var(--muted))'],
  cutout = '70%',
  className = '' 
}: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverBackgroundColor: colors.map(color => color + '90'),
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: labels.length > 0
          }
        },
        cutout,
        elements: {
          arc: {
            borderWidth: 0
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, labels, colors, cutout]);

  return (
    <div className={`chart-container ${className}`}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

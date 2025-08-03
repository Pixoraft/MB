import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface BarChartProps {
  data: number[];
  labels: string[];
  colors?: string[];
  className?: string;
  type?: 'bar' | 'line';
  maxValue?: number;
}

export function BarChart({ 
  data, 
  labels, 
  colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(142, 71%, 45%)'],
  className = '',
  type = 'bar',
  maxValue = 100
}: BarChartProps) {
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
      type,
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: type === 'bar' ? colors : colors[0],
          borderColor: type === 'line' ? colors[0] : undefined,
          borderWidth: type === 'line' ? 2 : 0,
          fill: type === 'line' ? true : undefined,
          tension: type === 'line' ? 0.4 : undefined,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: maxValue,
            grid: {
              color: 'hsl(var(--border))'
            },
            ticks: {
              color: 'hsl(var(--muted-foreground))'
            }
          },
          x: {
            grid: {
              color: 'hsl(var(--border))'
            },
            ticks: {
              color: 'hsl(var(--muted-foreground))'
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, labels, colors, type, maxValue]);

  return (
    <div className={`chart-container ${className}`}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

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
  colors = ['#8B5DFF', '#22C55E', '#3B82F6', '#EF4444', '#F59E0B'],
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

    // Create gradients for each bar
    const gradients = colors.map((color, index) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '60');
      return gradient;
    });

    const lineGradient = ctx.createLinearGradient(0, 0, 0, 300);
    lineGradient.addColorStop(0, colors[0] + 'AA');
    lineGradient.addColorStop(1, colors[0] + '20');

    chartRef.current = new Chart(ctx, {
      type,
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: type === 'bar' ? gradients : lineGradient,
          borderColor: type === 'line' ? colors[0] : 'rgba(255, 255, 255, 0.1)',
          borderWidth: type === 'line' ? 4 : 1,
          borderRadius: type === 'bar' ? 12 : undefined,
          borderSkipped: false,
          fill: type === 'line' ? true : undefined,
          tension: type === 'line' ? 0.4 : undefined,
          pointBackgroundColor: type === 'line' ? colors[0] : undefined,
          pointBorderColor: type === 'line' ? '#ffffff' : undefined,
          pointBorderWidth: type === 'line' ? 3 : undefined,
          pointRadius: type === 'line' ? 6 : undefined,
          pointHoverRadius: type === 'line' ? 8 : undefined,
          pointHoverBackgroundColor: type === 'line' ? colors[0] : undefined,
          pointHoverBorderColor: type === 'line' ? '#ffffff' : undefined,
          pointHoverBorderWidth: type === 'line' ? 4 : undefined,
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
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 12,
            displayColors: true,
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: maxValue,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#94A3B8',
              font: {
                size: 12,
                weight: 'normal'
              },
              padding: 8
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#94A3B8',
              font: {
                size: 12,
                weight: 'normal'
              },
              padding: 8
            }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart'
        },
        interaction: {
          intersect: false,
          mode: 'index'
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
    <div className={`chart-container ${className} relative`}>
      <canvas ref={canvasRef}></canvas>
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl"></div>
      </div>
    </div>
  );
}

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
  colors = ['#8B5DFF', '#E2E8F0'],
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

    // Create gradient colors
    const gradient1 = ctx.createLinearGradient(0, 0, 0, 300);
    gradient1.addColorStop(0, colors[0]);
    gradient1.addColorStop(1, colors[0] + '80');
    
    const gradient2 = ctx.createLinearGradient(0, 0, 0, 300);
    gradient2.addColorStop(0, colors[1] || colors[0]);
    gradient2.addColorStop(1, (colors[1] || colors[0]) + '40');

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [gradient1, gradient2],
          borderWidth: 3,
          borderColor: 'rgba(255, 255, 255, 0.8)',
          hoverBorderWidth: 5,
          hoverBorderColor: 'rgba(255, 255, 255, 1)',
          hoverBackgroundColor: [colors[0], colors[1] || colors[0]],
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
            enabled: labels.length > 0,
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
        cutout,
        elements: {
          arc: {
            borderWidth: 3,
            borderRadius: 8,
            hoverBorderWidth: 5
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1500,
          easing: 'easeInOutQuart'
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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

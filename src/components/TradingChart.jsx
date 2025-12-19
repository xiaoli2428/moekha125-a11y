import { useEffect, useRef, useState } from 'react';
import { marketAPI } from '../services/api';

export default function TradingChart({ pair, interval = '1d' }) {
  const canvasRef = useRef(null);
  const [ohlcData, setOhlcData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('candle'); // 'candle' or 'line'
  const [timeframe, setTimeframe] = useState(1); // days

  useEffect(() => {
    loadChartData();
    const interval = setInterval(loadChartData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [pair, timeframe]);

  useEffect(() => {
    if (ohlcData.length > 0) {
      drawChart();
    }
  }, [ohlcData, chartType]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const response = await marketAPI.getOHLCV(pair, timeframe);
      if (response.data && response.data.length > 0) {
        setOhlcData(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load chart data:', err);
      setError('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || ohlcData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 20, right: 60, bottom: 30, left: 10 };

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Calculate price range
    const prices = ohlcData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Chart area
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const candleWidth = Math.max(2, (chartWidth / ohlcData.length) - 2);

    // Draw grid lines
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight * i / 5);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice - (priceRange * i / 5);
      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(2), width - padding.right + 5, y + 4);
    }

    // Draw candles or line
    if (chartType === 'candle') {
      ohlcData.forEach((candle, i) => {
        const x = padding.left + (i * (chartWidth / ohlcData.length)) + candleWidth / 2;
        const yOpen = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
        const yClose = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;
        const yHigh = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
        const yLow = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;

        const isGreen = candle.close >= candle.open;
        const color = isGreen ? '#22c55e' : '#ef4444';

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.abs(yClose - yOpen) || 1;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    } else {
      // Line chart
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ohlcData.forEach((candle, i) => {
        const x = padding.left + (i * (chartWidth / ohlcData.length)) + candleWidth / 2;
        const y = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Fill area under line
      const lastX = padding.left + ((ohlcData.length - 1) * (chartWidth / ohlcData.length)) + candleWidth / 2;
      ctx.lineTo(lastX, height - padding.bottom);
      ctx.lineTo(padding.left + candleWidth / 2, height - padding.bottom);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw current price line
    if (ohlcData.length > 0) {
      const currentPrice = ohlcData[ohlcData.length - 1].close;
      const currentY = padding.top + ((maxPrice - currentPrice) / priceRange) * chartHeight;
      
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, currentY);
      ctx.lineTo(width - padding.right, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current price label
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(width - padding.right, currentY - 10, 55, 20);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(currentPrice.toFixed(2), width - padding.right + 5, currentY + 4);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Chart Header */}
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">{pair}</span>
          {ohlcData.length > 0 && (
            <span className={`text-lg font-semibold ${
              ohlcData[ohlcData.length - 1].close >= ohlcData[ohlcData.length - 1].open 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              ${ohlcData[ohlcData.length - 1].close.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {/* Chart Type Toggle */}
          <div className="flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setChartType('candle')}
              className={`px-3 py-1 rounded text-sm ${
                chartType === 'candle' ? 'bg-purple-600 text-white' : 'text-gray-400'
              }`}
            >
              K-Line
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm ${
                chartType === 'line' ? 'bg-purple-600 text-white' : 'text-gray-400'
              }`}
            >
              Line
            </button>
          </div>
          {/* Timeframe Toggle */}
          <div className="flex bg-white/5 rounded-lg p-1">
            {[1, 7, 30].map(days => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`px-3 py-1 rounded text-sm ${
                  timeframe === days ? 'bg-purple-600 text-white' : 'text-gray-400'
                }`}
              >
                {days === 1 ? '1D' : days === 7 ? '7D' : '30D'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative" style={{ height: '400px' }}>
        {loading && ohlcData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}
        {error && ohlcData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400">
            {error}
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full"
        />
      </div>

      {/* Price Info */}
      {ohlcData.length > 0 && (
        <div className="grid grid-cols-4 gap-4 p-4 border-t border-white/10 text-sm">
          <div>
            <span className="text-gray-400">Open</span>
            <div className="font-mono">${ohlcData[ohlcData.length - 1].open.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-gray-400">High</span>
            <div className="font-mono text-green-400">${ohlcData[ohlcData.length - 1].high.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-gray-400">Low</span>
            <div className="font-mono text-red-400">${ohlcData[ohlcData.length - 1].low.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-gray-400">Close</span>
            <div className="font-mono">${ohlcData[ohlcData.length - 1].close.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

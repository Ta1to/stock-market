export const getLimitedStockData = (stockData) => {
    if (!stockData?.dates || !stockData?.prices) return null;
        const cuttoffIndexDate = -2; 
        const cuttoffIndexPrice = -5;
    return {
      dates: stockData.dates.slice(0, cuttoffIndexDate),
      prices: stockData.prices.slice(0, cuttoffIndexPrice)
    };
  };

  
  export const getChartConfig = (darkMode = true) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          font: { size: 11 },
          callback: (value) => '$ ' + value.toFixed(2)
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          font: { size: 11 },
          maxRotation: 0
        }
      }
    }
  });
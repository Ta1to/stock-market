import { shallowMount } from '@vue/test-utils'
import StockChart from '@/components/StockChart.vue'
import '../../../tests/setup/vuetify' // Importieren der Vuetify-Mocks
import { vuetifyMock } from '../../../tests/setup/vuetify'

// Mock für Chart.js und vue-chartjs
jest.mock('vue-chartjs', () => ({
  Line: {
    name: 'Line',
    template: '<div class="mock-line-chart" />'
  }
}))

// Mock für Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn()
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn()
}))

// Mock für stockDataUtils
jest.mock('@/utils/stockDataUtils', () => ({
  getChartConfig: jest.fn(() => ({
    responsive: true,
    maintainAspectRatio: false,
    // Vereinfachtes Chart-Konfigurationsobjekt für Tests
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
      }
    }
  }))
}))

describe('StockChart.vue', () => {
  let wrapper

  // Mock-Daten für die Tests
  const mockStockData = {
    dates: ['2023-01-01', '2023-01-02', '2023-01-03'],
    prices: [100, 105, 110]
  }

  const emptyStockData = {
    dates: [],
    prices: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders properly when stock data is provided', () => {
    wrapper = shallowMount(StockChart, {
      props: {
        stockData: mockStockData
      },
      global: {
        mocks: {
          $vuetify: vuetifyMock
        }
      }
    })

    expect(wrapper.find('.stock-chart').exists()).toBe(true)
    expect(wrapper.find('.chart-container').exists()).toBe(true)
    expect(wrapper.find('.no-data').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'Line' }).exists()).toBe(true)
  })

  it('shows loading message when no data is available', () => {
    wrapper = shallowMount(StockChart, {
      props: {
        stockData: emptyStockData
      },
      global: {
        mocks: {
          $vuetify: vuetifyMock
        }
      }
    })

    expect(wrapper.find('.chart-container').exists()).toBe(false)
    expect(wrapper.find('.no-data').exists()).toBe(true)
    expect(wrapper.find('.no-data').text()).toBe('Loading stock data...')
  })

  it('creates correct chart data from props', () => {
    wrapper = shallowMount(StockChart, {
      props: {
        stockData: mockStockData
      },
      global: {
        mocks: {
          $vuetify: vuetifyMock
        }
      }
    })

    const chartData = wrapper.vm.chartData
    
    expect(chartData.labels).toEqual(mockStockData.dates)
    expect(chartData.datasets).toHaveLength(1)
    expect(chartData.datasets[0].data).toEqual(mockStockData.prices)
    expect(chartData.datasets[0].label).toBe('Stock Price')
    expect(chartData.datasets[0].borderColor).toBe('#3b82f6')
  })

  it('uses getChartConfig from stockDataUtils', () => {
    const { getChartConfig } = require('@/utils/stockDataUtils')
    
    wrapper = shallowMount(StockChart, {
      props: {
        stockData: mockStockData
      },
      global: {
        mocks: {
          $vuetify: vuetifyMock
        }
      }
    })

    expect(getChartConfig).toHaveBeenCalledWith(true)
    expect(wrapper.vm.chartOptions).toEqual(expect.objectContaining({
      responsive: true,
      maintainAspectRatio: false
    }))
  })

  it('handles undefined stock data gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    wrapper = shallowMount(StockChart, {
      props: {
        stockData: {}
      },
      global: {
        mocks: {
          $vuetify: vuetifyMock
        }
      }
    })

    expect(wrapper.vm.chartData.labels).toEqual([])
    expect(wrapper.vm.chartData.datasets[0].data).toEqual([])
    expect(wrapper.find('.no-data').exists()).toBe(true)
    
    consoleErrorSpy.mockRestore()
  })

  it('has the correct styling for the chart container', () => {
    wrapper = shallowMount(StockChart, {
      props: {
        stockData: mockStockData
      },
      global: {
        mocks: {
          $vuetify: vuetifyMock
        }
      }
    })

    const chartContainer = wrapper.find('.chart-container')
    expect(chartContainer.classes()).toContain('chart-container')
  })
})
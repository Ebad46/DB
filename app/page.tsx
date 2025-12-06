'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase, type MonthlyTrendData } from '@/lib/supabase'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Calendar, Store, Fuel, DollarSign, AlertCircle, X, ChevronDown } from 'lucide-react'

type ChartData = {
  store: string
  salesCurrent: number
  salesPrevious: number
  gallonsCurrent: number
  gallonsPrevious: number
  difference: number
  percentChange: number
  salesPerGallon: number
  efficiency: number
}

type StoreData = {
  storeName: string
  address?: string
  july?: number
  august?: number
  september?: number
  october?: number
  november?: number
  totalLoss?: number
  severity?: 'critical' | 'high' | 'moderate'
}

type TrendPoint = {
  month: string
  [key: string]: number | string
}

export default function Dashboard() {
  const [data, setData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [months, setMonths] = useState<string[]>([])
  const [stores, setStores] = useState<string[]>([])
  const [allStores, setAllStores] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'sales' | 'gallons' | 'efficiency'>('sales')
  const [showStoreFilter, setShowStoreFilter] = useState(false)
  const [metricView, setMetricView] = useState<'sales' | 'gallons'>('sales')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [storeSearchInput, setStoreSearchInput] = useState<string>('')

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: fetchedData, error: fetchError } = await supabase
          .from('Bottom to Top')
          .select('*')
          .limit(1000)

        if (fetchError) {
          setError(`Database error: ${fetchError.message}`)
          console.error('Supabase error:', fetchError)
          return
        }

        if (fetchedData && fetchedData.length > 0) {
          setData(fetchedData)

          // Extract unique months - remove duplicates and sort chronologically
          const monthOrder: { [key: string]: number } = {
            'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4, 'MAY': 5, 'JUNE': 6,
            'JULY': 7, 'AUGUST': 8, 'SEPTEMBER': 9, 'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12,
            'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11
          }
          
          const uniqueMonths = Array.from(
            new Set(
              fetchedData
                .map((item: any) => item.Month)
                .filter((month: any) => month && String(month).trim() !== '')
                .map((month: any) => String(month).trim().toUpperCase())
            )
          ).sort((a, b) => (monthOrder[a] || 0) - (monthOrder[b] || 0)) as string[]

          setMonths(uniqueMonths)
          if (uniqueMonths.length > 0) {
            setSelectedMonth(uniqueMonths[0])
          }

          // Extract unique stores
          const uniqueStores = [
            ...new Set(
              fetchedData
                .map((item: any) => item['Store Name'])
                .filter((store: any) => store && store.trim() !== '')
            ),
          ].sort() as string[]

          setStores(uniqueStores)
          setAllStores(uniqueStores)
          setSelectedStores(uniqueStores)
        } else {
          setError('No data found in Bottom to Top table')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(`Error: ${errorMessage}`)
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter data based on selected month and stores
  useEffect(() => {
    if (selectedMonth && data.length > 0) {
      const filtered = data.filter(
        (item) =>
          item.Month &&
          String(item.Month).trim().toUpperCase() === selectedMonth.trim().toUpperCase() &&
          selectedStores.includes(item['Store Name'] as string)
      )
      setFilteredData(filtered)
    }
  }, [selectedMonth, data, selectedStores])

  // Parse number with proper negative detection - FIXED to preserve decimal points
  const parseNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0
    
    const stringValue = String(value).trim()
    
    // Remove % sign if present
    let cleanValue = stringValue.replace('%', '').trim()
    
    // Check if number is in parentheses (negative indicator)
    const hasParentheses = /\(.*\)/.test(cleanValue)
    
    // Check if number has minus sign (negative indicator)
    const hasMinus = cleanValue.includes('-')
    
    // Remove all non-numeric characters EXCEPT decimal point to preserve decimals
    const numericString = cleanValue.replace(/[^0-9.]/g, '')
    
    // Parse to number
    let parsed = parseFloat(numericString)
    
    // If NaN, return 0
    if (isNaN(parsed)) return 0
    
    // Apply negative if in parentheses or has minus sign
    if (hasParentheses || hasMinus) {
      return -Math.abs(parsed)
    }
    
    // Otherwise positive
    return Math.abs(parsed)
  }

  // Get decline analysis
  const declineAnalysis = useMemo(() => {
    const storeData: { [key: string]: StoreData } = {}

    data.forEach((item) => {
      const store = item['Store Name']
      if (!store) return

      if (!storeData[store]) {
        storeData[store] = {
          storeName: store,
          address: `Store Location`,
          july: 0,
          august: 0,
          september: 0,
          october: 0,
          november: 0,
          totalLoss: 0,
        }
      }

      const month = String(item.Month).toUpperCase().trim()
      const loss = Math.abs(parseNumber(item['DIFFERENCE']))

      if (month.includes('JUL')) storeData[store].july = loss
      if (month.includes('AUG')) storeData[store].august = loss
      if (month.includes('SEP')) storeData[store].september = loss
      if (month.includes('OCT')) storeData[store].october = loss
      if (month.includes('NOV')) storeData[store].november = loss
    })

    Object.values(storeData).forEach((store) => {
      store.totalLoss =
        (store.july || 0) +
        (store.august || 0) +
        (store.september || 0) +
        (store.october || 0) +
        (store.november || 0)

      const monthsWithData = [store.july, store.august, store.september, store.october, store.november]
        .filter((v) => v !== undefined && v > 0).length

      if (monthsWithData >= 3) {
        const avgLoss = store.totalLoss / monthsWithData
        if (avgLoss > 50000) store.severity = 'critical'
        else if (avgLoss > 30000) store.severity = 'high'
        else store.severity = 'moderate'
      }
    })

    return Object.values(storeData)
      .filter((store) => (store.totalLoss ?? 0) > 0)
      .sort((a, b) => (b.totalLoss || 0) - (a.totalLoss || 0))
  }, [data])

  // Get stores declining all months
  const storesDecliningAllMonths = useMemo(() => {
    return declineAnalysis.filter(
      (store) =>
        store.july &&
        store.august &&
        store.september &&
        store.october &&
        store.november
    )
  }, [declineAnalysis])

  // Get critical stores
  const criticalStores = useMemo(() => {
    return storesDecliningAllMonths
      .filter((s) => s.severity === 'critical')
      .slice(0, 3)
  }, [storesDecliningAllMonths])

  // Get trend data for critical stores
  const trendData = useMemo(() => {
    const trends: TrendPoint[] = []

    months.forEach((month) => {
      const point: TrendPoint = { month }

      criticalStores.forEach((store) => {
        const monthData = data.find(
          (d) =>
            d['Store Name'] === store.storeName &&
            String(d.Month).toUpperCase() === month.toUpperCase()
        )

        if (monthData) {
          const loss = Math.abs(parseNumber(monthData['DIFFERENCE']))
          point[store.storeName] = loss
        }
      })

      if (Object.keys(point).length > 1) {
        trends.push(point)
      }
    })

    return trends
  }, [months, criticalStores, data])

  // Get data for current view with sorting BY DIFFERENCE
  const monthData = useMemo(() => {
    let resultData: any[] = []

    if (activeTab === 'overview') {
      resultData = declineAnalysis
        .filter((s) => selectedStores.includes(s.storeName))
    } else if (activeTab === 'consistent-decline') {
      // Show ALL consistently declining stores (ignore the store filter)
      resultData = storesDecliningAllMonths as any
    } else {
      resultData = data
        .filter(
          (item) =>
            String(item.Month).toUpperCase() === String(activeTab).toUpperCase() &&
            selectedStores.includes(item['Store Name'] as string)
        )
        .reduce(
          (acc: any[], item) => {
            const existing = acc.find((d) => d['Store Name'] === item['Store Name'])
            return existing ? acc : [...acc, item]
          },
          []
        )
    }

    // Sort by ACTUAL DIFFERENCE VALUE (only for month views) - based on profit/loss amounts
    if (activeTab !== 'overview' && activeTab !== 'consistent-decline' && resultData.length > 0) {
      // Create a sorted copy instead of mutating in place
      const sortedData = [...resultData].sort((a: any, b: any) => {
        let aDifference = 0
        let bDifference = 0

        // Get the actual difference value for sorting (this determines profit/loss order)
        if (metricView === 'sales') {
          // Sort by DIFFERENCE column for sales
          aDifference = parseNumber(a['DIFFERENCE'])
          bDifference = parseNumber(b['DIFFERENCE'])
        } else {
          // Gallons metric - sort by DIFFERENCE_1 column
          aDifference = parseNumber(a['DIFFERENCE_1'])
          bDifference = parseNumber(b['DIFFERENCE_1'])
        }

        // Sort logic - based on DIFFERENCE VALUE (actual profit/loss amount):
        // sortOrder === 'desc' means HIGH to LOW: highest positive value first (best profit) to lowest/negative (worst loss)
        // sortOrder === 'asc' means LOW to HIGH: lowest/most negative first (worst loss) to highest positive (best profit)
        
        // Separate by positive/negative, then sort within each group
        const aIsProfit = aDifference >= 0
        const bIsProfit = bDifference >= 0
        
        if (sortOrder === 'desc') {
          // High to Low: Profits first (sorted high to low), then Losses (sorted high to low, i.e., least negative first)
          if (aIsProfit && !bIsProfit) return -1  // a is profit, b is loss → a comes first
          if (!aIsProfit && bIsProfit) return 1   // a is loss, b is profit → b comes first
          return bDifference - aDifference         // Both profit or both loss → normal numeric sort
        } else {
          // Low to High: Losses first (sorted low to high, i.e., most negative first), then Profits (sorted low to high)
          if (aIsProfit && !bIsProfit) return 1   // a is profit, b is loss → b comes first
          if (!aIsProfit && bIsProfit) return -1  // a is loss, b is profit → a comes first
          return aDifference - bDifference         // Both profit or both loss → normal numeric sort
        }
      })
      return sortedData
    }

    return resultData
  }, [activeTab, data, selectedStores, declineAnalysis, storesDecliningAllMonths, metricView, sortOrder])

  // Prepare chart data that updates with metric view - USING CORRECT FIELD NAMES
  const prepareChartData = (): ChartData[] => {
    return filteredData
      .map((item) => {
        // CORRECT FIELD NAMES FROM "Bottom to Top" TABLE
        const salesCurrent = parseNumber(item['Inside Sales 2025'])
        const gallonsCurrent = parseNumber(item['Gallons NOV 2025'])
        const salesPrevious = parseNumber(item['Inside Sales 2024'])
        const gallonsPrevious = parseNumber(item['Gallons NOV 2024'])

        // Handle percentage change - avoid Infinity values
        let percentChangeValue = parseNumber(item['% CHANGE In Sales'])
        if (!isFinite(percentChangeValue) || percentChangeValue === null) {
          // If it's Infinity or not a valid number, calculate from values
          if (salesPrevious > 0) {
            percentChangeValue = ((salesCurrent - salesPrevious) / salesPrevious) * 100
          } else if (salesCurrent > 0) {
            percentChangeValue = 0  // Will be handled as NEW
          } else {
            percentChangeValue = 0
          }
        }

        return {
          store: item['Store Name'] || 'Unknown',
          salesCurrent,
          salesPrevious,
          gallonsCurrent,
          gallonsPrevious,
          difference: parseNumber(item['DIFFERENCE']),
          percentChange: percentChangeValue,
          salesPerGallon: gallonsCurrent > 0 ? salesCurrent / gallonsCurrent : 0,
          efficiency:
            gallonsPrevious > 0
              ? ((gallonsCurrent - gallonsPrevious) / gallonsPrevious) * 100
              : 0,
        }
      })
      .filter((item) => item.store !== 'Unknown' || item.salesCurrent !== 0)
      .sort((a, b) => {
        if (sortBy === 'sales') return b.salesCurrent - a.salesCurrent
        if (sortBy === 'gallons') return b.gallonsCurrent - a.gallonsCurrent
        return b.efficiency - a.efficiency
      })
  }

  // Toggle store selection
  const toggleStore = (store: string) => {
    setSelectedStores((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]
    )
  }

  const selectAllStores = () => {
    setSelectedStores([...allStores])
  }

  const deselectAllStores = () => {
    setSelectedStores([])
  }

  const calculateStats = () => {
    const chartData = prepareChartData()
    if (chartData.length === 0) {
      return {
        totalStores: 0,
        totalSalesCurrent: 0,
        totalSalesPrevious: 0,
        totalGallonsCurrent: 0,
        totalGallonsPrevious: 0,
        avgPercentChange: '0.00',
        bestPerformer: 'N/A',
        avgSalesPerGallon: '0.00',
        fuelEfficiency: '0.00',
        topStore: null,
      }
    }

    const totalSalesCurrent = chartData.reduce((sum, item) => sum + item.salesCurrent, 0)
    const totalSalesPrevious = chartData.reduce((sum, item) => sum + item.salesPrevious, 0)
    const totalGallonsCurrent = chartData.reduce((sum, item) => sum + item.gallonsCurrent, 0)
    const totalGallonsPrevious = chartData.reduce((sum, item) => sum + item.gallonsPrevious, 0)

    const avgPercentChange = (
      chartData.reduce((sum, item) => sum + item.percentChange, 0) / chartData.length
    ).toFixed(2)

    const bestPerformer = chartData.reduce((prev, current) =>
      prev.percentChange > current.percentChange ? prev : current
    )

    const avgSalesPerGallon = (totalGallonsCurrent > 0 ? totalSalesCurrent / totalGallonsCurrent : 0).toFixed(2)

    const fuelEfficiency =
      totalGallonsPrevious > 0
        ? (((totalGallonsCurrent - totalGallonsPrevious) / totalGallonsPrevious) * 100).toFixed(2)
        : '0.00'

    return {
      totalStores: chartData.length,
      totalSalesCurrent,
      totalSalesPrevious,
      totalGallonsCurrent,
      totalGallonsPrevious,
      avgPercentChange,
      bestPerformer: bestPerformer.store,
      avgSalesPerGallon,
      fuelEfficiency,
      topStore: bestPerformer,
    }
  }

  const stats = calculateStats()
  const chartData = prepareChartData()
  const COLORS = ['#ff6b6b', '#ffa500', '#4ecdc4', '#45b7d1', '#96ceb4']

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', margin: '0 auto 20px', border: '3px solid #00d4ff', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#00d4ff', fontSize: '1.1rem', fontWeight: '600' }}>Loading your dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header with Glow */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(100, 200, 255, 0.1))',
          border: '2px solid #00d4ff',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 0 30px rgba(0, 212, 255, 0.3), inset 0 0 30px rgba(0, 212, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          <h1 style={{ color: '#00d4ff', fontSize: '2.5rem', margin: '0 0 10px 0', fontWeight: '700', textShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}>
            📊 Store Performance Dashboard
          </h1>
          <p style={{ color: '#64c8ff', fontSize: '1.1rem', margin: '0', opacity: 0.9 }}>
            Monthly Sales & Gallons Analysis - {months.slice(0, 1)[0]} to {months.slice(-1)[0]} (2025 vs 2024)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            border: '2px solid #ff6b6b',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '20px',
            color: '#ff9999',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}>
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        )}

        {/* Month Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          marginBottom: '30px',
          paddingBottom: '10px',
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: '700',
              border: activeTab === 'overview' ? '2px solid #00d4ff' : '2px solid #3a4250',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === 'overview'
                ? 'rgba(0, 212, 255, 0.2)'
                : 'rgba(255, 140, 66, 0.05)',
              color: activeTab === 'overview' ? '#00d4ff' : '#888',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'overview' ? '0 0 20px rgba(0, 212, 255, 0.4)' : 'none',
              textShadow: activeTab === 'overview' ? '0 0 10px rgba(0, 212, 255, 0.5)' : 'none',
            }}
          >
            📊 Overview
          </button>

          {months.map((month) => (
            <button
              key={month}
              onClick={() => setActiveTab(month)}
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: '700',
                border: activeTab === month ? '2px solid #ff8c42' : '2px solid #3a4250',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: activeTab === month
                  ? 'rgba(255, 140, 66, 0.2)'
                  : 'rgba(255, 140, 66, 0.05)',
                color: activeTab === month ? '#ff8c42' : '#888',
                transition: 'all 0.3s',
                boxShadow: activeTab === month ? '0 0 20px rgba(255, 140, 66, 0.4)' : 'none',
                textShadow: activeTab === month ? '0 0 10px rgba(255, 140, 66, 0.5)' : 'none',
              }}
            >
              📈 {month}
            </button>
          ))}

          <button
            onClick={() => setActiveTab('consistent-decline')}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: '700',
              border: activeTab === 'consistent-decline' ? '2px solid #ff6b6b' : '2px solid #3a4250',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === 'consistent-decline'
                ? 'rgba(255, 107, 107, 0.2)'
                : 'rgba(255, 107, 107, 0.05)',
              color: activeTab === 'consistent-decline' ? '#ff6b6b' : '#888',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: activeTab === 'consistent-decline' ? '0 0 20px rgba(255, 107, 107, 0.4)' : 'none',
              textShadow: activeTab === 'consistent-decline' ? '0 0 10px rgba(255, 107, 107, 0.5)' : 'none',
            }}
          >
            ⚠️ Consistent Decline
          </button>
        </div>

        {/* Store Filter Section - Enhanced */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(100, 200, 255, 0.05))',
          border: '2px solid #00d4ff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.05)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
          }}>
            <h3 style={{ margin: 0, color: '#00d4ff', fontSize: '1.2rem', fontWeight: '700', textShadow: '0 0 10px rgba(0, 212, 255, 0.3)' }}>
              🏪 Store Filter ({selectedStores.length} selected)
            </h3>
            <button
              onClick={() => setShowStoreFilter(!showStoreFilter)}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.95rem',
                transition: 'all 0.3s',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.6)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.4)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {showStoreFilter ? '▼' : '▶'} Stores
            </button>
          </div>

          {/* Store Filter Dropdown */}
          {showStoreFilter && (
            <div style={{
              background: 'rgba(15, 20, 25, 0.8)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid #3a4250',
              maxHeight: '400px',
              overflowY: 'auto',
              backdropFilter: 'blur(5px)',
            }}>
              {/* Search Input */}
              <div style={{
                marginBottom: '15px',
                position: 'relative',
              }}>
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={storeSearchInput}
                  onChange={(e) => setStoreSearchInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '0.95rem',
                    background: 'rgba(0, 212, 255, 0.05)',
                    border: '2px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#00d4ff',
                    fontWeight: '600',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'
                    e.currentTarget.style.borderColor = '#00d4ff'
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.3)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                {storeSearchInput && (
                  <X
                    size={18}
                    onClick={() => setStoreSearchInput('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#00d4ff',
                      cursor: 'pointer',
                      opacity: 0.7,
                      transition: 'opacity 0.3s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                  />
                )}
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button
                  onClick={selectAllStores}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.4)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllStores}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, #ff6b6b, #ff4444)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.4)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  Deselect All
                </button>
              </div>

              {/* Store Checkboxes - Filtered */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '10px',
              }}>
                {allStores
                  .filter((store) =>
                    store.toLowerCase().includes(storeSearchInput.toLowerCase())
                  )
                  .map((store) => (
                    <label
                      key={store}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px',
                        background: selectedStores.includes(store)
                          ? 'rgba(0, 212, 255, 0.15)'
                          : 'rgba(100, 150, 200, 0.05)',
                        borderRadius: '8px',
                        border: selectedStores.includes(store)
                          ? '1.5px solid #00d4ff'
                          : '1.5px solid #3a4250',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: selectedStores.includes(store)
                          ? '0 0 15px rgba(0, 212, 255, 0.2)'
                          : 'none',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store)}
                        onChange={() => toggleStore(store)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: '#00d4ff',
                        }}
                      />
                      <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{store}</span>
                    </label>
                  ))}
              </div>

              {allStores.filter((store) =>
                store.toLowerCase().includes(storeSearchInput.toLowerCase())
              ).length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: '#888',
                  padding: '20px',
                  fontSize: '0.9rem',
                }}>
                  No stores found matching "{storeSearchInput}"
                </div>
              )}
            </div>
          )}

          {/* Selected Stores Pills */}
          {selectedStores.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {selectedStores.map((store) => (
                <div
                  key={store}
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(100, 200, 255, 0.3))',
                    color: '#00d4ff',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    border: '1px solid #00d4ff',
                    boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)',
                    transition: 'all 0.3s',
                  }}
                >
                  {store}
                  <X
                    size={16}
                    style={{ cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.3s' }}
                    onClick={() => toggleStore(store)}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Critical Alerts */}
        {activeTab === 'consistent-decline' && criticalStores.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 100, 100, 0.1))',
            border: '2px solid #ff6b6b',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '30px',
            boxShadow: '0 0 30px rgba(255, 107, 107, 0.3), inset 0 0 30px rgba(255, 107, 107, 0.05)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'start', marginBottom: '20px' }}>
              <AlertCircle size={28} style={{ color: '#ff6b6b', flexShrink: 0, textShadow: '0 0 10px rgba(255, 107, 107, 0.5)' }} />
              <div>
                <h3 style={{ color: '#ff9999', fontSize: '1.3rem', margin: '0 0 5px 0', fontWeight: '700', textShadow: '0 0 10px rgba(255, 107, 107, 0.3)' }}>
                  Critical Alert: {criticalStores.length} Stores Need Immediate Attention
                </h3>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}>
              {criticalStores.map((store) => (
                <div
                  key={store.storeName}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 100, 100, 0.05))',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '2px solid #ff6b6b',
                    boxShadow: '0 0 25px rgba(255, 107, 107, 0.3), inset 0 0 20px rgba(255, 107, 107, 0.05)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = '0 10px 35px rgba(255, 107, 107, 0.4), inset 0 0 20px rgba(255, 107, 107, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 107, 107, 0.3), inset 0 0 20px rgba(255, 107, 107, 0.05)'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#ff9999', marginBottom: '10px', fontSize: '1.1rem' }}>
                    {store.storeName}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#999', marginBottom: '12px' }}>
                    {store.address}
                  </div>
                  <div style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: '#ff6b6b',
                    marginBottom: '8px',
                    textShadow: '0 0 10px rgba(255, 107, 107, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    ${(store.totalLoss || 0).toLocaleString()}
                    <span style={{
                      fontSize: '0.8rem',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255, 107, 107, 0.3)',
                      color: '#ff9999',
                      fontWeight: '700',
                    }}>
                      📉 LOSS
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>
                    Total Loss Across All Months
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Month Decline Analysis with Sales/Gallons Toggle AND SORTING BUTTONS */}
        {activeTab !== 'consistent-decline' && activeTab !== 'overview' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              flexWrap: 'wrap',
              gap: '20px',
            }}>
              <div>
                <h2 style={{ color: '#00d4ff', marginBottom: '10px', fontSize: '1.8rem', fontWeight: '700', textShadow: '0 0 10px rgba(0, 212, 255, 0.3)' }}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 2025 Decline Analysis
                </h2>
                {monthData.length > 0 && (
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: '#ff8c42',
                    textShadow: '0 0 10px rgba(255, 140, 66, 0.3)',
                  }}>
                    Total {metricView === 'sales' ? 'Loss' : 'Difference'}: {metricView === 'sales' ? '$' : ''}
                    {monthData
                      .reduce(
                        (sum, item) =>
                          sum + Math.abs(parseNumber(
                            metricView === 'sales' ? item['DIFFERENCE'] : item['DIFFERENCE_1']
                          )),
                        0
                      )
                      .toLocaleString()}
                  </div>
                )}
              </div>

              {/* Sales/Gallons Toggle */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setMetricView('sales')}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    border: metricView === 'sales' ? '2px solid #ff8c42' : '2px solid #3a4250',
                    cursor: 'pointer',
                    background: metricView === 'sales'
                      ? 'rgba(255, 140, 66, 0.2)'
                      : 'rgba(255, 140, 66, 0.05)',
                    color: metricView === 'sales' ? '#ff8c42' : '#888',
                    transition: 'all 0.3s',
                    boxShadow: metricView === 'sales' ? '0 0 20px rgba(255, 140, 66, 0.4)' : 'none',
                    textShadow: metricView === 'sales' ? '0 0 10px rgba(255, 140, 66, 0.3)' : 'none',
                  }}
                >
                  💰 Sales
                </button>
                <button
                  onClick={() => setMetricView('gallons')}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    border: metricView === 'gallons' ? '2px solid #ff8c42' : '2px solid #3a4250',
                    cursor: 'pointer',
                    background: metricView === 'gallons'
                      ? 'rgba(255, 140, 66, 0.2)'
                      : 'rgba(255, 140, 66, 0.05)',
                    color: metricView === 'gallons' ? '#ff8c42' : '#888',
                    transition: 'all 0.3s',
                    boxShadow: metricView === 'gallons' ? '0 0 20px rgba(255, 140, 66, 0.4)' : 'none',
                    textShadow: metricView === 'gallons' ? '0 0 10px rgba(255, 140, 66, 0.3)' : 'none',
                  }}
                >
                  ⛽ Gallons
                </button>
              </div>

              {/* Sort Order Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setSortOrder('desc')}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    border: sortOrder === 'desc' ? '2px solid #00d4ff' : '2px solid #3a4250',
                    cursor: 'pointer',
                    background: sortOrder === 'desc'
                      ? 'rgba(0, 212, 255, 0.2)'
                      : 'rgba(0, 212, 255, 0.05)',
                    color: sortOrder === 'desc' ? '#00d4ff' : '#888',
                    transition: 'all 0.3s',
                    boxShadow: sortOrder === 'desc' ? '0 0 20px rgba(0, 212, 255, 0.4)' : 'none',
                    textShadow: sortOrder === 'desc' ? '0 0 10px rgba(0, 212, 255, 0.3)' : 'none',
                  }}
                >
                  ↓ High to Low
                </button>
                <button
                  onClick={() => setSortOrder('asc')}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    border: sortOrder === 'asc' ? '2px solid #00d4ff' : '2px solid #3a4250',
                    cursor: 'pointer',
                    background: sortOrder === 'asc'
                      ? 'rgba(0, 212, 255, 0.2)'
                      : 'rgba(0, 212, 255, 0.05)',
                    color: sortOrder === 'asc' ? '#00d4ff' : '#888',
                    transition: 'all 0.3s',
                    boxShadow: sortOrder === 'asc' ? '0 0 20px rgba(0, 212, 255, 0.4)' : 'none',
                    textShadow: sortOrder === 'asc' ? '0 0 10px rgba(0, 212, 255, 0.3)' : 'none',
                  }}
                >
                  ↑ Low to High
                </button>
              </div>
            </div>

            {/* Store Cards Grid - GLOWING DESIGN WITH FIXED PROFIT/LOSS LOGIC */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '24px',
              marginBottom: '40px',
            }}>
              {monthData.map((item, idx) => {
                // Get the difference value for the current metric view
                const differenceValueRaw = metricView === 'sales'
                  ? parseNumber(item['DIFFERENCE'])
                  : parseNumber(item['DIFFERENCE_1'])
                
                // Get the actual 2025 and 2024 values
                const sales2025 = parseNumber(item['Inside Sales 2025'])
                const sales2024 = parseNumber(item['Inside Sales 2024'])
                const gallons2025 = parseNumber(item['Gallons NOV 2025'])
                const gallons2024 = parseNumber(item['Gallons NOV 2024'])
                
                // Determine profit/loss based on actual values
                // If 2024 is $0 (no data), profit/loss = 2025 value directly
                // Otherwise, profit/loss = 2025 - 2024
                let actualDifference = differenceValueRaw
                
                if (metricView === 'sales') {
                  if (sales2024 === 0) {
                    // When 2024 has no data, difference is just the 2025 value
                    actualDifference = sales2025
                  } else {
                    // Normal case: 2025 - 2024
                    actualDifference = sales2025 - sales2024
                  }
                } else {
                  if (gallons2024 === 0) {
                    // When 2024 has no data, difference is just the 2025 value
                    actualDifference = gallons2025
                  } else {
                    // Normal case: 2025 - 2024
                    actualDifference = gallons2025 - gallons2024
                  }
                }
                
                // CRITICAL: Determine profit/loss based on the actual difference
                // Positive difference = PROFIT (green)
                // Negative difference = LOSS (red)
                const isLoss = actualDifference < 0
                const isProfit = actualDifference > 0
                
                // Use absolute value only for display formatting
                const differenceValue = Math.abs(actualDifference)
                
                // Calculate percent change correctly
                let percentChangeValue = 0
                let isNewStoreNoPriorData = false  // Flag for stores with no 2024 data
                
                if (sales2024 > 0 || gallons2024 > 0) {
                  // Normal case: when 2024 has data
                  const prev = metricView === 'sales' ? sales2024 : gallons2024
                  const curr = metricView === 'sales' ? sales2025 : gallons2025
                  percentChangeValue = ((curr - prev) / prev) * 100
                } else if (sales2025 > 0 || gallons2025 > 0) {
                  // When 2024 = $0 and 2025 > $0: mark as NEW (can't calculate % from zero)
                  isNewStoreNoPriorData = true
                  percentChangeValue = 0  // Will display as "NEW" instead
                } else {
                  // When both are $0
                  percentChangeValue = 0
                }
                
                // Format the percentage display
                const percentChangeSign = isNewStoreNoPriorData ? '🆕' : (percentChangeValue < 0 ? '-' : '+')
                const percentChangeDisplay = isNewStoreNoPriorData ? 'NEW' : Math.abs(percentChangeValue).toFixed(1) + '%'
                
                const projected2025 = metricView === 'sales'
                  ? parseNumber(item['Inside Sales 2025'])
                  : parseNumber(item['Gallons NOV 2025'])
                const actual2024 = metricView === 'sales'
                  ? parseNumber(item['Inside Sales 2024'])
                  : parseNumber(item['Gallons NOV 2024'])

                return (
                  <div
                    key={idx}
                    style={{
                      background: isProfit 
                        ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(100, 255, 100, 0.05))'
                        : 'linear-gradient(135deg, rgba(255, 107, 107, 0.08), rgba(255, 150, 150, 0.05))',
                      border: isProfit ? '2px solid #4caf50' : '2px solid #ff6b6b',
                      borderRadius: '14px',
                      padding: '24px',
                      boxShadow: isProfit
                        ? '0 0 25px rgba(76, 175, 80, 0.25), inset 0 0 25px rgba(76, 175, 80, 0.05)'
                        : '0 0 25px rgba(255, 107, 107, 0.25), inset 0 0 25px rgba(255, 107, 107, 0.05)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                      const shadowColor = isProfit ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 107, 107, 0.4)'
                      const insetColor = isProfit ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 107, 107, 0.15)'
                      e.currentTarget.style.boxShadow = `0 15px 40px ${shadowColor}, inset 0 0 30px ${insetColor}`
                      e.currentTarget.style.borderColor = isProfit ? '#66bb6a' : '#ff4444'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      const shadowColor = isProfit ? 'rgba(76, 175, 80, 0.25)' : 'rgba(255, 107, 107, 0.25)'
                      const insetColor = isProfit ? 'rgba(76, 175, 80, 0.05)' : 'rgba(255, 107, 107, 0.05)'
                      e.currentTarget.style.boxShadow = `0 0 25px ${shadowColor}, inset 0 0 25px ${insetColor}`
                      e.currentTarget.style.borderColor = isProfit ? '#4caf50' : '#ff6b6b'
                    }}
                  >
                    {/* Card Number Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '20px',
                      width: '50px',
                      height: '50px',
                      background: isProfit 
                        ? 'linear-gradient(135deg, #4caf50, #66bb6a)'
                        : 'linear-gradient(135deg, #ff6b6b, #ff4444)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      color: 'white',
                      boxShadow: isProfit
                        ? '0 0 20px rgba(76, 175, 80, 0.5)'
                        : '0 0 20px rgba(255, 107, 107, 0.5)',
                    }}>
                      #{idx + 1}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '18px', marginTop: '20px' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Store Name
                        </div>
                        <div style={{
                          fontSize: '1.15rem',
                          fontWeight: '700',
                          color: isProfit ? '#4caf50' : '#ff6b6b',
                          textShadow: isProfit
                            ? '0 0 10px rgba(76, 175, 80, 0.3)'
                            : '0 0 10px rgba(255, 107, 107, 0.3)',
                        }}>
                          {item['Store Name']}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: isProfit ? '#4caf50' : '#ff6b6b',
                        textShadow: isProfit
                          ? '0 0 15px rgba(76, 175, 80, 0.4)'
                          : '0 0 15px rgba(255, 107, 107, 0.4)',
                      }}>
                        {percentChangeSign}{percentChangeDisplay}
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                      marginBottom: '18px',
                    }}>
                      <div style={{
                        background: 'rgba(0, 212, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '12px',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                      }}>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#888',
                          marginBottom: '6px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          2025 {metricView === 'sales' ? '(Sales)' : '(Gallons)'}
                        </div>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: '#00d4ff',
                          textShadow: '0 0 8px rgba(0, 212, 255, 0.3)',
                        }}>
                          {metricView === 'sales'
                            ? `$${projected2025.toLocaleString()}`
                            : `${projected2025.toLocaleString()}`}
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(100, 200, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '12px',
                        border: '1px solid rgba(100, 200, 255, 0.3)',
                      }}>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#888',
                          marginBottom: '6px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          2024 {metricView === 'sales' ? '(Sales)' : '(Gallons)'}
                        </div>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: '#64c8ff',
                          textShadow: '0 0 8px rgba(100, 200, 255, 0.3)',
                        }}>
                          {metricView === 'sales'
                            ? `$${actual2024.toLocaleString()}`
                            : `${actual2024.toLocaleString()}`}
                        </div>
                      </div>
                    </div>

                    {/* Difference Box - FIXED WITH PROPER PROFIT/LOSS INDICATOR */}
                    <div style={{
                      background: isProfit
                        ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(100, 255, 100, 0.1))'
                        : 'linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 100, 100, 0.1))',
                      borderRadius: '10px',
                      padding: '14px',
                      border: isProfit ? '2px solid #4caf50' : '2px solid #ff6b6b',
                      boxShadow: isProfit
                        ? '0 0 15px rgba(76, 175, 80, 0.2), inset 0 0 15px rgba(76, 175, 80, 0.05)'
                        : '0 0 15px rgba(255, 107, 107, 0.2), inset 0 0 15px rgba(255, 107, 107, 0.05)',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}>
                        <div style={{
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: isProfit ? '#66bb6a' : '#ff9999',
                        }}>
                          {isProfit ? 'Profit 📈' : 'Loss 📉'}
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: isProfit ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 107, 107, 0.3)',
                          color: isProfit ? '#66bb6a' : '#ff9999',
                          letterSpacing: '0.5px',
                        }}>
                          {metricView === 'sales'
                            ? `${isProfit ? '+' : '-'}$${differenceValue.toLocaleString()}`
                            : `${isProfit ? '+' : '-'}${differenceValue.toLocaleString()}`}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: isProfit ? '#4caf50' : '#ff6b6b',
                        textShadow: isProfit
                          ? '0 0 12px rgba(76, 175, 80, 0.4)'
                          : '0 0 12px rgba(255, 107, 107, 0.4)',
                      }}>
                        {metricView === 'sales'
                          ? `${isProfit ? '+' : '-'}$${differenceValue.toLocaleString()}`
                          : `${isProfit ? '+' : '-'}${differenceValue.toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* SALES OVERVIEW */}
            <h2 style={{
              color: '#00d4ff',
              marginBottom: '30px',
              fontSize: '1.8rem',
              fontWeight: '700',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
            }}>
              💰 Sales Overview - All Months
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}>
              {months.map((month, monthIndex) => {
                const currentMonthLoss = data
                  .filter((item) =>
                    String(item.Month).toUpperCase() === month.toUpperCase()
                  )
                  .reduce(
                    (sum, item) =>
                      sum + Math.abs(parseNumber(item['DIFFERENCE'])),
                    0
                  )

                // Get previous month loss for comparison
                let previousMonthLoss = 0
                if (monthIndex > 0) {
                  previousMonthLoss = data
                    .filter((item) =>
                      String(item.Month).toUpperCase() === months[monthIndex - 1].toUpperCase()
                    )
                    .reduce(
                      (sum, item) =>
                        sum + Math.abs(parseNumber(item['DIFFERENCE'])),
                      0
                    )
                }

                const monthDifference = currentMonthLoss - previousMonthLoss
                const monthChangePercent = previousMonthLoss > 0 ? ((monthDifference / previousMonthLoss) * 100) : 0
                const isIncrease = monthDifference > 0

                return (
                  <div
                    key={month}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 140, 66, 0.1), rgba(255, 120, 50, 0.05))',
                      border: '2px solid #ff8c42',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 0 20px rgba(255, 140, 66, 0.25), inset 0 0 20px rgba(255, 140, 66, 0.05)',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)'
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 140, 66, 0.35), inset 0 0 20px rgba(255, 140, 66, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 140, 66, 0.25), inset 0 0 20px rgba(255, 140, 66, 0.05)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '16px',
                    }}>
                      <div style={{
                        color: '#ff8c42',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        textShadow: '0 0 10px rgba(255, 140, 66, 0.3)',
                      }}>
                        {month} Loss
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 140, 66, 0.3)',
                        color: '#ff8c42',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        📉 Loss
                      </span>
                    </div>

                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#ffb84d',
                      textShadow: '0 0 10px rgba(255, 140, 66, 0.4)',
                      marginBottom: '16px',
                    }}>
                      ${(currentMonthLoss / 1000).toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      })}K
                    </div>

                    {monthIndex > 0 && (
                      <div style={{
                        background: 'rgba(0, 212, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '12px',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        marginBottom: '12px',
                      }}>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#888',
                          marginBottom: '6px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}>
                          Previous Month ({months[monthIndex - 1]})
                        </div>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#00d4ff',
                        }}>
                          ${(previousMonthLoss / 1000).toLocaleString(undefined, {
                            maximumFractionDigits: 1,
                          })}K
                        </div>
                      </div>
                    )}

                    {monthIndex > 0 && (
                      <div style={{
                        background: isIncrease 
                          ? 'rgba(255, 107, 107, 0.08)' 
                          : 'rgba(76, 175, 80, 0.08)',
                        borderRadius: '10px',
                        padding: '12px',
                        border: isIncrease 
                          ? '1px solid rgba(255, 107, 107, 0.3)'
                          : '1px solid rgba(76, 175, 80, 0.3)',
                      }}>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#888',
                          marginBottom: '6px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}>
                          Month to Month Change
                        </div>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: isIncrease ? '#ff9999' : '#66bb6a',
                        }}>
                          {isIncrease ? '+' : ''} ${Math.abs(monthDifference / 1000).toLocaleString(undefined, {
                            maximumFractionDigits: 1,
                          })}K ({monthChangePercent.toFixed(1)}%)
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '12px' }}>All stores</div>
                  </div>
                )
              })}
            </div>

            {/* Sales Total */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.1), rgba(0, 212, 255, 0.05))',
              border: '2px solid #00d4ff',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.3), inset 0 0 30px rgba(0, 212, 255, 0.05)',
              marginBottom: '60px',
            }}>
              <div style={{
                color: '#00d4ff',
                fontWeight: '700',
                marginBottom: '15px',
                fontSize: '1.2rem',
                textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
              }}>
                5-Month Sales Total Loss
              </div>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: '700',
                color: '#00d4ff',
                textShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
              }}>
                $
                {(
                  data.reduce(
                    (sum, item) =>
                      sum + Math.abs(parseNumber(item['DIFFERENCE'])),
                    0
                  ) / 1000
                ).toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}
                K
              </div>
            </div>

            {/* GALLONS OVERVIEW */}
            <h2 style={{
              color: '#00d4ff',
              marginBottom: '30px',
              fontSize: '1.8rem',
              fontWeight: '700',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
            }}>
              ⛽ Gallons Overview - All Months
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}>
              {months.map((month, monthIndex) => {
                const currentMonthDiff = data
                  .filter((item) =>
                    String(item.Month).toUpperCase() === month.toUpperCase()
                  )
                  .reduce(
                    (sum, item) =>
                      sum + Math.abs(parseNumber(item['DIFFERENCE_1'])),
                    0
                  )

                // Get previous month difference for comparison
                let previousMonthDiff = 0
                if (monthIndex > 0) {
                  previousMonthDiff = data
                    .filter((item) =>
                      String(item.Month).toUpperCase() === months[monthIndex - 1].toUpperCase()
                    )
                    .reduce(
                      (sum, item) =>
                        sum + Math.abs(parseNumber(item['DIFFERENCE_1'])),
                      0
                    )
                }

                const monthDifference = currentMonthDiff - previousMonthDiff
                const monthChangePercent = previousMonthDiff > 0 ? ((monthDifference / previousMonthDiff) * 100) : 0
                const isIncrease = monthDifference > 0

                return (
                  <div
                    key={`gallons-${month}`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(100, 200, 100, 0.05))',
                      border: '2px solid #4caf50',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 0 20px rgba(76, 175, 80, 0.25), inset 0 0 20px rgba(76, 175, 80, 0.05)',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)'
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(76, 175, 80, 0.35), inset 0 0 20px rgba(76, 175, 80, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.25), inset 0 0 20px rgba(76, 175, 80, 0.05)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '16px',
                    }}>
                      <div style={{
                        color: '#4caf50',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        textShadow: '0 0 10px rgba(76, 175, 80, 0.3)',
                      }}>
                        {month} Difference
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(76, 175, 80, 0.3)',
                        color: '#66bb6a',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        📊 GAL
                      </span>
                    </div>

                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#66bb6a',
                      textShadow: '0 0 10px rgba(76, 175, 80, 0.4)',
                      marginBottom: '16px',
                    }}>
                      {currentMonthDiff.toLocaleString()}
                    </div>

                    {monthIndex > 0 && (
                      <div style={{
                        background: 'rgba(0, 212, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '12px',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        marginBottom: '12px',
                      }}>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#888',
                          marginBottom: '6px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}>
                          Previous Month ({months[monthIndex - 1]})
                        </div>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#00d4ff',
                        }}>
                          {previousMonthDiff.toLocaleString()}
                        </div>
                      </div>
                    )}

                    {monthIndex > 0 && (
                      <div style={{
                        background: isIncrease 
                          ? 'rgba(255, 107, 107, 0.08)' 
                          : 'rgba(76, 175, 80, 0.08)',
                        borderRadius: '10px',
                        padding: '12px',
                        border: isIncrease 
                          ? '1px solid rgba(255, 107, 107, 0.3)'
                          : '1px solid rgba(76, 175, 80, 0.3)',
                      }}>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#888',
                          marginBottom: '6px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}>
                          Month to Month Change
                        </div>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: isIncrease ? '#ff9999' : '#66bb6a',
                        }}>
                          {isIncrease ? '+' : ''} {Math.abs(monthDifference).toLocaleString()} ({monthChangePercent.toFixed(1)}%)
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '12px' }}>All stores</div>
                  </div>
                )
              })}
            </div>

            {/* Gallons Total */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(100, 200, 100, 0.05))',
              border: '2px solid #4caf50',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 0 30px rgba(76, 175, 80, 0.3), inset 0 0 30px rgba(76, 175, 80, 0.05)',
              marginBottom: '30px',
            }}>
              <div style={{
                color: '#4caf50',
                fontWeight: '700',
                marginBottom: '15px',
                fontSize: '1.2rem',
                textShadow: '0 0 10px rgba(76, 175, 80, 0.3)',
              }}>
                5-Month Gallons Total Difference
              </div>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: '700',
                color: '#4caf50',
                textShadow: '0 0 20px rgba(76, 175, 80, 0.4)',
              }}>
                {(
                  data.reduce(
                    (sum, item) =>
                      sum + Math.abs(parseNumber(item['DIFFERENCE_1'])),
                    0
                  )
                ).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Sales Comparison Chart - Now Respects Metric View */}
        {selectedStores.length > 0 && activeTab !== 'consistent-decline' && activeTab !== 'overview' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(100, 200, 255, 0.05))',
            border: '2px solid #00d4ff',
            borderRadius: '12px',
            padding: '25px',
            marginTop: '40px',
            marginBottom: '40px',
            boxShadow: '0 0 25px rgba(0, 212, 255, 0.25), inset 0 0 25px rgba(0, 212, 255, 0.05)',
          }}>
            <h2 style={{
              color: '#00d4ff',
              marginBottom: '20px',
              fontSize: '1.5rem',
              fontWeight: '700',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
            }}>
              {metricView === 'sales' ? '💰 Sales Comparison' : '⛽ Gallons Consumption'}
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: chartData.length > 5 ? 120 : 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.2)" />
                  <XAxis
                    dataKey="store"
                    angle={chartData.length > 5 ? -45 : 0}
                    textAnchor={chartData.length > 5 ? 'end' : 'middle'}
                    height={chartData.length > 5 ? 120 : 60}
                    tick={{ fontSize: 12, fill: '#888' }}
                    stroke="#00d4ff"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#888' }}
                    stroke="#00d4ff"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 20, 25, 0.95)',
                      border: '2px solid #00d4ff',
                      borderRadius: '8px',
                      boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                    }}
                    labelStyle={{ color: '#00d4ff', fontWeight: 'bold' }}
                    formatter={(value: any) => [
                      metricView === 'sales'
                        ? `$${Number(value).toLocaleString()}`
                        : `${Number(value).toLocaleString()}`,
                      ''
                    ]}
                    cursor={{ fill: 'rgba(0, 212, 255, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ color: '#00d4ff', fontWeight: '700' }} />
                  <Bar
                    dataKey={metricView === 'sales' ? 'salesCurrent' : 'gallonsCurrent'}
                    fill="#00d4ff"
                    name={metricView === 'sales' ? 'Current Sales (2025)' : 'Current Gallons (2025)'}
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey={metricView === 'sales' ? 'salesPrevious' : 'gallonsPrevious'}
                    fill="#64c8ff"
                    name={metricView === 'sales' ? 'Previous Sales (2024)' : 'Previous Gallons (2024)'}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                No data available
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '0.95rem',
          marginTop: '60px',
          paddingTop: '30px',
          borderTop: '1px solid rgba(0, 212, 255, 0.2)',
        }}>
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p style={{ marginTop: '10px', color: '#555' }}>📊 Store Performance Dashboard © 2025</p>
        </div>
      </div>
    </div>
  )
}

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
  const [consistentDeclineMetric, setConsistentDeclineMetric] = useState<'sales' | 'gallons'>('sales')

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

  const parseNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0
    
    const stringValue = String(value).trim()
    let cleanValue = stringValue.replace('%', '').trim()
    const hasParentheses = /\(.*\)/.test(cleanValue)
    const hasMinus = cleanValue.includes('-')
    const numericString = cleanValue.replace(/[^0-9.]/g, '')
    let parsed = parseFloat(numericString)
    
    if (isNaN(parsed)) return 0
    if (hasParentheses || hasMinus) {
      return -Math.abs(parsed)
    }
    return Math.abs(parsed)
  }

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

  const storesDecliningAllMonthsSales = useMemo(() => {
    // Get stores that have NEGATIVE SALES differences in ALL months (2025 vs 2024)
    const storesWithAllMonthsNegative: string[] = []
    
    // Group data by store
    const storeMonthData: { [key: string]: { [key: string]: number } } = {}
    
    data.forEach((item) => {
      const store = item['Store Name']
      if (!store) return
      
      const month = String(item.Month).toUpperCase().trim()
      // DIFFERENCE field already contains the calculated difference (2025 - 2024)
      // Negative means loss, positive means profit
      const difference = parseNumber(item['DIFFERENCE'])
      
      if (!storeMonthData[store]) {
        storeMonthData[store] = {}
      }
      
      if (month.includes('JUL')) storeMonthData[store]['JULY'] = difference
      if (month.includes('AUG')) storeMonthData[store]['AUGUST'] = difference
      if (month.includes('SEP')) storeMonthData[store]['SEPTEMBER'] = difference
      if (month.includes('OCT')) storeMonthData[store]['OCTOBER'] = difference
      if (month.includes('NOV')) storeMonthData[store]['NOVEMBER'] = difference
    })
    
    // Find stores where ALL months have negative differences (losses)
    Object.keys(storeMonthData).forEach((store) => {
      const monthData = storeMonthData[store]
      const hasAllMonths = 
        monthData['JULY'] !== undefined &&
        monthData['AUGUST'] !== undefined &&
        monthData['SEPTEMBER'] !== undefined &&
        monthData['OCTOBER'] !== undefined &&
        monthData['NOVEMBER'] !== undefined
      
      if (hasAllMonths) {
        // Check if ALL months show losses (negative differences)
        const allNegative = 
          monthData['JULY'] < 0 &&
          monthData['AUGUST'] < 0 &&
          monthData['SEPTEMBER'] < 0 &&
          monthData['OCTOBER'] < 0 &&
          monthData['NOVEMBER'] < 0
        
        if (allNegative) {
          storesWithAllMonthsNegative.push(store)
        }
      }
    })
    
    // Build the decline analysis for these stores
    const salesDeclineData: StoreData[] = []
    
    storesWithAllMonthsNegative.forEach((storeName) => {
      const storeItems = data.filter(item => item['Store Name'] === storeName)
      let totalLoss = 0
      let july = 0, august = 0, september = 0, october = 0, november = 0
      
      storeItems.forEach((item) => {
        const month = String(item.Month).toUpperCase().trim()
        const diff = Math.abs(parseNumber(item['DIFFERENCE']))
        totalLoss += diff
        
        if (month.includes('JUL')) july = diff
        if (month.includes('AUG')) august = diff
        if (month.includes('SEP')) september = diff
        if (month.includes('OCT')) october = diff
        if (month.includes('NOV')) november = diff
      })
      
      salesDeclineData.push({
        storeName,
        address: 'Store Location',
        july,
        august,
        september,
        october,
        november,
        totalLoss,
        severity: totalLoss > 50000 ? 'critical' : totalLoss > 30000 ? 'high' : 'moderate'
      })
    })
    
    return salesDeclineData.sort((a, b) => (b.totalLoss || 0) - (a.totalLoss || 0))
  }, [data])

  const storesDecliningAllMonthsGallons = useMemo(() => {
    // Get stores that have NEGATIVE GALLONS differences in ALL months (2025 vs 2024)
    const storesWithAllMonthsNegative: string[] = []
    
    // Group data by store for gallons
    const storeMonthData: { [key: string]: { [key: string]: number } } = {}
    
    data.forEach((item) => {
      const store = item['Store Name']
      if (!store) return
      
      const month = String(item.Month).toUpperCase().trim()
      // DIFFERENCE_1 field contains gallons difference (2025 - 2024)
      // Negative means decrease, positive means increase
      const difference = parseNumber(item['DIFFERENCE_1'])
      
      if (!storeMonthData[store]) {
        storeMonthData[store] = {}
      }
      
      if (month.includes('JUL')) storeMonthData[store]['JULY'] = difference
      if (month.includes('AUG')) storeMonthData[store]['AUGUST'] = difference
      if (month.includes('SEP')) storeMonthData[store]['SEPTEMBER'] = difference
      if (month.includes('OCT')) storeMonthData[store]['OCTOBER'] = difference
      if (month.includes('NOV')) storeMonthData[store]['NOVEMBER'] = difference
    })
    
    // Find stores where ALL months have negative differences for gallons
    Object.keys(storeMonthData).forEach((store) => {
      const monthData = storeMonthData[store]
      const hasAllMonths = 
        monthData['JULY'] !== undefined &&
        monthData['AUGUST'] !== undefined &&
        monthData['SEPTEMBER'] !== undefined &&
        monthData['OCTOBER'] !== undefined &&
        monthData['NOVEMBER'] !== undefined
      
      if (hasAllMonths) {
        const allNegative = 
          monthData['JULY'] < 0 &&
          monthData['AUGUST'] < 0 &&
          monthData['SEPTEMBER'] < 0 &&
          monthData['OCTOBER'] < 0 &&
          monthData['NOVEMBER'] < 0
        
        if (allNegative) {
          storesWithAllMonthsNegative.push(store)
        }
      }
    })
    
    // Build decline analysis for gallons
    const gallonsDeclineData: StoreData[] = []
    
    storesWithAllMonthsNegative.forEach((storeName) => {
      const storeItems = data.filter(item => item['Store Name'] === storeName)
      let totalLoss = 0
      let july = 0, august = 0, september = 0, october = 0, november = 0
      
      storeItems.forEach((item) => {
        const month = String(item.Month).toUpperCase().trim()
        const diff = Math.abs(parseNumber(item['DIFFERENCE_1']))
        totalLoss += diff
        
        if (month.includes('JUL')) july = diff
        if (month.includes('AUG')) august = diff
        if (month.includes('SEP')) september = diff
        if (month.includes('OCT')) october = diff
        if (month.includes('NOV')) november = diff
      })
      
      gallonsDeclineData.push({
        storeName,
        address: 'Store Location',
        july,
        august,
        september,
        october,
        november,
        totalLoss,
        severity: totalLoss > 50000 ? 'critical' : totalLoss > 30000 ? 'high' : 'moderate'
      })
    })
    
    return gallonsDeclineData.sort((a, b) => (b.totalLoss || 0) - (a.totalLoss || 0))
  }, [data])

  const criticalStores = useMemo(() => {
    const decliningStores = consistentDeclineMetric === 'sales' 
      ? storesDecliningAllMonthsSales 
      : storesDecliningAllMonthsGallons
    
    return decliningStores
      .filter((s) => s.severity === 'critical')
      .slice(0, 3)
  }, [storesDecliningAllMonthsSales, storesDecliningAllMonthsGallons, consistentDeclineMetric])

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

  const monthData = useMemo(() => {
    let resultData: any[] = []

    if (activeTab === 'overview') {
      resultData = declineAnalysis
        .filter((s) => selectedStores.includes(s.storeName))
    } else if (activeTab === 'consistent-decline') {
      // Use the appropriate declining stores based on the metric toggle
      resultData = (consistentDeclineMetric === 'sales' 
        ? storesDecliningAllMonthsSales 
        : storesDecliningAllMonthsGallons) as any
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

    if (activeTab !== 'overview' && activeTab !== 'consistent-decline' && resultData.length > 0) {
      const sortedData = [...resultData].sort((a: any, b: any) => {
        let aDifference = 0
        let bDifference = 0

        if (metricView === 'sales') {
          aDifference = parseNumber(a['DIFFERENCE'])
          bDifference = parseNumber(b['DIFFERENCE'])
        } else {
          aDifference = parseNumber(a['DIFFERENCE_1'])
          bDifference = parseNumber(b['DIFFERENCE_1'])
        }

        const aIsProfit = aDifference >= 0
        const bIsProfit = bDifference >= 0
        
        if (sortOrder === 'desc') {
          if (aIsProfit && !bIsProfit) return -1
          if (!aIsProfit && bIsProfit) return 1
          return bDifference - aDifference
        } else {
          if (aIsProfit && !bIsProfit) return 1
          if (!aIsProfit && bIsProfit) return -1
          return aDifference - bDifference
        }
      })
      return sortedData
    }

    return resultData
  }, [activeTab, data, selectedStores, declineAnalysis, storesDecliningAllMonthsSales, storesDecliningAllMonthsGallons, consistentDeclineMetric, metricView, sortOrder])

  const prepareChartData = (): ChartData[] => {
    return filteredData
      .map((item) => {
        const salesCurrent = parseNumber(item['Inside Sales 2025'])
        const gallonsCurrent = parseNumber(item['Gallons NOV 2025'])
        const salesPrevious = parseNumber(item['Inside Sales 2024'])
        const gallonsPrevious = parseNumber(item['Gallons NOV 2024'])

        let percentChangeValue = parseNumber(item['% CHANGE In Sales'])
        if (!isFinite(percentChangeValue) || percentChangeValue === null) {
          if (salesPrevious > 0) {
            percentChangeValue = ((salesCurrent - salesPrevious) / salesPrevious) * 100
          } else if (salesCurrent > 0) {
            percentChangeValue = 0
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', margin: '0 auto 20px', border: '3px solid #00d4ff', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#00d4ff', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', fontWeight: '600' }}>Loading your dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', padding: 'clamp(10px, 3vw, 20px)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(100, 200, 255, 0.1))',
          border: '2px solid #00d4ff',
          borderRadius: 'clamp(12px, 2vw, 16px)',
          padding: 'clamp(20px, 4vw, 30px)',
          marginBottom: 'clamp(20px, 3vw, 30px)',
          boxShadow: '0 0 30px rgba(0, 212, 255, 0.3), inset 0 0 30px rgba(0, 212, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          <h1 style={{ color: '#00d4ff', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', margin: '0 0 10px 0', fontWeight: '700', textShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}>
            📊 Store Performance Dashboard
          </h1>
          <p style={{ color: '#64c8ff', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', margin: '0', opacity: 0.9 }}>
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
            flexWrap: 'wrap',
          }}>
            <AlertCircle size={24} />
            <span style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>{error}</span>
          </div>
        )}

        {/* Month Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          marginBottom: 'clamp(20px, 3vw, 30px)',
          paddingBottom: '10px',
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
              borderRadius: '10px',
              fontSize: 'clamp(0.85rem, 2vw, 1rem)',
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
                padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
                borderRadius: '10px',
                fontSize: 'clamp(0.85rem, 2vw, 1rem)',
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
              padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
              borderRadius: '10px',
              fontSize: 'clamp(0.85rem, 2vw, 1rem)',
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

        {/* Store Filter Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(100, 200, 255, 0.05))',
          border: '2px solid #00d4ff',
          borderRadius: '12px',
          padding: 'clamp(15px, 3vw, 20px)',
          marginBottom: 'clamp(20px, 3vw, 30px)',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.05)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <h3 style={{ margin: 0, color: '#00d4ff', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: '700', textShadow: '0 0 10px rgba(0, 212, 255, 0.3)' }}>
              🏪 Store Filter ({selectedStores.length} selected)
            </h3>
            <button
              onClick={() => setShowStoreFilter(!showStoreFilter)}
              style={{
                padding: 'clamp(8px, 2vw, 10px) clamp(14px, 3vw, 16px)',
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
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
                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
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

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <button
                  onClick={selectAllStores}
                  style={{
                    padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 14px)',
                    fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
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
                    padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 14px)',
                    fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(150px, 30vw, 180px), 1fr))',
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
                      <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: '#aaa' }}>{store}</span>
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
                  fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                }}>
                  No stores found matching "{storeSearchInput}"
                </div>
              )}
            </div>
          )}

          {selectedStores.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {selectedStores.map((store) => (
                <div
                  key={store}
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(100, 200, 255, 0.3))',
                    color: '#00d4ff',
                    padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 14px)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
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
            padding: 'clamp(20px, 4vw, 25px)',
            marginBottom: 'clamp(20px, 3vw, 30px)',
            boxShadow: '0 0 30px rgba(255, 107, 107, 0.3), inset 0 0 30px rgba(255, 107, 107, 0.05)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'start' }}>
                <AlertCircle size={28} style={{ color: '#ff6b6b', flexShrink: 0, textShadow: '0 0 10px rgba(255, 107, 107, 0.5)' }} />
                <div>
                  <h3 style={{ color: '#ff9999', fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', margin: '0 0 5px 0', fontWeight: '700', textShadow: '0 0 10px rgba(255, 107, 107, 0.3)' }}>
                    Critical Alert: {criticalStores.length} Stores Need Immediate Attention
                  </h3>
                  <p style={{ color: '#ff9999', fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)', margin: '5px 0 0 0', opacity: 0.8 }}>
                    Showing stores declining in {consistentDeclineMetric === 'sales' ? 'Sales' : 'Gallons'} across ALL 5 months
                  </p>
                </div>
              </div>

              {/* Toggle Button for Sales/Gallons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setConsistentDeclineMetric('sales')}
                  style={{
                    padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)',
                    borderRadius: '8px',
                    fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
                    fontWeight: '700',
                    border: consistentDeclineMetric === 'sales' ? '2px solid #ff6b6b' : '2px solid #3a4250',
                    cursor: 'pointer',
                    background: consistentDeclineMetric === 'sales'
                      ? 'rgba(255, 107, 107, 0.2)'
                      : 'rgba(255, 107, 107, 0.05)',
                    color: consistentDeclineMetric === 'sales' ? '#ff9999' : '#888',
                    transition: 'all 0.3s',
                    boxShadow: consistentDeclineMetric === 'sales' ? '0 0 15px rgba(255, 107, 107, 0.4)' : 'none',
                  }}
                >
                  💰 Sales Decline
                </button>
                <button
                  onClick={() => setConsistentDeclineMetric('gallons')}
                  style={{
                    padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)',
                    borderRadius: '8px',
                    fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
                    fontWeight: '700',
                    border: consistentDeclineMetric === 'gallons' ? '2px solid #ff6b6b' : '2px solid #3a4250',
                    cursor: 'pointer',
                    background: consistentDeclineMetric === 'gallons'
                      ? 'rgba(255, 107, 107, 0.2)'
                      : 'rgba(255, 107, 107, 0.05)',
                    color: consistentDeclineMetric === 'gallons' ? '#ff9999' : '#888',
                    transition: 'all 0.3s',
                    boxShadow: consistentDeclineMetric === 'gallons' ? '0 0 15px rgba(255, 107, 107, 0.4)' : 'none',
                  }}
                >
                  ⛽ Gallons Decline
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 40vw, 320px), 1fr))',
              gap: '20px',
            }}>
              {criticalStores.map((store) => (
                <div
                  key={store.storeName}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 100, 100, 0.05))',
                    borderRadius: '12px',
                    padding: 'clamp(18px, 3vw, 20px)',
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
                  <div style={{ fontWeight: 'bold', color: '#ff9999', marginBottom: '10px', fontSize: 'clamp(1rem, 2.2vw, 1.1rem)' }}>
                    {store.storeName}
                  </div>
                  <div style={{ fontSize: 'clamp(0.85rem, 1.9vw, 0.95rem)', color: '#999', marginBottom: '12px' }}>
                    {store.address}
                  </div>
                  <div style={{
                    fontSize: 'clamp(1.5rem, 3vw, 1.8rem)',
                    fontWeight: 'bold',
                    color: '#ff6b6b',
                    marginBottom: '8px',
                    textShadow: '0 0 10px rgba(255, 107, 107, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}>
                    {consistentDeclineMetric === 'sales' ? '$' : ''}{(store.totalLoss || 0).toLocaleString()}
                    <span style={{
                      fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255, 107, 107, 0.3)',
                      color: '#ff9999',
                      fontWeight: '700',
                    }}>
                      📉 LOSS
                    </span>
                  </div>
                  <div style={{ fontSize: 'clamp(0.75rem, 1.7vw, 0.85rem)', color: '#999' }}>
                    Total {consistentDeclineMetric === 'sales' ? 'Sales' : 'Gallons'} Loss Across All Months
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Critical Stores Message */}
        {activeTab === 'consistent-decline' && criticalStores.length === 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(100, 200, 100, 0.05))',
            border: '2px solid #4caf50',
            borderRadius: '12px',
            padding: 'clamp(25px, 4vw, 30px)',
            marginBottom: 'clamp(20px, 3vw, 30px)',
            boxShadow: '0 0 25px rgba(76, 175, 80, 0.2)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setConsistentDeclineMetric('sales')}
                style={{
                  padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
                  fontWeight: '700',
                  border: consistentDeclineMetric === 'sales' ? '2px solid #4caf50' : '2px solid #3a4250',
                  cursor: 'pointer',
                  background: consistentDeclineMetric === 'sales'
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'rgba(76, 175, 80, 0.05)',
                  color: consistentDeclineMetric === 'sales' ? '#66bb6a' : '#888',
                  transition: 'all 0.3s',
                  boxShadow: consistentDeclineMetric === 'sales' ? '0 0 15px rgba(76, 175, 80, 0.3)' : 'none',
                }}
              >
                💰 Sales Decline
              </button>
              <button
                onClick={() => setConsistentDeclineMetric('gallons')}
                style={{
                  padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
                  fontWeight: '700',
                  border: consistentDeclineMetric === 'gallons' ? '2px solid #4caf50' : '2px solid #3a4250',
                  cursor: 'pointer',
                  background: consistentDeclineMetric === 'gallons'
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'rgba(76, 175, 80, 0.05)',
                  color: consistentDeclineMetric === 'gallons' ? '#66bb6a' : '#888',
                  transition: 'all 0.3s',
                  boxShadow: consistentDeclineMetric === 'gallons' ? '0 0 15px rgba(76, 175, 80, 0.3)' : 'none',
                }}
              >
                ⛽ Gallons Decline
              </button>
            </div>
            <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '15px' }}>✅</div>
            <h3 style={{ color: '#4caf50', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', margin: '0 0 10px 0', fontWeight: '700' }}>
              Good News!
            </h3>
            <p style={{ color: '#66bb6a', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', margin: '0' }}>
              No stores are declining in {consistentDeclineMetric === 'sales' ? 'Sales' : 'Gallons'} across all 5 months
            </p>
          </div>
        )}

        {/* Month Decline Analysis */}
        {activeTab !== 'consistent-decline' && activeTab !== 'overview' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(20px, 3vw, 30px)',
              flexWrap: 'wrap',
              gap: '20px',
            }}>
              <div>
                <h2 style={{ color: '#00d4ff', marginBottom: '10px', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: '700', textShadow: '0 0 10px rgba(0, 212, 255, 0.3)' }}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 2025 Decline Analysis
                </h2>
                {monthData.length > 0 && (
                  <div style={{
                    fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
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

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setMetricView('sales')}
                  style={{
                    padding: 'clamp(10px, 2vw, 12px) clamp(18px, 3vw, 24px)',
                    borderRadius: '10px',
                    fontSize: 'clamp(0.85rem, 2vw, 1rem)',
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
                    padding: 'clamp(10px, 2vw, 12px) clamp(18px, 3vw, 24px)',
                    borderRadius: '10px',
                    fontSize: 'clamp(0.85rem, 2vw, 1rem)',
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

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSortOrder('desc')}
                  style={{
                    padding: 'clamp(10px, 2vw, 12px) clamp(18px, 3vw, 24px)',
                    borderRadius: '10px',
                    fontSize: 'clamp(0.85rem, 2vw, 1rem)',
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
                    padding: 'clamp(10px, 2vw, 12px) clamp(18px, 3vw, 24px)',
                    borderRadius: '10px',
                    fontSize: 'clamp(0.85rem, 2vw, 1rem)',
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

            {/* Store Cards Grid - RESPONSIVE */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 45vw, 350px), 1fr))',
              gap: 'clamp(18px, 3vw, 24px)',
              marginBottom: '40px',
            }}>
              {monthData.map((item, idx) => {
                const differenceValueRaw = metricView === 'sales'
                  ? parseNumber(item['DIFFERENCE'])
                  : parseNumber(item['DIFFERENCE_1'])
                
                const sales2025 = parseNumber(item['Inside Sales 2025'])
                const sales2024 = parseNumber(item['Inside Sales 2024'])
                const gallons2025 = parseNumber(item['Gallons NOV 2025'])
                const gallons2024 = parseNumber(item['Gallons NOV 2024'])
                
                let actualDifference = differenceValueRaw
                
                if (metricView === 'sales') {
                  if (sales2024 === 0) {
                    actualDifference = sales2025
                  } else {
                    actualDifference = sales2025 - sales2024
                  }
                } else {
                  if (gallons2024 === 0) {
                    actualDifference = gallons2025
                  } else {
                    actualDifference = gallons2025 - gallons2024
                  }
                }
                
                const isLoss = actualDifference < 0
                const isProfit = actualDifference > 0
                const differenceValue = Math.abs(actualDifference)
                
                let percentChangeValue = 0
                let isNewStoreNoPriorData = false
                
                if (sales2024 > 0 || gallons2024 > 0) {
                  const prev = metricView === 'sales' ? sales2024 : gallons2024
                  const curr = metricView === 'sales' ? sales2025 : gallons2025
                  percentChangeValue = ((curr - prev) / prev) * 100
                } else if (sales2025 > 0 || gallons2025 > 0) {
                  isNewStoreNoPriorData = true
                  percentChangeValue = 0
                } else {
                  percentChangeValue = 0
                }
                
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
                      padding: 'clamp(20px, 3vw, 24px)',
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
                      width: 'clamp(45px, 8vw, 50px)',
                      height: 'clamp(45px, 8vw, 50px)',
                      background: isProfit 
                        ? 'linear-gradient(135deg, #4caf50, #66bb6a)'
                        : 'linear-gradient(135deg, #ff6b6b, #ff4444)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)',
                      fontWeight: '700',
                      color: 'white',
                      boxShadow: isProfit
                        ? '0 0 20px rgba(76, 175, 80, 0.5)'
                        : '0 0 20px rgba(255, 107, 107, 0.5)',
                    }}>
                      #{idx + 1}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '18px', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: 'clamp(0.75rem, 1.7vw, 0.85rem)', color: '#888', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Store Name
                        </div>
                        <div style={{
                          fontSize: 'clamp(1rem, 2.2vw, 1.15rem)',
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
                        fontSize: 'clamp(1.6rem, 3.5vw, 2rem)',
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
                          fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)',
                          color: '#888',
                          marginBottom: '6px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          2025 {metricView === 'sales' ? '(Sales)' : '(Gallons)'}
                        </div>
                        <div style={{
                          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
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
                          fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)',
                          color: '#888',
                          marginBottom: '6px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          2024 {metricView === 'sales' ? '(Sales)' : '(Gallons)'}
                        </div>
                        <div style={{
                          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
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
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}>
                        <div style={{
                          fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: isProfit ? '#66bb6a' : '#ff9999',
                        }}>
                          {isProfit ? 'Profit 📈' : 'Loss 📉'}
                        </div>
                        <div style={{
                          fontSize: 'clamp(0.65rem, 1.4vw, 0.7rem)',
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
                        fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)',
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
            <h2 style={{
              color: '#00d4ff',
              marginBottom: 'clamp(20px, 3vw, 30px)',
              fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
              fontWeight: '700',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
            }}>
              💰 Sales Overview - All Months
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(260px, 40vw, 300px), 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}>
              {months.map((month, monthIndex) => {
                // Calculate TOTAL SALES for this month (sum of all Inside Sales 2025 for this month)
                const currentMonthTotal = data
                  .filter((item) =>
                    String(item.Month).toUpperCase() === month.toUpperCase()
                  )
                  .reduce(
                    (sum, item) =>
                      sum + parseNumber(item['Inside Sales 2025']),
                    0
                  )

                // Get previous month total for comparison
                let previousMonthTotal = 0
                if (monthIndex > 0) {
                  previousMonthTotal = data
                    .filter((item) =>
                      String(item.Month).toUpperCase() === months[monthIndex - 1].toUpperCase()
                    )
                    .reduce(
                      (sum, item) =>
                        sum + parseNumber(item['Inside Sales 2025']),
                      0
                    )
                }

                const monthDifference = currentMonthTotal - previousMonthTotal
                const monthChangePercent = previousMonthTotal > 0 ? ((monthDifference / previousMonthTotal) * 100) : 0
                const isIncrease = monthDifference > 0

                return (
                  <div
                    key={month}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 140, 66, 0.1), rgba(255, 120, 50, 0.05))',
                      border: '2px solid #ff8c42',
                      borderRadius: '12px',
                      padding: 'clamp(20px, 3vw, 24px)',
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
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}>
                      <div style={{
                        color: '#ff8c42',
                        fontWeight: '700',
                        fontSize: 'clamp(1rem, 2.2vw, 1.1rem)',
                        textShadow: '0 0 10px rgba(255, 140, 66, 0.3)',
                      }}>
                        {month} Comparison
                      </div>
                      <span style={{
                        fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 140, 66, 0.3)',
                        color: '#ff8c42',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        📊 SALES
                      </span>
                    </div>

                    <div style={{
                      fontSize: 'clamp(1.6rem, 3.5vw, 2rem)',
                      fontWeight: '700',
                      color: '#ffb84d',
                      textShadow: '0 0 10px rgba(255, 140, 66, 0.4)',
                      marginBottom: '16px',
                    }}>
                      ${(currentMonthTotal / 1000).toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      })}K
                    </div>

                    {monthIndex > 0 && (
                      <>
                        <div style={{
                          background: 'rgba(0, 212, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '12px',
                          border: '1px solid rgba(0, 212, 255, 0.3)',
                          marginBottom: '12px',
                        }}>
                          <div style={{
                            fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
                            color: '#888',
                            marginBottom: '6px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                          }}>
                            Previous Month ({months[monthIndex - 1]})
                          </div>
                          <div style={{
                            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                            fontWeight: '700',
                            color: '#00d4ff',
                          }}>
                            ${(previousMonthTotal / 1000).toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            })}K
                          </div>
                        </div>

                        <div style={{
                          background: isIncrease 
                            ? 'rgba(76, 175, 80, 0.08)' 
                            : 'rgba(255, 107, 107, 0.08)',
                          borderRadius: '10px',
                          padding: '12px',
                          border: isIncrease 
                            ? '1px solid rgba(76, 175, 80, 0.3)'
                            : '1px solid rgba(255, 107, 107, 0.3)',
                        }}>
                          <div style={{
                            fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
                            color: '#888',
                            marginBottom: '6px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                          }}>
                            Month to Month Change
                          </div>
                          <div style={{
                            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                            fontWeight: '700',
                            color: isIncrease ? '#66bb6a' : '#ff9999',
                          }}>
                            {isIncrease ? '+' : ''} ${Math.abs(monthDifference / 1000).toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            })}K ({monthChangePercent.toFixed(1)}%)
                          </div>
                        </div>
                      </>
                    )}

                    <div style={{ fontSize: 'clamp(0.75rem, 1.7vw, 0.85rem)', color: '#888', marginTop: '12px' }}>All stores</div>
                  </div>
                )
              })}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.1), rgba(0, 212, 255, 0.05))',
              border: '2px solid #00d4ff',
              borderRadius: '12px',
              padding: 'clamp(25px, 4vw, 30px)',
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.3), inset 0 0 30px rgba(0, 212, 255, 0.05)',
              marginBottom: '60px',
            }}>
              <div style={{
                color: '#00d4ff',
                fontWeight: '700',
                marginBottom: '15px',
                fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
              }}>
                5-Month Sales Total
              </div>
              <div style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                fontWeight: '700',
                color: '#00d4ff',
                textShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
              }}>
                $
                {(
                  data.reduce(
                    (sum, item) =>
                      sum + parseNumber(item['Inside Sales 2025']),
                    0
                  ) / 1000
                ).toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}
                K
              </div>
            </div>

            <h2 style={{
              color: '#00d4ff',
              marginBottom: 'clamp(20px, 3vw, 30px)',
              fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
              fontWeight: '700',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
            }}>
              ⛽ Gallons Overview - All Months
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(260px, 40vw, 300px), 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}>
              {months.map((month, monthIndex) => {
                // Calculate TOTAL GALLONS for this month (sum of all Gallons NOV 2025 for this month)
                const currentMonthTotal = data
                  .filter((item) =>
                    String(item.Month).toUpperCase() === month.toUpperCase()
                  )
                  .reduce(
                    (sum, item) =>
                      sum + parseNumber(item['Gallons NOV 2025']),
                    0
                  )

                // Get previous month total for comparison
                let previousMonthTotal = 0
                if (monthIndex > 0) {
                  previousMonthTotal = data
                    .filter((item) =>
                      String(item.Month).toUpperCase() === months[monthIndex - 1].toUpperCase()
                    )
                    .reduce(
                      (sum, item) =>
                        sum + parseNumber(item['Gallons NOV 2025']),
                      0
                    )
                }

                const monthDifference = currentMonthTotal - previousMonthTotal
                const monthChangePercent = previousMonthTotal > 0 ? ((monthDifference / previousMonthTotal) * 100) : 0
                const isIncrease = monthDifference > 0

                return (
                  <div
                    key={`gallons-${month}`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(100, 200, 100, 0.05))',
                      border: '2px solid #4caf50',
                      borderRadius: '12px',
                      padding: 'clamp(20px, 3vw, 24px)',
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
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}>
                      <div style={{
                        color: '#4caf50',
                        fontWeight: '700',
                        fontSize: 'clamp(1rem, 2.2vw, 1.1rem)',
                        textShadow: '0 0 10px rgba(76, 175, 80, 0.3)',
                      }}>
                        {month} Comparison
                      </div>
                      <span style={{
                        fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(76, 175, 80, 0.3)',
                        color: '#66bb6a',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        ⛽ GAL
                      </span>
                    </div>

                    <div style={{
                      fontSize: 'clamp(1.6rem, 3.5vw, 2rem)',
                      fontWeight: '700',
                      color: '#66bb6a',
                      textShadow: '0 0 10px rgba(76, 175, 80, 0.4)',
                      marginBottom: '16px',
                    }}>
                      {currentMonthTotal.toLocaleString()}
                    </div>

                    {monthIndex > 0 && (
                      <>
                        <div style={{
                          background: 'rgba(0, 212, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '12px',
                          border: '1px solid rgba(0, 212, 255, 0.3)',
                          marginBottom: '12px',
                        }}>
                          <div style={{
                            fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
                            color: '#888',
                            marginBottom: '6px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                          }}>
                            Previous Month ({months[monthIndex - 1]})
                          </div>
                          <div style={{
                            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                            fontWeight: '700',
                            color: '#00d4ff',
                          }}>
                            {previousMonthTotal.toLocaleString()}
                          </div>
                        </div>

                        <div style={{
                          background: isIncrease 
                            ? 'rgba(76, 175, 80, 0.08)' 
                            : 'rgba(255, 107, 107, 0.08)',
                          borderRadius: '10px',
                          padding: '12px',
                          border: isIncrease 
                            ? '1px solid rgba(76, 175, 80, 0.3)'
                            : '1px solid rgba(255, 107, 107, 0.3)',
                        }}>
                          <div style={{
                            fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
                            color: '#888',
                            marginBottom: '6px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                          }}>
                            Month to Month Change
                          </div>
                          <div style={{
                            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                            fontWeight: '700',
                            color: isIncrease ? '#66bb6a' : '#ff9999',
                          }}>
                            {isIncrease ? '+' : ''} {Math.abs(monthDifference).toLocaleString()} ({monthChangePercent.toFixed(1)}%)
                          </div>
                        </div>
                      </>
                    )}

                    <div style={{ fontSize: 'clamp(0.75rem, 1.7vw, 0.85rem)', color: '#888', marginTop: '12px' }}>All stores</div>
                  </div>
                )
              })}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(100, 200, 100, 0.05))',
              border: '2px solid #4caf50',
              borderRadius: '12px',
              padding: 'clamp(25px, 4vw, 30px)',
              boxShadow: '0 0 30px rgba(76, 175, 80, 0.3), inset 0 0 30px rgba(76, 175, 80, 0.05)',
              marginBottom: '30px',
            }}>
              <div style={{
                color: '#4caf50',
                fontWeight: '700',
                marginBottom: '15px',
                fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                textShadow: '0 0 10px rgba(76, 175, 80, 0.3)',
              }}>
                5-Month Gallons Total
              </div>
              <div style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                fontWeight: '700',
                color: '#4caf50',
                textShadow: '0 0 20px rgba(76, 175, 80, 0.4)',
              }}>
                {(
                  data.reduce(
                    (sum, item) =>
                      sum + parseNumber(item['Gallons NOV 2025']),
                    0
                  )
                ).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Sales Comparison Chart */}
        {selectedStores.length > 0 && activeTab !== 'consistent-decline' && activeTab !== 'overview' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(100, 200, 255, 0.05))',
            border: '2px solid #00d4ff',
            borderRadius: '12px',
            padding: 'clamp(20px, 3vw, 25px)',
            marginTop: '40px',
            marginBottom: '40px',
            boxShadow: '0 0 25px rgba(0, 212, 255, 0.25), inset 0 0 25px rgba(0, 212, 255, 0.05)',
          }}>
            <h2 style={{
              color: '#00d4ff',
              marginBottom: '20px',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
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
              <div style={{ textAlign: 'center', color: '#666', padding: '40px', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                No data available
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: '#666',
          fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
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

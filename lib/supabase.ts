import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nmhkkelxeswoucqcvnos.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taGtrZWx4ZXN3b3VjcWN2bm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MzY0NjksImV4cCI6MjA3NTUxMjQ2OX0.8J4X5xGCnNfttLHueT6OH7HV0WJeY2_jVMgKRH1zEdc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export type MonthlyTrendData = {
  'Store_Name': string | null
  'Inside Sales NOV 25 (Projected)': string | null
  'Inside Sales NOV 24': string | null
  'DIFFERENCE': string | null
  '% CHANGE': string | null
  'Gallons NOV 25 (Projected)': string | null
  'Gallons NOV 24': string | null
  'DIFFERENCE_1': string | null
  '% CHANGE_1': string | null
  'Month': string | null
}

// Function to fetch ALL data with pagination
export async function getAllMonthlyTrend() {
  let allData: MonthlyTrendData[] = []
  let start = 0
  const pageSize = 1000
  
  while (true) {
    const { data, error } = await supabase
      .from('Bottom to Top')
      .select('*')
      .range(start, start + pageSize - 1)

    if (error) {
      console.error('Error fetching data:', error)
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      break
    }

    allData = [...allData, ...data]
    
    // If we got less than pageSize, we're done
    if (data.length < pageSize) {
      break
    }
    
    start += pageSize
  }

  return { data: allData, error: null }
}

// Debug function to see what's happening
export async function debugFetch() {
  console.log('Starting fetch...')
  
  // First, get the total count
  const { count } = await supabase
    .from('Bottom to Top')
    .select('*', { count: 'exact', head: true })
  
  console.log('Total count in table:', count)
  
  // Now fetch in batches
  let allData: MonthlyTrendData[] = []
  let start = 0
  const pageSize = 1000
  let iteration = 0

  while (true) {
    iteration++
    console.log(`Fetching batch ${iteration}: rows ${start} to ${start + pageSize - 1}`)
    
    const { data, error } = await supabase
      .from('Bottom to Top')
      .select('*')
      .range(start, start + pageSize - 1)

    if (error) {
      console.error('Error:', error)
      return { data: null, error, totalFetched: allData.length }
    }

    console.log(`Batch ${iteration} returned ${data?.length || 0} rows`)
    
    if (!data || data.length === 0) {
      break
    }

    allData = [...allData, ...data]
    
    if (data.length < pageSize) {
      console.log('Last batch - stopping')
      break
    }
    
    start += pageSize
  }

  console.log('Total rows fetched:', allData.length)
  return { data: allData, error: null, totalFetched: allData.length }
}

// Function to fetch by month
export async function getMonthlyTrendByMonth(month: string) {
  const { data, error } = await supabase
    .from('Bottom to Top')
    .select('*')
    .eq('Month', month)
    .limit(10000) // Set high limit for filtered queries

  if (error) {
    console.error('Error fetching data:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Function to fetch by store
export async function getMonthlyTrendByStore(storeName: string) {
  const { data, error } = await supabase
    .from('Bottom to Top')
    .select('*')
    .eq('Store_Name', storeName)
    .limit(10000)

  if (error) {
    console.error('Error fetching data:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Function to fetch by month AND store
export async function getMonthlyTrendByMonthAndStore(month: string, storeName: string) {
  const { data, error } = await supabase
    .from('Bottom to Top')
    .select('*')
    .eq('Month', month)
    .eq('Store_Name', storeName)

  if (error) {
    console.error('Error fetching data:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Function to get unique months
export async function getUniqueMonths() {
  const { data, error } = await supabase
    .from('Bottom to Top')
    .select('Month')
    .limit(10000)

  if (error) {
    console.error('Error fetching months:', error)
    return { months: [], error }
  }

  const uniqueMonths = [...new Set(data?.map(d => d.Month).filter(Boolean))]
  return { months: uniqueMonths, error: null }
}

// Function to get unique stores
export async function getUniqueStores() {
  const { data, error } = await supabase
    .from('Bottom to Top')
    .select('Store_Name')
    .limit(10000)

  if (error) {
    console.error('Error fetching stores:', error)
    return { stores: [], error }
  }

  const uniqueStores = [...new Set(data?.map(d => d['Store_Name']).filter(Boolean))]
  return { stores: uniqueStores, error: null }
}
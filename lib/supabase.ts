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

// Function to fetch all data
export async function getAllMonthlyTrend() {
  const { data, error } = await supabase
    .from('Bottom to Top')
    .select('*')

  if (error) {
    console.error('Error fetching data:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Function to fetch by month
export async function getMonthlyTrendByMonth(month: string) {
  const { data, error } = await supabase
    .from('Bottom to Top')
    .select('*')
    .eq('Month', month)

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

  if (error) {
    console.error('Error fetching stores:', error)
    return { stores: [], error }
  }

  const uniqueStores = [...new Set(data?.map(d => d['Store_Name']).filter(Boolean))]
  return { stores: uniqueStores, error: null }
}

// Function to fetch with limit
export async function getMonthlyTrendLimit(limit: number) {
  const { data, error } = await supabase
    .from('Bottom to Top')
    .select('*')
    .limit(limit)

  if (error) {
    console.error('Error fetching data:', error)
    return { data: null, error }
  }

  return { data, error: null }
}
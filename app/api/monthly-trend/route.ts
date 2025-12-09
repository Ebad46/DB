import { NextResponse } from 'next/server'
import { getAllMonthlyTrend, debugFetch } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const debug = searchParams.get('debug') === 'true'

  try {
    // Use debug mode if requested
    const result = debug ? await debugFetch() : await getAllMonthlyTrend()

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: result.data?.length || 0,
      data: result.data
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
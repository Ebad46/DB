import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Monthly Trend Dashboard',
  description: 'Interactive dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
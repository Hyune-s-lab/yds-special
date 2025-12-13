import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YDS Special',
  description: 'YDS Special Project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}

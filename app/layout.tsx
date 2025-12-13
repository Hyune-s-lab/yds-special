import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YDS Special',
  description: '네이버 쇼핑 최저가 검색',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <header className="header">
          <div className="logo">YDS Special</div>
          <nav className="nav">
            <span className="nav-item active">네이버 최저가</span>
            <span className="nav-item tbd">치앙마이 항공권 (TBD)</span>
            <span className="nav-item tbd">환율 계산기 (TBD)</span>
            <span className="nav-item tbd">배송 추적 (TBD)</span>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}

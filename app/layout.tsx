'use client'

import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <title>YDS Special</title>
        <meta name="description" content="네이버 쇼핑 최저가 검색" />
      </head>
      <body>
        <header className="header">
          <div className="logo">YDS Special</div>
          <nav className="nav">
            <span className="nav-item active">네이버 최저가</span>
            <span className="nav-item tbd">치앙마이 항공권 (TBD)</span>
            <span className="nav-item tbd">환율 계산기 (TBD)</span>
            <span className="nav-item tbd">배송 추적 (TBD)</span>
          </nav>
          <div className="header-spacer"></div>
          <button className="easter-egg-btn" onClick={() => {
            const modal = document.getElementById('origin-modal');
            if (modal) modal.style.display = 'flex';
          }}>탄생 설화</button>
        </header>

        <div id="origin-modal" className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            (e.target as HTMLElement).style.display = 'none';
          }
        }}>
          <div className="modal-content origin-modal">
            <div className="modal-image-container">
              <img src="/origin-story.png" alt="탄생 설화" className="modal-image" />
            </div>
            <div className="modal-body">
              이 사이트는 위대하신 염 수령 동지의 치앙마이 해외 시찰 중<br/>
              우연히 만난 무기징역 사형수에게 위스키와 모종의 조건을 하사하시며 탄생했습니다.
              <div className="modal-footnote">
                <s><i>그 날의 위스키는 달콤했고, 아이디어는 더욱 달콤했다고 전해집니다.</i></s><br/>
                <s><i>⚠️ 다소 과장과 의역이 있습니다. 아무튼 팩트입니다.</i></s>
              </div>
            </div>
            <button className="modal-close-btn" onClick={() => {
              const modal = document.getElementById('origin-modal');
              if (modal) modal.style.display = 'none';
            }}>경배하고 닫기</button>
          </div>
        </div>
        {children}
      </body>
    </html>
  )
}

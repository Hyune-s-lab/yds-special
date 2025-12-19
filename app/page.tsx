'use client'

import { useState, useRef, useEffect } from 'react'

interface Product {
  name: string
  link: string
  mall: string
  price: number
  position: 'up' | 'down'
  productType: string
}

interface SearchResult {
  total: number
  items: Product[]
  raw: unknown
  searchedAt: string
}

const PRESET_BRANDS = [
  {
    name: '레븐',
    sizes: [
      { size: '20인치', threshold: 129000 },
      { size: '24인치', threshold: 159000 },
      { size: '28인치', threshold: 199000 },
    ],
  },
  {
    name: '로든',
    sizes: [
      { size: '20인치', threshold: 149000 },
      { size: '24인치', threshold: 179000 },
      { size: '28인치', threshold: 219000 },
    ],
  },
  {
    name: '픽턴',
    sizes: [
      { size: '20인치', threshold: 399000 },
      { size: '24인치', threshold: 449000 },
      { size: '28인치', threshold: 509000 },
    ],
  },
  {
    name: '데일',
    sizes: [
      { size: '20인치', threshold: 139000 },
      { size: '24인치', threshold: 169000 },
      { size: '28인치', threshold: 209000 },
    ],
  },
  {
    name: '엘론',
    sizes: [
      { size: '20인치', threshold: 159000 },
      { size: '24인치', threshold: 189000 },
      { size: '28인치', threshold: 229000 },
    ],
  },
  {
    name: '브라이튼 루미',
    sizes: [
      { size: '20인치', threshold: 119000 },
      { size: '24인치', threshold: 149000 },
      { size: '28인치', threshold: 189000 },
    ],
  },
]

type ViewerTab = 'analysis' | 'raw' | 'processed'

export default function Home() {
  const [query, setQuery] = useState('')
  const [threshold, setThreshold] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewerTab, setViewerTab] = useState<ViewerTab>('analysis')
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const accordionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accordionRef.current && !accordionRef.current.contains(e.target as Node)) {
        setExpandedBrand(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim() || !threshold.trim()) {
      setError('검색어와 기준가격을 모두 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&threshold=${threshold}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '검색 중 오류가 발생했습니다.')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원'
  }

  const handleReport = async (item: Product) => {
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          mall: item.mall,
          price: item.price,
          link: item.link,
        }),
      })
      if (res.ok) {
        setToast({ message: '슬랙으로 리포팅 완료!', type: 'success' })
      } else {
        setToast({ message: '문제가 생겼습니다! YDS를 불러주세요 🚨', type: 'error' })
      }
    } catch {
      setToast({ message: '문제가 생겼습니다! YDS를 불러주세요 🚨', type: 'error' })
    }
  }

  return (
    <>
      {toast && (
        <div className="toast-overlay" onClick={() => setToast(null)}>
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}
    <div className="container">
      {/* 좌측 패널 */}
      <div className="left-panel">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">검색어</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 보튼 캐리어 20인치"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">기준가격 (원)</label>
              <input
                type="number"
                className="form-input"
                placeholder="예: 129000"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? '검색 중...' : '검색'}
          </button>
        </form>

        {/* 프리셋 아코디언 */}
        <div className="preset-section">
          <div className="preset-accordion" ref={accordionRef}>
            {PRESET_BRANDS.map((brand) => (
              <div key={brand.name} className="accordion-item">
                <button
                  className={`accordion-header ${expandedBrand === brand.name ? 'expanded' : ''}`}
                  onClick={() => setExpandedBrand(expandedBrand === brand.name ? null : brand.name)}
                >
                  {brand.name}
                  <span className="accordion-arrow">{expandedBrand === brand.name ? '▲' : '▼'}</span>
                </button>
                {expandedBrand === brand.name && (
                  <div className="accordion-content">
                    {brand.sizes.map((item) => (
                      <button
                        key={item.size}
                        className="preset-item"
                        onClick={() => {
                          setQuery(`${brand.name} ${item.size}`)
                          setThreshold(item.threshold.toString())
                          setExpandedBrand(null)
                        }}
                      >
                        <span className="preset-size">{item.size}</span>
                        <span className="preset-price">{item.threshold.toLocaleString()}원</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {loading && <div className="loading">검색 중입니다...</div>}

        {result && (
          <div className="results">
            <div className="results-header">
              <div className="results-summary">
                총 <strong>{result.total.toLocaleString()}</strong>개 중{' '}
                <strong>{result.items.length}</strong>개 표시 |{' '}
                기준가 이하: <strong style={{ color: '#00c471' }}>
                  {result.items.filter(i => i.position === 'down').length}
                </strong>개 |{' '}
                기준가 초과: <strong style={{ color: '#f04452' }}>
                  {result.items.filter(i => i.position === 'up').length}
                </strong>개
              </div>
              {result.total > 1000 && (
                <div className="results-warning">
                  검색 결과가 1000개를 초과합니다. 더 정확한 검색어를 넣어주세요.
                </div>
              )}
            </div>
            <div className="results-list">
              {result.items.map((item, index) => (
                <div key={index} className="result-item">
                  <span className="result-num">{index + 1}</span>
                  <div className="result-info">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="result-name" data-tooltip={item.name}>{item.name}</a>
                    <span className="result-mall">{item.mall}</span>
                  </div>
                  <div className={`result-price ${item.position}`}>
                    {formatPrice(item.price)}
                  </div>
                  <button className="report-btn" onClick={() => handleReport(item)}>
                    리포트
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 우측 패널 */}
      <div className="right-panel">
        <div className="right-header">
          <button
            className={`viewer-tab ${viewerTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setViewerTab('analysis')}
          >
            분석
          </button>
          <button
            className={`viewer-tab ${viewerTab === 'raw' ? 'active' : ''}`}
            onClick={() => setViewerTab('raw')}
          >
            원본 JSON
          </button>
          <button
            className={`viewer-tab ${viewerTab === 'processed' ? 'active' : ''}`}
            onClick={() => setViewerTab('processed')}
          >
            정제 JSON
          </button>
        </div>
        <div className="right-content">
          {result ? (
            <>
              {viewerTab === 'analysis' && (
                <div className="analysis-view">
                  <div className="analysis-card">
                    <div className="analysis-card-title">가격 요약</div>
                    <div className="analysis-stats">
                      <div className="stat-item">
                        <span className="stat-label">최저가</span>
                        <span className="stat-value down">
                          {Math.min(...result.items.map(i => i.price)).toLocaleString()}원
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">최고가</span>
                        <span className="stat-value up">
                          {Math.max(...result.items.map(i => i.price)).toLocaleString()}원
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">평균가</span>
                        <span className="stat-value">
                          {Math.round(result.items.reduce((a, b) => a + b.price, 0) / result.items.length).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="analysis-card">
                    <div className="analysis-card-title">기준가 대비 분포</div>
                    <div className="ratio-bar-container">
                      <div
                        className="ratio-bar down"
                        style={{ width: `${(result.items.filter(i => i.position === 'down').length / result.items.length) * 100}%` }}
                      >
                        {result.items.filter(i => i.position === 'down').length}개
                      </div>
                      <div
                        className="ratio-bar up"
                        style={{ width: `${(result.items.filter(i => i.position === 'up').length / result.items.length) * 100}%` }}
                      >
                        {result.items.filter(i => i.position === 'up').length}개
                      </div>
                    </div>
                    <div className="ratio-legend">
                      <span className="legend-item down">기준가 이하</span>
                      <span className="legend-item up">기준가 초과</span>
                    </div>
                  </div>

                  <div className="analysis-card">
                    <div className="analysis-card-title">쇼핑몰 TOP 5</div>
                    <div className="mall-ranking">
                      {Object.entries(
                        result.items.reduce((acc, item) => {
                          acc[item.mall] = (acc[item.mall] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([mall, count], idx) => (
                          <div key={mall} className="mall-rank-item">
                            <span className="rank-num">{idx + 1}</span>
                            <span className="rank-mall">{mall}</span>
                            <span className="rank-count">{count}개</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}
              {viewerTab === 'raw' && (
                <pre className="json-viewer">
                  {JSON.stringify(result.raw, null, 2)}
                </pre>
              )}
              {viewerTab === 'processed' && (
                <pre className="json-viewer">
                  {JSON.stringify({ searchedAt: result.searchedAt, total: result.total, items: result.items }, null, 2)}
                </pre>
              )}
            </>
          ) : (
            <div className="viewer-placeholder">
              검색 결과가 여기에 표시됩니다
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

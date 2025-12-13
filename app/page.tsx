'use client'

import { useState } from 'react'

interface Product {
  name: string
  mall: string
  price: number
  position: 'up' | 'down'
}

interface SearchResult {
  total: number
  items: Product[]
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [threshold, setThreshold] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="container">
      {/* 좌측 패널 */}
      <div className="left-panel">
        <form className="search-form" onSubmit={handleSearch}>
          <h2 className="form-title">네이버 쇼핑 최저가 검색</h2>
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
              {result.total > 100 && (
                <div className="results-warning">
                  검색 결과가 100개가 넘지 않도록 더 정확한 검색어를 넣어주세요.
                </div>
              )}
            </div>
            <div className="results-list">
              {result.items.map((item, index) => (
                <div key={index} className="result-item">
                  <div className="result-info">
                    <span className="result-name">{item.name}</span>
                    <span className="result-mall">{item.mall}</span>
                  </div>
                  <div className={`result-price ${item.position}`}>
                    {formatPrice(item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 우측 패널 */}
      <div className="right-panel">
        <div className="viewer-placeholder">
          뷰어 영역
        </div>
      </div>
    </div>
  )
}

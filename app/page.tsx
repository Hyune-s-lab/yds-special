'use client'

import { useState, useEffect } from 'react'

interface Product {
  name: string
  mall: string
  price: number
  position: 'up' | 'down'
  productType: string
}

interface SearchResult {
  total: number
  items: Product[]
  raw: unknown
}

interface SearchHistory {
  query: string
  threshold: number
  timestamp: number
}

type JsonTab = 'raw' | 'processed'

export default function Home() {
  const [query, setQuery] = useState('')
  const [threshold, setThreshold] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [jsonTab, setJsonTab] = useState<JsonTab>('processed')
  const [history, setHistory] = useState<SearchHistory[]>([])

  // 페이지 로드 시 검색 기록 불러오기
  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(() => {})
  }, [])

  const saveHistory = async (q: string, t: number) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, threshold: t }),
      })
      // 기록 새로고침
      const res = await fetch('/api/history')
      const data = await res.json()
      setHistory(data)
    } catch {}
  }

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
      // 검색 성공 시 기록 저장
      saveHistory(query, parseInt(threshold, 10))
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleHistoryClick = (h: SearchHistory) => {
    setQuery(h.query)
    setThreshold(h.threshold.toString())
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원'
  }

  return (
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

        {/* 최근 검색 기록 */}
        {history.length > 0 && (
          <div className="history">
            <div className="history-title">최근 검색</div>
            <div className="history-list">
              {history.map((h, index) => (
                <button
                  key={index}
                  className="history-item"
                  onClick={() => handleHistoryClick(h)}
                >
                  <span className="history-query">{h.query}</span>
                  <span className="history-threshold">{h.threshold.toLocaleString()}원</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
                    <span className="result-name" title={item.name}>{item.name}</span>
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
        <div className="right-header">
          <button
            className={`viewer-tab ${jsonTab === 'raw' ? 'active' : ''}`}
            onClick={() => setJsonTab('raw')}
          >
            Raw
          </button>
          <button
            className={`viewer-tab ${jsonTab === 'processed' ? 'active' : ''}`}
            onClick={() => setJsonTab('processed')}
          >
            Processed
          </button>
        </div>
        <div className="right-content">
          {result ? (
            <pre className="json-viewer">
              {jsonTab === 'raw'
                ? JSON.stringify(result.raw, null, 2)
                : JSON.stringify({ total: result.total, items: result.items }, null, 2)
              }
            </pre>
          ) : (
            <div className="viewer-placeholder">
              검색 결과가 여기에 JSON으로 표시됩니다
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

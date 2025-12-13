import { NextRequest, NextResponse } from 'next/server'

interface SearchHistory {
  query: string
  threshold: number
  timestamp: number
}

// 인메모리 저장소 (서버 재시작 시 초기화됨)
const searchHistory: SearchHistory[] = []
const MAX_HISTORY = 10

export async function GET() {
  return NextResponse.json(searchHistory)
}

export async function POST(request: NextRequest) {
  try {
    const { query, threshold } = await request.json()

    if (!query || !threshold) {
      return NextResponse.json(
        { error: '검색어와 기준가격이 필요합니다.' },
        { status: 400 }
      )
    }

    // 중복 제거 (같은 검색어+기준가격이 있으면 삭제)
    const existingIndex = searchHistory.findIndex(
      h => h.query === query && h.threshold === threshold
    )
    if (existingIndex !== -1) {
      searchHistory.splice(existingIndex, 1)
    }

    // 새 기록 추가 (맨 앞에)
    searchHistory.unshift({
      query,
      threshold,
      timestamp: Date.now(),
    })

    // 최대 개수 유지
    if (searchHistory.length > MAX_HISTORY) {
      searchHistory.pop()
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: '기록 저장 실패' },
      { status: 500 }
    )
  }
}

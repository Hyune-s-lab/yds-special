import { NextRequest, NextResponse } from 'next/server'

interface NaverItem {
  title: string
  mallName: string
  lprice: string
}

interface NaverResponse {
  total: number
  items: NaverItem[]
}

function cleanHtml(text: string): string {
  return text.replace(/<[^>]+>/g, '')
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  const threshold = searchParams.get('threshold')

  if (!query || !threshold) {
    return NextResponse.json(
      { error: '검색어와 기준가격을 입력해주세요.' },
      { status: 400 }
    )
  }

  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'API 설정이 필요합니다.' },
      { status: 500 }
    )
  }

  const thresholdNum = parseInt(threshold, 10)
  if (isNaN(thresholdNum)) {
    return NextResponse.json(
      { error: '기준가격은 숫자여야 합니다.' },
      { status: 400 }
    )
  }

  try {
    const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=100&sort=asc`

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    })

    if (!response.ok) {
      throw new Error(`네이버 API 오류: ${response.status}`)
    }

    const data: NaverResponse = await response.json()

    const items = data.items.map((item) => {
      const price = parseInt(item.lprice, 10) || 0
      return {
        name: cleanHtml(item.title),
        mall: item.mallName || '알 수 없음',
        price,
        position: price >= thresholdNum ? 'up' : 'down' as const,
      }
    })

    return NextResponse.json({
      total: data.total,
      items,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

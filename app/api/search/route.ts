import { NextRequest, NextResponse } from 'next/server'

interface NaverItem {
  title: string
  link: string
  mallName: string
  lprice: string
  productType: string
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
    const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=100&sort=asc&exclude=used:rental:cbshop`

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    })

    if (!response.ok) {
      throw new Error(`네이버 API 오류: ${response.status}`)
    }

    const data = await response.json()

    const productTypeMap: Record<string, string> = {
      '1': '일반상품',
      '2': '일반상품+카탈로그',
      '3': '카탈로그',
    }

    const items = data.items.map((item: NaverItem) => {
      const price = parseInt(item.lprice, 10) || 0
      return {
        name: cleanHtml(item.title),
        link: item.link,
        mall: item.mallName || '알 수 없음',
        price,
        position: price >= thresholdNum ? 'up' : 'down' as const,
        productType: productTypeMap[item.productType] || item.productType,
      }
    })

    return NextResponse.json({
      total: data.total,
      items,
      raw: data,
      searchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

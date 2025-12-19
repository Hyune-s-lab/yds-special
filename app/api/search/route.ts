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
    const baseUrl = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=100&sort=asc&exclude=used:rental:cbshop`
    const headers = {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    }

    // 첫 번째 요청
    const firstResponse = await fetch(`${baseUrl}&start=1`, { headers })
    if (!firstResponse.ok) {
      throw new Error(`네이버 API 오류: ${firstResponse.status}`)
    }
    const firstData: NaverResponse = await firstResponse.json()

    // 추가 요청이 필요한지 확인 (최대 10번 = 1000개)
    const total = firstData.total
    const pageCount = Math.min(Math.ceil(total / 100), 10)

    let allRawItems: NaverItem[] = [...firstData.items]
    const rawResponses: NaverResponse[] = [firstData]

    if (pageCount > 1) {
      // 나머지 페이지 병렬 요청 (start: 101, 201, 301, ...)
      const additionalRequests = []
      for (let i = 2; i <= pageCount; i++) {
        const start = (i - 1) * 100 + 1
        additionalRequests.push(
          fetch(`${baseUrl}&start=${start}`, { headers })
            .then(res => res.ok ? res.json() : null)
        )
      }

      const additionalResponses = await Promise.all(additionalRequests)
      for (const data of additionalResponses) {
        if (data && data.items) {
          allRawItems = [...allRawItems, ...data.items]
          rawResponses.push(data)
        }
      }
    }

    const productTypeMap: Record<string, string> = {
      '1': '일반상품',
      '2': '일반상품+카탈로그',
      '3': '카탈로그',
    }

    const items = allRawItems.map((item: NaverItem) => {
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
      total,
      items,
      raw: rawResponses.length === 1 ? rawResponses[0] : rawResponses,
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

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL || ''

  try {
    const body = await request.json()
    const { name, mall, price, link } = body

    if (!link) {
      return NextResponse.json(
        { error: '상품 URL이 필요합니다.' },
        { status: 400 }
      )
    }

    const reportedAt = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const slackMessage = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 최저가 리포트',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*상품명:*\n${name}`,
            },
            {
              type: 'mrkdwn',
              text: `*쇼핑몰:*\n${mall}`,
            },
            {
              type: 'mrkdwn',
              text: `*가격:*\n${price.toLocaleString()}원`,
            },
            {
              type: 'mrkdwn',
              text: `*리포팅 일시:*\n${reportedAt}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*상품 URL:*\n<${link}|상품 페이지 바로가기>`,
          },
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    })

    if (!response.ok) {
      throw new Error('슬랙 전송 실패')
    }

    return NextResponse.json({ success: true, reportedAt })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json(
      { error: '리포팅 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

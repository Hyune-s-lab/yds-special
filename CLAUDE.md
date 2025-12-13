# YDS Special - 네이버 쇼핑 최저가 검색

## 프로젝트 개요
네이버 쇼핑 API를 활용하여 상품을 검색하고, 기준가격 대비 상/하 분류를 제공하는 웹앱

## 주요 기능
- 검색어 입력
- 기준가격 설정
- 네이버 쇼핑 API 호출 (100개 고정)
- 기준가격 대비 up/down 분류 표시
- total 값 표시 (100 초과 시 "미지원 기능, 검색어를 더 정확하게 입력해주세요" 안내)

## API 정보
- **Endpoint**: `https://openapi.naver.com/v1/search/shop.json`
- **인증**: X-Naver-Client-Id, X-Naver-Client-Secret 헤더
- **정렬**: `sort=asc` (가격 오름차순, 최저가부터)

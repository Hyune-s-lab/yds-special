# YDS Special - 네이버 쇼핑 최저가 검색

## 프로젝트 개요
네이버 쇼핑 API를 활용하여 상품을 검색하고, 기준가격 대비 상/하 분류를 제공하는 웹앱

## 주요 기능

### 좌측 패널
- 검색어 + 기준가격 입력 폼
- 최근 검색 기록 (서버 인메모리, 최대 10개)
- 검색 결과 목록 (상품명, 쇼핑몰 라벨, 가격)
- 100개 초과 시 경고 메시지

### 우측 패널
- **분석 탭**: 가격 요약(최저/최고/평균), 기준가 분포 막대, 쇼핑몰 TOP 5
- **원본 JSON 탭**: 네이버 API 원본 응답
- **정제 JSON 탭**: 가공된 데이터 (searchedAt ISO8601 포함)

## API 정보
- **Endpoint**: `https://openapi.naver.com/v1/search/shop.json`
- **인증**: X-Naver-Client-Id, X-Naver-Client-Secret 헤더
- **정렬**: `sort=asc` (가격 오름차순, 최저가부터)
- **개수**: `display=100` (고정)

## 정제 데이터 필드
- `searchedAt`: 검색 실행 시각 (ISO8601)
- `total`: 전체 검색 결과 수
- `items[]`: name, mall, price, position(up/down), productType(상품군)

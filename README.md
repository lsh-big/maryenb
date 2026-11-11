# MaryenB 제품 안내 쇼핑몰

JavaScript 기반의 MaryenB 제품 안내 사이트입니다. Next.js에서 화면과 API를 함께 운영하고, PostgreSQL과 Prisma로 제품과 주문 데이터를 관리합니다.

## 기술 구성

- 프론트엔드 / 서버 렌더링: Next.js App Router, React
- API: Next.js Route Handlers (`/api/products`)
- 데이터베이스: PostgreSQL
- ORM / 스키마 / 샘플 데이터: Prisma
- 장바구니: 브라우저 `localStorage`

## 시작하기

필요한 도구: Node.js 20 이상, npm, Docker Desktop

```bash
npm install
Copy-Item .env.example .env
docker compose up -d db
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

PowerShell에서 위 명령을 실행한 뒤 `http://localhost:3000`을 엽니다. `.env.example`은 로컬 개발용 기본 설정입니다. 운영 환경에서는 별도의 안전한 데이터베이스 계정과 환경 변수를 사용하세요.

## 제품 사진과 데이터

- 제공된 제작 자료의 원본은 `C:\maryenb-쇼핑몰-제작-자료`에 그대로 두고, 이미지 사본을 `public/images/` 아래 카테고리별로 복사했습니다.
- 홈페이지 히어로, 제품 카드와 로고는 `public/images/homepage/`, `public/images/logo/`의 제공 이미지를 사용합니다. 카드뉴스와 제품 이미지는 `public/images/cardnews/`, `public/images/product/`에 보관합니다.
- 제품 이름, 라벨 기준 성분과 함량, 이미지, 국내 판매 안내는 `src/data/products.json`에서 관리합니다. `prisma/seed.js`가 같은 자료를 PostgreSQL에 등록합니다.
- 한국 판매 가격과 판매 조건은 아직 확인되지 않았으므로 가격을 임의로 넣지 않았고 장바구니/결제 기능은 비활성화되어 있습니다. DB 연결 전에도 제품 안내 화면을 미리 볼 수 있습니다.
- 안내서의 제품 표현 기준을 따라 라벨에 표시된 사실만 안내합니다. 효능 보장 문구나 만들어 낸 후기는 사용하지 않습니다. 제공된 제품 사진과 라벨은 원본을 변경하지 않습니다.

## API

- `GET /api/products`: 활성 제품 목록
- `GET /api/products?category=세럼`: 카테고리별 목록
- `GET /api/products?featured=true&limit=8`: 추천 제품 목록 (최대 100개)

주문과 주문 상품 스키마도 포함되어 있습니다. 판매를 시작하기 전 실제 판매 주체, 브랜드 사용 권한, 국내 가격, 사업자·통신판매 표시, 개인정보 처리방침, 배송·반품 조건을 확정해야 합니다. 체크아웃은 서버 측 검증과 PG 연동을 마치기 전까지 비활성 상태입니다. 제품 정보와 판매 전 확인사항은 `/policies`에서도 확인할 수 있습니다.

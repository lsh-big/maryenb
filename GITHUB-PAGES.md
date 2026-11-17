# GitHub Pages 배포

배포 주소: https://lsh-big.github.io/maryenb/

`main` 브랜치에 push하면 `.github/workflows/pages.yml`이 정적 사이트를 빌드하고 GitHub Pages로 배포합니다. 저장소 Settings → Pages의 Source는 GitHub Actions를 사용합니다.

## 시연 기능

GitHub Pages에는 Node 서버가 없으므로 회원가입·로그인·게스트·장바구니·주문·재고는 해당 브라우저의 저장소에서만 동작합니다. 시연 계정은 실제 회원 인증 서비스가 아니며 브라우저 데이터를 지우면 계정·주문·재고가 초기화됩니다. 다른 기기와 데이터가 공유되지 않습니다. 실제 개인정보나 실제 사용하는 비밀번호를 입력하지 마세요.

네이버페이·카카오페이·토스페이·KG이니시스는 가상 주문 선택지입니다. 실제 결제창, 청구 또는 배송이 발생하지 않습니다. 실제 판매로 전환하려면 별도의 서버와 결제 연동이 필요합니다.

## 로컬 빌드

```powershell
Set-Location -LiteralPath C:\git\maryenb
npm.cmd ci
npm.cmd run build:pages
```

결과는 `out/`에 생성됩니다. `/maryenb/` 하위 경로에 맞춰 이미지·스크립트·스타일·이동 경로를 조정합니다. 저장소 이름을 바꾸면 GITHUB_REPOSITORY 또는 PAGES_BASE_PATH로 경로를 설정합니다. 사용자 루트 저장소(`사용자명.github.io`)는 빈 경로로 생성합니다.

빌더는 원본 소스를 보존하고 `.pages-build/`에 정적 전용 사본을 만듭니다. 이 사본에서는 API 서버를 제외하고 브라우저 시연 저장소와 로그인 안내를 사용합니다. 기존 `npm run dev`와 `npm start`는 서버 버전으로 계속 동작합니다.

`.data/`, `.env`, `node_modules/`, `.next/`, `.pages-build/`, `out/`은 Git에 포함하지 않습니다. 사이트 배포에는 `out/`의 정적 산출물만 업로드합니다.

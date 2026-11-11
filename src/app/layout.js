import "./globals.css";
import Link from "next/link";
import { CartProvider } from "../components/cart-provider";
import { SiteHeader } from "../components/site-header";

export const metadata = {
  title: {
    default: "MARYENB | 마리엔비",
    template: "%s | MARYENB",
  },
  description: "MaryenB 페이셜 세럼 제품 라벨과 성분 정보를 안내합니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <CartProvider>
          <div className="announcement">
            스마트스토어 공개 상품 정보 기준 · 가격과 재고는 변동될 수 있습니다
          </div>
          <SiteHeader />
          <main>{children}</main>
          <footer className="site-footer">
            <div className="footer-inner">
              <Link className="wordmark footer-wordmark" href="/">
                <span>MaryenB</span>
              </Link>
              <p>
                네이버 스마트스토어의 공개된 제품 정보를 안내합니다. 이 사이트에서는 주문·결제를
                제공하지 않으며, 최신 가격·재고·배송 정보는 스마트스토어에서 확인해 주세요.
              </p>
              <p className="footer-small">
                네이버 스토어 판매자 프로필 표기: 주식회사 써티트리 · 대표 박성일
              </p>
              <Link className="footer-policy-link" href="/policies">
                판매자·이용·개인정보 안내 및 판매 시작 전 확인사항
              </Link>
              <div className="footer-links">
                <a href="https://maryenb.co.kr/" target="_blank" rel="noreferrer">
                  MaryenB 한국어 사이트
                </a>
                <a href="https://blog.naver.com/maryenb-skincare" target="_blank" rel="noreferrer">
                  네이버 블로그
                </a>
                <a href="https://instagram.com/maryenb_official" target="_blank" rel="noreferrer">
                  인스타그램
                </a>
                <a
                  href="https://smartstore.naver.com/maryenb"
                  target="_blank"
                  rel="noreferrer"
                >
                  네이버 스마트스토어
                </a>
              </div>
              <p className="footer-small">
                © {new Date().getFullYear()} MARYENB. All rights reserved.
              </p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}

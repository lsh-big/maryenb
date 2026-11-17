import "./globals.css";
import Link from "next/link";
import { CartProvider } from "../components/cart-provider";
import { SiteHeader } from "../components/site-header";
import { isVirtualDatabase } from "../lib/database-mode";
import { AuthProvider } from "../components/auth-provider";
import { seller } from "../data/seller";

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
        <AuthProvider><CartProvider>
          <div className="announcement">
            {isVirtualDatabase() ? "가상 쇼핑 체험 · 실제 결제 및 배송은 진행되지 않습니다" : "MY DAILY RITUAL · 오늘도 나를 아끼는 작은 습관"}
          </div>
          <SiteHeader />
          <main>{children}</main>
          <footer className="site-footer">
            <div className="footer-inner">
              <Link className="wordmark footer-wordmark" href="/">
                <span>MaryenB</span>
              </Link>
              <p>
                {isVirtualDatabase() ? "성분으로 고르는 나의 데일리 세럼, MaryenB. 회원 로그인 또는 게스트 입장으로 가상 구매를 체험해 보세요. 실제 결제와 배송은 진행되지 않습니다." : "나를 위한 데일리 세럼, MaryenB. 상품별 가격과 구매 가능 여부를 확인해 주세요."}
              </p>
              <dl className="footer-business" aria-label="사업자 정보">
                <div><dt>상호</dt><dd>{seller.name}</dd></div>
                <div><dt>대표자</dt><dd>{seller.representative}</dd></div>
                <div><dt>사업자등록번호</dt><dd>{seller.registrationNumber}</dd></div>
                <div className="footer-business-address"><dt>사업장 소재지</dt><dd>{seller.address}</dd></div>
                <div><dt>업태</dt><dd>{seller.businessType}</dd></div>
                <div><dt>종목</dt><dd>{seller.businessCategory}</dd></div>
              </dl>
              <Link className="footer-policy-link" href="/policies">
                판매자·이용·개인정보 안내
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
                <Link href="/#products">상품 구매</Link>
              </div>
              <p className="footer-small">
                © {new Date().getFullYear()} MARYENB. All rights reserved.
              </p>
            </div>
          </footer>
        </CartProvider></AuthProvider>
      </body>
    </html>
  );
}

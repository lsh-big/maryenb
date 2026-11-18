import "./globals.css";
import Link from "next/link";
import { CartProvider } from "../components/cart-provider";
import { SiteHeader } from "../components/site-header";
import { isVirtualDatabase } from "../lib/database-mode";
import { AuthProvider } from "../components/auth-provider";
import { seller } from "../data/seller";

export const viewport = { viewportFit: "cover" };

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
            {isVirtualDatabase() ? "가상 쇼핑 체험 · 실제 결제 및 배송은 진행되지 않습니다" : "마리엔비 세럼"}
          </div>
          <SiteHeader />
          <main>{children}</main>
          <footer className="site-footer">
            <div className="footer-inner">
              <div className="footer-business" aria-label="사업자 정보">
                <strong>{seller.name}</strong>
                <span>대표 {seller.representative}</span>
                <span>사업자등록번호 {seller.registrationNumber}</span>
              </div>
              <Link className="footer-policy-link" href="/policies">
                판매자·이용·개인정보 안내
              </Link>
            </div>
          </footer>
        </CartProvider></AuthProvider>
      </body>
    </html>
  );
}

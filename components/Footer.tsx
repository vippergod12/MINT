import Link from 'next/link';
import { COMPANY, EMAIL, HOTLINE, SITE_NAME } from '@/lib/seo/siteConfig';

export default function Footer() {
  const year = new Date().getFullYear();
  const telHref = `tel:${HOTLINE.replace(/\s+/g, '')}`;

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col footer-brand-col">
          <Link href="/" className="footer-logo">
            <span className="brand-mark">M</span>
            <span className="footer-logo-text">{SITE_NAME}</span>
          </Link>
          <p className="footer-tag">
            Xưởng sản xuất túi vải không dệt thân thiện môi trường — in logo
            theo yêu cầu, MOQ thấp, giao hàng toàn quốc, cam kết chất lượng.
          </p>
          <ul className="footer-contact">
            <li>
              <span className="footer-contact-label">Xưởng:</span>
              {COMPANY.address}
            </li>
            <li>
              <span className="footer-contact-label">Hotline:</span>
              <a href={telHref}>{HOTLINE}</a>
            </li>
            <li>
              <span className="footer-contact-label">Email:</span>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <span className="footer-contact-label">Giờ làm việc:</span>
              {COMPANY.workingHours}
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Về MINT</h4>
          <ul>
            <li>
              <Link href="/gioi-thieu">Câu chuyện thương hiệu</Link>
            </li>
            <li>
              <Link href="/cua-hang">Toàn bộ sản phẩm</Link>
            </li>
            <li>
              <Link href="/tu-van">Báo giá theo yêu cầu</Link>
            </li>
            <li>
              <Link href="/">Quy trình sản xuất</Link>
            </li>
            <li>
              <Link href="/">Quy trình in ấn logo</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li>
              <Link href="/">Hướng dẫn đặt hàng số lượng lớn</Link>
            </li>
            <li>
              <Link href="/">Chính sách vận chuyển toàn quốc</Link>
            </li>
            <li>
              <Link href="/">Chính sách đổi trả & bảo hành</Link>
            </li>
            <li>
              <Link href="/">Chính sách thanh toán</Link>
            </li>
            <li>
              <Link href="/">Chính sách bảo mật</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {year} {COMPANY.name}. Mọi quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

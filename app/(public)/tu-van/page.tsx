import type { Metadata } from 'next';
import ConsultationForm from '@/components/consultation/ConsultationForm';
import { HOTLINE, SITE_NAME } from '@/lib/seo/siteConfig';

export const metadata: Metadata = {
  title: `Báo giá / Đặt hàng — ${SITE_NAME}`,
  description:
    'Để lại số điện thoại — đội ngũ MINT sẽ tư vấn chọn vải, kích thước, in logo và báo giá chi tiết trong vòng 30 phút (giờ hành chính).',
  alternates: { canonical: '/tu-van' },
  openGraph: {
    title: `Báo giá / Đặt hàng túi vải không dệt — ${SITE_NAME}`,
    description: 'Báo giá miễn phí trong 30 phút cùng chuyên viên MINT.',
    url: '/tu-van',
    type: 'website',
  },
};

const telHref = `tel:${HOTLINE.replace(/\s+/g, '')}`;

export default function ConsultationPage() {
  return (
    <div className="consult-page">
      <section className="consult-section">
        <div className="container consult-grid">
          {/* Cột trái: thông điệp + lý do nên đăng ký */}
          <div className="consult-intro">
            <span className="consult-eyebrow">— Tư vấn & báo giá 1:1 —</span>
            <h1 className="consult-title">
              Để chúng tôi <em>báo giá</em> cho lô túi của bạn
            </h1>
            <p className="consult-lead">
              Mỗi đơn hàng có yêu cầu riêng — kích thước, định lượng vải, kiểu
              quai, cách in logo. Để lại số điện thoại, chuyên viên MINT sẽ
              gọi bạn trong vòng <strong>30 phút</strong> (giờ hành chính)
              để tư vấn và gửi báo giá chi tiết qua Zalo.
            </p>

            <ul className="consult-perks">
              <li>
                <span className="consult-perk-mark" aria-hidden>
                  {'◆\uFE0E'}
                </span>
                <div>
                  <strong>Báo giá miễn phí, không ràng buộc</strong>
                  <span>Bạn không cần đặt hàng ngay sau khi nhận báo giá.</span>
                </div>
              </li>
              <li>
                <span className="consult-perk-mark" aria-hidden>
                  {'◆\uFE0E'}
                </span>
                <div>
                  <strong>Chuyên viên hiểu xưởng — báo giá chuẩn</strong>
                  <span>Tư vấn chọn vải 60–100 GSM, kiểu in phù hợp ngân sách.</span>
                </div>
              </li>
              <li>
                <span className="consult-perk-mark" aria-hidden>
                  {'◆\uFE0E'}
                </span>
                <div>
                  <strong>Bảo mật tuyệt đối</strong>
                  <span>Số điện thoại của bạn chỉ dùng cho mục đích báo giá.</span>
                </div>
              </li>
            </ul>

            <div className="consult-hotline">
              <span>Hoặc gọi trực tiếp:</span>
              <a href={telHref}>{HOTLINE}</a>
            </div>
          </div>

          {/* Cột phải: form */}
          <div className="consult-form-wrap">
            <ConsultationForm />
          </div>
        </div>
      </section>
    </div>
  );
}

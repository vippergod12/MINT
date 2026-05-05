import Reveal from '../Reveal';

/**
 * Section khẳng định MINT là nhà SẢN XUẤT + PHÂN PHỐI TRỰC TIẾP — không qua trung gian.
 *
 * Mục tiêu: gia tăng độ tin cậy ngay above-the-fold (sau Marquee).
 *  - Big stats grid để truyền tải quy mô bằng con số
 *  - Trust badges thể hiện cam kết B2B (KCS, VAT, cam kết giá)
 *  - Có CTA mời báo giá → kết nối với /tu-van
 *
 * Đặt là Server Component (không có state); animation chỉ ở Reveal wrapper.
 */

interface Stat {
  num: string;
  label: string;
  /** Mô tả phụ nhỏ hiện dưới label (tuỳ chọn) */
  hint?: string;
}

const STATS: Stat[] = [
  { num: '12+', label: 'Năm sản xuất', hint: 'Khởi nguồn từ 2014' },
  { num: '2.000+', label: 'Thương hiệu đã phục vụ', hint: 'Shop, doanh nghiệp & sự kiện' },
  { num: '5.000', label: 'm² nhà xưởng', hint: 'Tại TP.HCM' },
  { num: '50.000+', label: 'Túi / tháng', hint: 'Năng lực sản xuất' },
  { num: '63/63', label: 'Tỉnh thành phân phối', hint: 'Giao toàn quốc 1–3 ngày' },
  { num: '30 phút', label: 'Báo giá miễn phí', hint: 'Phản hồi qua Zalo / điện thoại' },
];

interface Pillar {
  mark: string;
  title: string;
  body: string;
}

const PILLARS: Pillar[] = [
  {
    mark: '◇',
    title: 'Trực tiếp từ xưởng',
    body: 'Không qua đại lý — giá tốt hơn 30–40% so với mua qua trung gian.',
  },
  {
    mark: '◆',
    title: 'KCS 100% sản phẩm',
    body: 'Kiểm định chất lượng từng lô trước giao — đường may, in ấn, kích thước.',
  },
  {
    mark: '○',
    title: 'Hoá đơn VAT đầy đủ',
    body: 'Hỗ trợ doanh nghiệp xuất hoá đơn đỏ, hợp đồng dài hạn, công nợ.',
  },
];

export default function ManufacturerTrust() {
  return (
    <section className="section section-trust" id="trust">
      <div className="container">
        <Reveal variant="fade-up">
          <header className="trust-head">
            <span className="section-eyebrow">● Xưởng sản xuất trực tiếp</span>
            <h2 className="trust-head-title">
              <span>Nhà sản xuất &amp;</span>
              <em>nhà phân phối</em>
              <span>túi vải không dệt</span>
            </h2>
            <p className="trust-head-lead">
              MINT là <strong>xưởng sản xuất trực tiếp</strong> kiêm{' '}
              <strong>nhà phân phối</strong> túi vải không dệt tại Việt Nam. Không
              qua trung gian — bạn được giá tốt nhất, kiểm soát chất lượng tới
              từng đường may, và thời gian giao hàng nhanh hơn 2–3 lần so với
              mua qua đại lý.
            </p>
          </header>
        </Reveal>

        <Reveal variant="fade-up" delay={120}>
          <ul className="trust-stats">
            {STATS.map((s) => (
              <li key={s.label} className="trust-stat">
                <span className="trust-stat-num">{s.num}</span>
                <span className="trust-stat-label">{s.label}</span>
                {s.hint && <span className="trust-stat-hint">{s.hint}</span>}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal variant="fade-up" delay={200}>
          <ul className="trust-pillars">
            {PILLARS.map((p) => (
              <li key={p.title} className="trust-pillar">
                <span className="trust-pillar-mark" aria-hidden>
                  {p.mark}
                </span>
                <div>
                  <strong>{p.title}</strong>
                  <span>{p.body}</span>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal variant="fade-up" delay={280}>
          <div className="trust-cta">
            <a href="/tu-van" className="trust-cta-primary">
              Nhận báo giá xưởng &nbsp;↗
            </a>
            <a href="/gioi-thieu" className="trust-cta-ghost">
              Câu chuyện 12 năm MINT
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

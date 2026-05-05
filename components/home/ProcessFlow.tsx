import Reveal from '../Reveal';

/**
 * Section "Quy trình 5 bước" — minh hoạ vòng đời 1 đơn hàng từ báo giá đến khi
 * hàng tới tay khách. Mục tiêu: cụ thể hoá cam kết tốc độ + minh bạch quy trình
 * → tăng độ tin cậy cho khách hàng B2B.
 *
 * Layout: 5 cột trên desktop với đường nối ngang bằng pseudo-element giữa các
 * step; stack dọc trên mobile (đường nối chuyển sang dọc).
 */

interface Step {
  num: string;
  title: string;
  body: string;
  duration: string;
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Tiếp nhận & Báo giá',
    body: 'Gửi yêu cầu qua Zalo / điện thoại. Đội tư vấn phản hồi kèm bảng giá chi tiết theo từng size, định lượng vải.',
    duration: '30 phút',
  },
  {
    num: '02',
    title: 'Duyệt mẫu & Thiết kế',
    body: 'Chốt kiểu túi, kích thước, vị trí in logo. Gửi mock-up duyệt trước khi sản xuất hàng loạt.',
    duration: '1–2 ngày',
  },
  {
    num: '03',
    title: 'Sản xuất tại xưởng',
    body: 'Cắt — may — in tại xưởng MINT TP.HCM. Theo dõi tiến độ qua hình ảnh / video gửi thẳng cho khách.',
    duration: '5–7 ngày',
  },
  {
    num: '04',
    title: 'Kiểm định KCS',
    body: '100% sản phẩm được kiểm tra đường may, lệch in, kích thước. Loại bỏ trước khi đóng gói.',
    duration: '1 ngày',
  },
  {
    num: '05',
    title: 'Giao hàng toàn quốc',
    body: 'Đối tác vận chuyển (GHN / GHTK / nhà xe) — 63/63 tỉnh thành. Hỗ trợ đổi trả nếu lỗi sản xuất.',
    duration: '1–3 ngày',
  },
];

export default function ProcessFlow() {
  return (
    <section className="section section-process">
      <div className="container">
        <Reveal variant="fade-up">
          <header className="process-head">
            <span className="section-eyebrow">Quy trình minh bạch</span>
            <h2 className="process-head-title">
              Từ <em>ý tưởng</em> đến tay khách —<br />
              chỉ trong <strong>7 ngày</strong>
            </h2>
            <p className="process-head-lead">
              Toàn bộ quy trình diễn ra tại xưởng MINT — không qua đối tác gia
              công bên ngoài. Khách có thể tới xưởng kiểm tra trực tiếp bất kỳ
              công đoạn nào.
            </p>
          </header>
        </Reveal>

        <Reveal variant="fade-up" delay={120}>
          <ol className="process-steps" aria-label="Quy trình 5 bước">
            {STEPS.map((s, i) => (
              <li key={s.num} className="process-step" style={{ ['--i' as string]: i }}>
                <div className="process-step-card">
                  <span className="process-step-num" aria-hidden>
                    {s.num}
                  </span>
                  <span className="process-step-duration">{s.duration}</span>
                  <strong className="process-step-title">{s.title}</strong>
                  <span className="process-step-body">{s.body}</span>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

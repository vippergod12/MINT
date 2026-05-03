interface Props {
  imageUrl?: string;
}

export default function StorySection({ imageUrl }: Props) {
  // Fallback gradient khi chưa có ảnh (admin có thể upload qua /admin/story).
  const hasImage = Boolean(imageUrl && imageUrl.length > 0);

  return (
    <section className="section section-dark">
      <div className="container story-grid">
        <div
          className={`story-image ${hasImage ? '' : 'story-image-empty'}`}
          style={hasImage ? { backgroundImage: `url(${imageUrl})` } : undefined}
          aria-hidden
        />
        <div className="story-content">
          <span className="section-eyebrow">Câu chuyện MINT</span>
          <h2>Mỗi chiếc túi — một bước thay nilon</h2>
          <p>
            MINT khởi nguồn từ năm 2014 với một xưởng nhỏ tại TP.HCM, mong muốn
            đem những chiếc túi vải không dệt giá hợp lý tới các shop bán lẻ
            Việt — thay thế dần túi nilon dùng một lần. Hơn 10 năm, MINT đã sản
            xuất hơn 2 triệu chiếc túi cho hàng nghìn thương hiệu, sự kiện và
            doanh nghiệp trong nước.
          </p>
          <ul className="story-list">
            <li>
              <strong>Vải không dệt 60–100 GSM</strong>
              <span>Định lượng đa dạng, mềm dai, chịu tải tốt cho cả túi shopping.</span>
            </li>
            <li>
              <strong>In logo nhanh — đẹp — bền</strong>
              <span>In lụa truyền thống, in offset hoặc in chuyển nhiệt theo yêu cầu.</span>
            </li>
            <li>
              <strong>MOQ 100 chiếc — báo giá trong 30 phút</strong>
              <span>Nhận đơn nhỏ cho shop, đơn lớn cho doanh nghiệp & sự kiện.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

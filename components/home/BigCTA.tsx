'use client';

import Reveal from '../Reveal';

export default function BigCTA() {
  return (
    <section className="section section-cta">
      <Reveal variant="fade-up">
        <div className="container cta-grid">
          <h2>
            <span>Một chiếc túi</span>
            <span className="cta-italic">cho thương hiệu</span>
            <span>của bạn.</span>
          </h2>
          <a
            href="/tu-van"
            className="cta-link"
          >
            Nhận báo giá miễn phí ↗
          </a>
        </div>
      </Reveal>
    </section>
  );
}

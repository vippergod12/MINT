'use client';

import Link from 'next/link';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Sticky scrollytelling stage cho trang giới thiệu MINT.
 *
 * Toàn bộ trải nghiệm About nằm trong 1 "sân khấu" cao 600vh, sticky 100vh ở
 * giữa. Khi scroll, `progress` (0 → 1) chạy qua cả range, đồng thời:
 *   - Background nền mint+ấm cố định, lá phong rơi liên tục
 *   - Số lá phong xuất hiện tăng dần theo progress (0 lá → ~26 lá)
 *   - 5 "beat" foreground crossfade vào theo tiến độ:
 *       beat 1 (0    → 0.20)  Hero title "Túi vải cho hành tinh xanh"
 *       beat 2 (0.18 → 0.40)  Khởi nguồn câu chuyện MINT
 *       beat 3 (0.38 → 0.62)  4 trụ cột giá trị
 *       beat 4 (0.60 → 0.83)  3 sự khác biệt
 *       beat 5 (0.81 → 1.00)  CTA tư vấn / báo giá
 *   - Progress dots indicator hiện ở rìa phải để user biết đang ở đâu.
 */

function clamp(v: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Tính opacity của 1 beat theo tiến độ. Beat fade-in trong fade% đầu,
 * giữ full opacity ở giữa, fade-out trong fade% cuối của window.
 */
function beatOpacity(p: number, start: number, end: number, fade = 0.04) {
  if (p <= start || p >= end) return 0;
  const peak = start + fade;
  const holdEnd = end - fade;
  if (p < peak) return clamp((p - start) / fade);
  if (p > holdEnd) return clamp(1 - (p - holdEnd) / fade);
  return 1;
}

const PILLARS = [
  { mark: '◇\uFE0E', title: 'Eco-friendly', body: 'Vải không dệt phân huỷ tự nhiên, thay nilon dùng 1 lần' },
  { mark: '◆\uFE0E', title: 'Made in VN', body: 'Sản xuất trực tiếp tại xưởng TP.HCM, không qua trung gian' },
  { mark: '○\uFE0E', title: 'MOQ thấp', body: 'Nhận đơn từ 100 chiếc, hỗ trợ shop nhỏ & startup' },
  { mark: '●\uFE0E', title: 'In ấn sắc nét', body: 'In lụa, in offset, in chuyển nhiệt — đáp ứng mọi thiết kế' },
];

const DIFFS = [
  {
    eyebrow: '01 — Sản xuất',
    title: 'Xưởng riêng — kiểm soát chất lượng',
    body: 'Toàn bộ vải, may, in đều thực hiện tại xưởng MINT TP.HCM.',
  },
  {
    eyebrow: '02 — Tuỳ biến',
    title: 'Mọi kiểu túi, mọi kích thước',
    body: 'Túi quai xách, dây rút, hộp đáy vuông, hội nghị, tote thời trang...',
  },
  {
    eyebrow: '03 — Tốc độ',
    title: 'Báo giá 30 phút — sản xuất 7 ngày',
    body: 'Đơn gấp <500 chiếc có thể giao trong 3-5 ngày làm việc.',
  },
];

/* ============================================================
   FALLING MAPLE LEAVES
   ============================================================
   - Mỗi lá là 1 ảnh PNG trong suốt trong /public/leaves/
   - Số lá hiển thị tăng dần theo `progress` (opacity gate)
   - Pseudo-random deterministic theo index → SSR/CSR khớp nhau,
     không hydrate mismatch và stable mỗi reload
   ============================================================ */

const LEAF_COUNT = 28;

/**
 * 8 sprite lá đã được cắt sẵn từ ảnh nguồn (xem scripts/extract-leaves.py).
 * leaf-8 là chiếc lá lớn, sắc nét nhất (từ ảnh single-leaf nền đen),
 * 7 chiếc còn lại có dáng & góc xoay khác nhau cho đa dạng.
 */
const LEAF_SPRITES = [
  '/leaves/leaf-1.png',
  '/leaves/leaf-2.png',
  '/leaves/leaf-3.png',
  '/leaves/leaf-4.png',
  '/leaves/leaf-5.png',
  '/leaves/leaf-6.png',
  '/leaves/leaf-7.png',
  '/leaves/leaf-8.png',
];

/** Pseudo-random deterministic theo (i, salt). Trả về [0, 1). */
function rand(i: number, salt: number) {
  const x = Math.sin(i * 9301.7 + salt * 49297.3) * 233280;
  return x - Math.floor(x);
}

interface Leaf {
  id: number;
  src: string;        // sprite PNG
  x: number;          // vw (vị trí cột rơi)
  drift: number;      // vw (biên độ lắc trái-phải)
  size: number;       // px (chiều rộng)
  duration: number;   // s (thời gian rơi 1 vòng)
  delay: number;      // s (negative → đã rơi giữa chừng khi mount)
  rotStart: number;   // deg
  rotEnd: number;     // deg
  appearAt: number;   // 0..1, scroll progress threshold để lá hiện
  swayPhase: 1 | -1;  // hướng lắc đầu tiên
  hueShift: number;   // deg (xoay nhẹ tone đỏ↔cam↔vàng cho đa dạng)
  brightness: number; // 0.85..1.1
}

function buildLeaves(): Leaf[] {
  return Array.from({ length: LEAF_COUNT }, (_, i): Leaf => ({
    id: i,
    src: LEAF_SPRITES[Math.floor(rand(i, 0) * LEAF_SPRITES.length)],
    x: rand(i, 1) * 100,
    drift: 4 + rand(i, 2) * 14,
    size: 28 + rand(i, 3) * 46,
    duration: 14 + rand(i, 4) * 14,
    delay: -rand(i, 5) * 22,
    rotStart: rand(i, 6) * 360,
    rotEnd: rand(i, 6) * 360 + (rand(i, 7) < 0.5 ? -1 : 1) * (360 + rand(i, 8) * 540),
    appearAt: rand(i, 10) * 0.85,
    swayPhase: rand(i, 11) < 0.5 ? 1 : -1,
    hueShift: (rand(i, 12) - 0.5) * 40,
    brightness: 0.85 + rand(i, 13) * 0.25,
  }));
}

export default function AboutHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  const leaves = useMemo(() => buildLeaves(), []);

  useEffect(() => {
    function update() {
      const el = sectionRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const rect = el.getBoundingClientRect();
      const sectionDocTop = window.scrollY + rect.top;
      const scrolled =
        sectionDocTop < window.innerHeight ? window.scrollY : -rect.top;
      setProgress(clamp(scrolled / total));
    }

    function onScroll() {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const b1 = beatOpacity(progress, 0.0, 0.2, 0.04);
  const b2 = beatOpacity(progress, 0.18, 0.4, 0.04);
  const b3 = beatOpacity(progress, 0.38, 0.62, 0.04);
  const b4 = beatOpacity(progress, 0.6, 0.83, 0.04);
  const b5 = beatOpacity(progress, 0.81, 1.0, 0.04);

  const ty = (op: number) => (1 - op) * 24;
  const tyUp = (op: number) => (1 - op) * -24;

  const beats = [b1, b2, b3, b4, b5];
  const beatLabels = ['Mở đầu', 'Khởi nguồn', 'Trụ cột', 'Khác biệt', 'Báo giá'];
  const activeBeat = beats.indexOf(Math.max(...beats));

  const hintOpacity = clamp(1 - progress * 8);

  return (
    <section
      ref={sectionRef}
      className="about-stage"
      aria-label="Câu chuyện MINT"
    >
      <div className="about-stage-sticky">
        {/* === Background nền mint+ấm + lớp lá phong rơi === */}
        <div className="about-bg-grad" aria-hidden />

        <div className="about-leaves" aria-hidden>
          {leaves.map((l) => {
            const op = clamp((progress - l.appearAt) / 0.06);
            const style: CSSProperties = {
              opacity: op,
              width: `${l.size}px`,
              ['--x' as string]: `${l.x}vw`,
              ['--drift' as string]: `${l.drift * l.swayPhase}vw`,
              ['--duration' as string]: `${l.duration}s`,
              ['--delay' as string]: `${l.delay}s`,
              ['--rot-s' as string]: `${l.rotStart}deg`,
              ['--rot-e' as string]: `${l.rotEnd}deg`,
              ['--leaf-filter' as string]:
                `hue-rotate(${l.hueShift.toFixed(0)}deg) brightness(${l.brightness.toFixed(2)})`,
            };
            return (
              <span key={l.id} className="about-leaf" style={style}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={l.src}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              </span>
            );
          })}
        </div>

        {/* === BEAT 1: Hero title === */}
        <div
          className="about-beat about-beat-center"
          style={{
            opacity: b1,
            transform: `translateY(${ty(b1).toFixed(1)}px)`,
            pointerEvents: b1 > 0.5 ? 'auto' : 'none',
          }}
        >
          <span className="about-beat-eyebrow">— GIỚI THIỆU MINT —</span>
          <h1 className="about-beat-title about-beat-title-xl">
            <span>Túi vải không dệt</span>
            <em>cho hành tinh xanh hơn</em>
          </h1>
          <p className="about-beat-sub">
            Xưởng MINT — sản xuất túi vải thân thiện môi trường tại Việt Nam.
            Cuộn xuống để biết thêm về chúng tôi.
          </p>
        </div>

        {/* === BEAT 2: Khởi nguồn === */}
        <div
          className="about-beat about-beat-left"
          style={{
            opacity: b2,
            transform: `translate(${(1 - b2) * -32}px, ${ty(b2).toFixed(1)}px)`,
          }}
        >
          <span className="about-beat-eyebrow">— Khởi nguồn —</span>
          <h2 className="about-beat-title">
            Bắt đầu từ <em>một câu hỏi</em><br />về rác nilon
          </h2>
          <p className="about-beat-body">
            Năm 2014, đội ngũ sáng lập MINT đứng giữa biển rác nilon ở chợ
            đầu mối và tự hỏi: tại sao Việt Nam không có nhiều xưởng làm túi
            vải không dệt giá tốt cho shop nhỏ? Một xưởng nhỏ ra đời, với
            mục tiêu thay dần nilon bằng những chiếc túi tái sử dụng.
          </p>
          <blockquote className="about-beat-quote">
            “Một chiếc túi vải dùng được 50 lần — thay được 50 chiếc nilon.”
          </blockquote>
        </div>

        {/* === BEAT 3: 4 trụ cột === */}
        <div
          className="about-beat about-beat-center"
          style={{
            opacity: b3,
            transform: `translateY(${tyUp(b3).toFixed(1)}px)`,
          }}
        >
          <span className="about-beat-eyebrow">— Bốn trụ cột —</span>
          <h2 className="about-beat-title">
            Cách MINT <em>khác biệt</em>
          </h2>
          <div className="about-beat-pillars">
            {PILLARS.map((p, i) => {
              const localStart = 0.4 + i * 0.015;
              const op = beatOpacity(progress, localStart, 0.62, 0.025);
              return (
                <div
                  key={p.title}
                  className="about-pill-card"
                  style={{
                    opacity: op,
                    transform: `translateY(${(1 - op) * 18}px)`,
                  }}
                >
                  <span className="about-pill-mark" aria-hidden>
                    {p.mark}
                  </span>
                  <strong>{p.title}</strong>
                  <span className="about-pill-body">{p.body}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* === BEAT 4: 3 sự khác biệt === */}
        <div
          className="about-beat about-beat-right"
          style={{
            opacity: b4,
            transform: `translate(${(1 - b4) * 32}px, ${ty(b4).toFixed(1)}px)`,
          }}
        >
          <span className="about-beat-eyebrow">— Sự khác biệt —</span>
          <h2 className="about-beat-title">
            Ba điều làm nên <em>MINT</em>
          </h2>
          <ul className="about-beat-diffs">
            {DIFFS.map((d, i) => {
              const localStart = 0.62 + i * 0.025;
              const op = beatOpacity(progress, localStart, 0.83, 0.025);
              return (
                <li
                  key={d.title}
                  style={{
                    opacity: op,
                    transform: `translateX(${(1 - op) * 24}px)`,
                  }}
                >
                  <span className="about-diff-eyebrow">{d.eyebrow}</span>
                  <strong>{d.title}</strong>
                  <span>{d.body}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* === BEAT 5: CTA === */}
        <div
          className="about-beat about-beat-center"
          style={{
            opacity: b5,
            transform: `translateY(${ty(b5).toFixed(1)}px)`,
            pointerEvents: b5 > 0.5 ? 'auto' : 'none',
          }}
        >
          <span className="about-beat-eyebrow">— Bắt đầu hợp tác —</span>
          <h2 className="about-beat-title about-beat-title-xl">
            Để MINT may túi <em>cho thương hiệu của bạn</em>
          </h2>
          <p className="about-beat-sub">
            Báo giá miễn phí trong 30 phút — kèm tư vấn chọn vải, kích thước
            và phương án in logo phù hợp.
          </p>
          <div className="about-beat-cta-row">
            <Link href="/tu-van" className="about-beat-cta about-beat-cta-primary">
              Nhận báo giá
            </Link>
            <Link href="/cua-hang" className="about-beat-cta about-beat-cta-ghost">
              Xem mẫu túi ↗
            </Link>
          </div>
        </div>

        {/* === Progress dots indicator === */}
        <ol className="about-stage-dots" aria-label="Tiến trình câu chuyện">
          {beatLabels.map((label, i) => (
            <li
              key={label}
              className={`about-stage-dot ${i === activeBeat ? 'is-active' : ''}`}
            >
              <span className="about-stage-dot-mark" aria-hidden />
              <span className="about-stage-dot-label">{label}</span>
            </li>
          ))}
        </ol>

        {/* === Scroll hint chỉ hiện đầu === */}
        <div
          className="about-stage-hint"
          style={{ opacity: hintOpacity, pointerEvents: hintOpacity > 0.5 ? 'auto' : 'none' }}
          aria-hidden
        >
          <span>CUỘN</span>
          <span className="about-stage-hint-line" />
        </div>
      </div>
    </section>
  );
}

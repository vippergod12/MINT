'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '@/lib/types';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo/siteConfig';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/utils/blur';

interface Props {
  categories: Category[];
  products: Product[];
  /** Sản phẩm hero được admin chọn (ưu tiên cao nhất). null = chưa cấu hình. */
  hero?: Product | null;
  /** Đang fetch dữ liệu lần đầu — chưa đủ thông tin để chọn ảnh */
  loading?: boolean;
}

function pickImage(items: Array<{ image_url?: string | null }>): string | null {
  for (const it of items) {
    const url = it.image_url?.trim();
    if (url) return url;
  }
  return null;
}

export default function HeroEditorial({ categories, products, hero, loading }: Props) {
  const [time, setTime] = useState(() => new Date());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const heroImage = useMemo<string | null>(() => {
    const fromAdmin = hero?.image_url?.trim();
    if (fromAdmin) return fromAdmin;
    return pickImage(products) ?? pickImage(categories) ?? null;
  }, [hero?.image_url, products, categories]);

  const heroAlt = hero?.name
    ? `${hero.name} — Mẫu túi vải không dệt nổi bật ${SITE_NAME}`
    : `${SITE_NAME} — ${SITE_TAGLINE}`;

  useEffect(() => {
    setImgError(false);
  }, [heroImage]);

  const monthYear = time.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  const showImage = !loading && !!heroImage && !imgError;

  return (
    <section className="hero-editorial">
      <div className="container hero-edit-grid">
        <div className="hero-edit-meta">
          <span className="hero-edit-tag">● Nhà sản xuất &amp; phân phối — 12 năm</span>
          <span className="hero-edit-date">{monthYear}</span>
          <span className="hero-edit-loc">VN — Giao 63/63 tỉnh thành</span>
        </div>

        <div className="hero-edit-headline">
          <h1 className="hero-edit-title">
            <span className="hero-edit-title-statement">Túi vải</span>
            <span className="hero-edit-title-eyebrow">
              <span className="hero-edit-title-rule" aria-hidden />
              cho thương hiệu
            </span>
            <span className="hero-edit-title-accent">xanh hơn.</span>
          </h1>
        </div>

        <div className="hero-edit-side">
          <div className={`hero-edit-image ${showImage ? '' : 'is-placeholder'}`}>
            {showImage ? (
              <Image
                src={heroImage as string}
                alt={heroAlt}
                onError={() => setImgError(true)}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 90vw, 50vw"
                quality={85}
                placeholder="blur"
                blurDataURL={DEFAULT_BLUR_DATA_URL}
                className="hero-edit-image-img"
              />
            ) : (
              <div className="hero-edit-image-skeleton" aria-hidden>
                <span className="hero-edit-image-mark">M</span>
              </div>
            )}
          </div>
          <p className="hero-edit-desc">
            Túi quai xách, túi dây rút, túi hộp đáy vuông, túi hội nghị, túi
            tote thời trang — sản xuất tại xưởng MINT, in logo theo yêu cầu.
            MOQ thấp, báo giá nhanh.
          </p>
          <a
            href="#hot"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('hot')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hero-edit-cta"
          >
            Xem mẫu túi nổi bật ↘
          </a>
        </div>

        <div className="hero-edit-bottom">
          <div className="hero-edit-stat">
            <span className="hero-edit-stat-num">10+</span>
            <span className="hero-edit-stat-label">Năm kinh nghiệm</span>
          </div>
          <div className="hero-edit-stat">
            <span className="hero-edit-stat-num">2M+</span>
            <span className="hero-edit-stat-label">Túi đã sản xuất</span>
          </div>
          <div className="hero-edit-stat">
            <span className="hero-edit-stat-num">100</span>
            <span className="hero-edit-stat-label">MOQ tối thiểu</span>
          </div>
          <div className="hero-edit-stat">
            <span className="hero-edit-stat-num">7</span>
            <span className="hero-edit-stat-label">Ngày sản xuất</span>
          </div>
        </div>
      </div>
    </section>
  );
}

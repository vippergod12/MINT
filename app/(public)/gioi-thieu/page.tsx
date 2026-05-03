import type { Metadata } from 'next';
import AboutHero from '@/components/about/AboutHero';
import { SITE_NAME } from '@/lib/seo/siteConfig';

export const revalidate = 300;

export const metadata: Metadata = {
  title: `Giới thiệu — Câu chuyện ${SITE_NAME}`,
  description:
    'MINT — xưởng sản xuất túi vải không dệt thân thiện môi trường tại Việt Nam. Khởi nguồn, sứ mệnh thay nilon, bốn trụ cột giá trị và lời cam kết về chất lượng tới khách hàng Việt.',
  alternates: { canonical: '/gioi-thieu' },
  openGraph: {
    title: `Giới thiệu — Câu chuyện ${SITE_NAME}`,
    description:
      'Câu chuyện về MINT — xưởng sản xuất túi vải không dệt eco-friendly tại Việt Nam.',
    url: '/gioi-thieu',
    type: 'article',
  },
};

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Toàn bộ câu chuyện diễn ra trong sticky stage:
          eye-opening background + 5 chương crossfade theo scroll.
          Sau beat "Báo giá" → kết thúc, đi thẳng vào Footer. */}
      <AboutHero />
    </div>
  );
}

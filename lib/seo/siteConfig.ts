/**
 * Cấu hình trung tâm cho SEO + thương hiệu của toàn site MINT.
 *
 * - Đặt NEXT_PUBLIC_SITE_URL trong `.env` (vd `https://mintbag.vn`) để các thẻ
 *   canonical / Open Graph / sitemap dùng đúng domain production.
 * - Khi deploy lên Vercel, fallback dùng VERCEL_URL được set tự động.
 * - Thông tin liên hệ (Zalo / hotline / email / địa chỉ) đọc từ env, có default
 *   để không vỡ UI khi chạy local lần đầu.
 */

/** Kiểm tra một chuỗi có phải URL tuyệt đối hợp lệ không. */
function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Quyết định domain của site.
 *
 * Defensive: nếu env vars bị set sai (ví dụ trên Vercel ai đó dán nhầm tên
 * biến vào ô Value), KHÔNG để build crash — bỏ qua giá trị invalid và
 * fallback về VERCEL_URL hoặc localhost.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
  ];

  for (const raw of candidates) {
    const v = raw?.trim();
    if (v && isValidUrl(v)) return v.replace(/\/$/, '');
  }

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const withScheme = `https://${vercelUrl.replace(/\/$/, '')}`;
    if (isValidUrl(withScheme)) return withScheme;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = 'MINT';

export const SITE_TAGLINE = 'Túi vải không dệt thân thiện môi trường';

export const SITE_DESCRIPTION =
  'MINT — xưởng sản xuất & in ấn túi vải không dệt cao cấp tại Việt Nam: túi quai xách, túi dây rút, túi hộp đáy vuông, túi hội nghị, túi tote thời trang, túi quà tặng. In logo theo yêu cầu, MOQ thấp, giao hàng toàn quốc.';

export const SITE_LOCALE = 'vi_VN';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export const SITE_KEYWORDS = [
  'túi vải không dệt',
  'túi vải không dệt giá rẻ',
  'in túi vải không dệt',
  'túi vải không dệt in logo',
  'xưởng sản xuất túi vải không dệt',
  'túi tote',
  'túi dây rút',
  'túi hộp đáy vuông',
  'túi hội nghị',
  'túi quà tặng doanh nghiệp',
  'túi vải eco-friendly',
  'túi vải không dệt giá sỉ',
  SITE_NAME,
];

/** Tạo URL tuyệt đối từ path tương đối (đảm bảo có domain). */
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/* =====================================================================
   THÔNG TIN LIÊN HỆ — đọc từ env, dùng cho Footer / trang Tư vấn / JSON-LD
   ===================================================================== */

const RAW_PHONE = (process.env.NEXT_PUBLIC_ZALO_PHONE ?? '0987654321').toString().trim();

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s.\-()]/g, '');
  if (cleaned.startsWith('+84')) return '0' + cleaned.slice(3);
  if (cleaned.startsWith('84') && cleaned.length === 11) return '0' + cleaned.slice(2);
  return cleaned;
}

export const ZALO_PHONE = normalizePhone(RAW_PHONE);
export const ZALO_URL =
  process.env.NEXT_PUBLIC_ZALO_URL?.trim() ||
  (ZALO_PHONE ? `https://zalo.me/${ZALO_PHONE}` : '');

export const HOTLINE = (process.env.NEXT_PUBLIC_HOTLINE || ZALO_PHONE || '0987654321').trim();
export const EMAIL = (process.env.NEXT_PUBLIC_EMAIL || 'info@mintbag.vn').trim();

export const COMPANY = {
  name: 'Công ty TNHH Sản xuất MINT',
  address: '123 Đường Tân Thới Hiệp, Quận 12, TP. Hồ Chí Minh',
  city: 'Hồ Chí Minh',
  country: 'VN',
  workingHours: '8:00 - 18:00 (Thứ 2 - Thứ 7)',
};

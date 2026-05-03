import type { NextRequest } from 'next/server';
import { sql } from '@/lib/server/db';
import { getAdminFromRequest } from '@/lib/server/auth';
import { badRequest, jsonOk, unauthorized } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_KEYS = new Set(['home_story']);

type Ctx = { params: { key: string } };

/**
 * GET /api/site-settings/:key
 *
 * Trả về JSON value của setting. Nếu chưa có row thì trả về object rỗng `{}`
 * để consumer không cần kiểm null. Public-cacheable (ngắn) vì admin có thể
 * bypass bằng query param `?_t=...` (xem `lib/api-client.ts`).
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const key = params.key;
  if (!ALLOWED_KEYS.has(key)) return badRequest('Key không hợp lệ');

  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${key} LIMIT 1
  `) as { value: unknown }[];

  return jsonOk(rows[0]?.value ?? {}, {
    cache: 'public',
    cacheOpts: { sMaxAge: 60, staleWhileRevalidate: 600 },
  });
}

/**
 * PUT /api/site-settings/:key
 * Body: JSON object (toàn bộ value mới — replace, không merge).
 * Yêu cầu admin auth.
 */
export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!getAdminFromRequest(req)) return unauthorized();

  const key = params.key;
  if (!ALLOWED_KEYS.has(key)) return badRequest('Key không hợp lệ');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Body không phải JSON hợp lệ');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return badRequest('Value phải là object JSON');
  }

  const json = JSON.stringify(body);
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${json}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = NOW()
  `;

  return jsonOk(body, { cache: 'no-store' });
}

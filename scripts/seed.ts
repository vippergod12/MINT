import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL chưa được cấu hình.');
    process.exit(1);
  }

  const sql = neon(url);

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin@123';
  const passwordHash = await bcrypt.hash(password, 10);

  await sql`
    INSERT INTO admins (username, password_hash)
    VALUES (${username}, ${passwordHash})
    ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `;
  console.log(`Đã tạo/cập nhật admin: ${username}`);

  /* =====================================================================
     7 danh mục cho shop túi vải không dệt MINT
     ===================================================================== */
  const categories: { name: string; slug: string; image_url: string; description: string }[] = [
    {
      name: 'Túi quai xách (Shopping)',
      slug: 'tui-quai-xach',
      image_url:
        'https://images.unsplash.com/photo-1591193686104-fddba4d0e4d2?w=900&auto=format&fit=crop',
      description:
        'Túi vải không dệt quai xách dáng shopping, thay thế túi nilon dùng một lần. Phù hợp shop bán lẻ, siêu thị, quà tặng.',
    },
    {
      name: 'Túi dây rút',
      slug: 'tui-day-rut',
      image_url:
        'https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=900&auto=format&fit=crop',
      description:
        'Túi dây rút vải không dệt — gọn nhẹ, tiện đựng giày dép, đồ thể thao, sản phẩm nhỏ.',
    },
    {
      name: 'Túi hộp đáy vuông',
      slug: 'tui-hop-day-vuong',
      image_url:
        'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=900&auto=format&fit=crop',
      description:
        'Túi hộp đáy vuông giữ form cứng cáp — sang trọng, lý tưởng cho mỹ phẩm, quà tặng cao cấp.',
    },
    {
      name: 'Túi hội nghị',
      slug: 'tui-hoi-nghi',
      image_url:
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop',
      description:
        'Túi sự kiện / hội nghị / hội thảo — đựng tài liệu A4, in logo theo bộ nhận diện thương hiệu.',
    },
    {
      name: 'Túi tote thời trang',
      slug: 'tui-tote-thoi-trang',
      image_url:
        'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=900&auto=format&fit=crop',
      description:
        'Túi tote vải canvas / vải không dệt định lượng cao — phong cách trẻ, đeo vai mỗi ngày.',
    },
    {
      name: 'Túi quà tặng doanh nghiệp',
      slug: 'tui-qua-tang-doanh-nghiep',
      image_url:
        'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900&auto=format&fit=crop',
      description:
        'Bộ túi quà tặng doanh nghiệp — Tết, tri ân khách hàng, sự kiện. Có thể đặt theo bộ kèm hộp.',
    },
    {
      name: 'Phụ kiện & Mẫu khác',
      slug: 'phu-kien-va-mau-khac',
      image_url:
        'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?w=900&auto=format&fit=crop',
      description:
        'Túi đựng giày, túi đựng laptop, túi vải đa năng và các mẫu túi đặc biệt theo yêu cầu.',
    },
  ];

  for (const c of categories) {
    await sql`
      INSERT INTO categories (name, slug, image_url, description)
      VALUES (${c.name}, ${c.slug}, ${c.image_url}, ${c.description})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        image_url = EXCLUDED.image_url,
        description = EXCLUDED.description,
        updated_at = NOW()
    `;
  }
  console.log(`Đã tạo ${categories.length} danh mục mẫu.`);

  /* =====================================================================
     22 sản phẩm túi vải không dệt mẫu
     ===================================================================== */
  const products: {
    slug: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category_slug: string;
    sale_price?: number;
    sale_end_at?: string;
  }[] = [
    // ==================== Túi quai xách (Shopping) ====================
    {
      slug: 'tui-quai-xach-30x40-trang',
      name: 'Túi quai xách 30×40cm — Vải 70 GSM',
      description:
        'Túi vải không dệt quai xách kích thước 30×40cm, định lượng 70 GSM, màu trắng tinh. In logo 1-2 màu theo yêu cầu. MOQ 100 chiếc.',
      price: 4500,
      sale_price: 3800,
      sale_end_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      image_url:
        'https://images.unsplash.com/photo-1591193686104-fddba4d0e4d2?w=900&auto=format&fit=crop',
      category_slug: 'tui-quai-xach',
    },
    {
      slug: 'tui-quai-xach-35x45-mint',
      name: 'Túi quai xách 35×45cm — Xanh mint',
      description:
        'Túi shopping vải không dệt 80 GSM, kích thước 35×45cm, màu xanh mint pastel. Phù hợp shop thời trang, mỹ phẩm.',
      price: 5200,
      image_url:
        'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=900&auto=format&fit=crop',
      category_slug: 'tui-quai-xach',
    },
    {
      slug: 'tui-quai-xach-25x30-kraft',
      name: 'Túi quai xách 25×30cm — Nâu kraft',
      description:
        'Túi shopping nhỏ gọn 25×30cm, màu nâu kraft tự nhiên — tone earthy, đậm chất eco. Lý tưởng cho cửa hàng bánh, cà phê.',
      price: 3800,
      sale_price: 3200,
      sale_end_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      image_url:
        'https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=900&auto=format&fit=crop',
      category_slug: 'tui-quai-xach',
    },
    {
      slug: 'tui-quai-xach-40x50-den',
      name: 'Túi quai xách 40×50cm — Đen size lớn',
      description:
        'Túi shopping cỡ lớn 40×50cm, vải 80 GSM, màu đen sang trọng. Tải trọng tới 5kg, đựng tốt sách, đồ nặng.',
      price: 6500,
      image_url:
        'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=900&auto=format&fit=crop',
      category_slug: 'tui-quai-xach',
    },

    // ==================== Túi dây rút ====================
    {
      slug: 'tui-day-rut-30x40-trang',
      name: 'Túi dây rút 30×40cm — Vải 60 GSM',
      description:
        'Túi dây rút vải không dệt 30×40cm, định lượng 60 GSM. Đựng giày, dụng cụ thể thao, đồ cá nhân khi đi du lịch.',
      price: 5500,
      image_url:
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop',
      category_slug: 'tui-day-rut',
    },
    {
      slug: 'tui-day-rut-35x45-xanh',
      name: 'Túi dây rút 35×45cm — Xanh navy',
      description:
        'Túi dây rút cỡ vừa 35×45cm, màu xanh navy, dây rút bền chắc. Phù hợp làm túi sự kiện, túi quà tặng workshop.',
      price: 6800,
      sale_price: 5800,
      sale_end_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      image_url:
        'https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=900&auto=format&fit=crop',
      category_slug: 'tui-day-rut',
    },
    {
      slug: 'tui-day-rut-mini-25x30',
      name: 'Túi dây rút mini 25×30cm',
      description:
        'Túi dây rút mini đa năng — đựng phụ kiện, sản phẩm nhỏ kèm trong đơn hàng e-commerce. MOQ 200 chiếc.',
      price: 3500,
      image_url:
        'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=900&auto=format&fit=crop',
      category_slug: 'tui-day-rut',
    },

    // ==================== Túi hộp đáy vuông ====================
    {
      slug: 'tui-hop-day-vuong-25x30x10',
      name: 'Túi hộp đáy vuông 25×30×10cm',
      description:
        'Túi hộp đáy vuông giữ form, kích thước 25×30×10cm, vải 90 GSM cao cấp. Lý tưởng cho mỹ phẩm, hộp quà cao cấp.',
      price: 8500,
      image_url:
        'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900&auto=format&fit=crop',
      category_slug: 'tui-hop-day-vuong',
    },
    {
      slug: 'tui-hop-day-vuong-30x40x12-trang',
      name: 'Túi hộp đáy vuông 30×40×12cm — Trắng',
      description:
        'Túi đáy vuông cỡ vừa 30×40×12cm, định lượng 100 GSM, đứng vững khi để trên kệ. Phù hợp showroom, shop quà tặng.',
      price: 11500,
      sale_price: 9800,
      sale_end_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      image_url:
        'https://images.unsplash.com/photo-1591193686104-fddba4d0e4d2?w=900&auto=format&fit=crop',
      category_slug: 'tui-hop-day-vuong',
    },
    {
      slug: 'tui-hop-day-vuong-mini-15x20x8',
      name: 'Túi hộp đáy vuông mini 15×20×8cm',
      description:
        'Túi đáy vuông mini, lý tưởng đựng nến thơm, mỹ phẩm sample, phụ kiện nhỏ. In logo dập nóng theo yêu cầu.',
      price: 6500,
      image_url:
        'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?w=900&auto=format&fit=crop',
      category_slug: 'tui-hop-day-vuong',
    },

    // ==================== Túi hội nghị ====================
    {
      slug: 'tui-hoi-nghi-a4-trang',
      name: 'Túi hội nghị A4 — Trắng có khoá zip',
      description:
        'Túi hội nghị size A4 (35×27×8cm), có khoá zip, vải 80 GSM. Đựng tài liệu, laptop 13", brochure. In logo sự kiện.',
      price: 12500,
      sale_price: 10500,
      sale_end_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      image_url:
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop',
      category_slug: 'tui-hoi-nghi',
    },
    {
      slug: 'tui-hoi-nghi-a4-navy',
      name: 'Túi hội nghị A4 — Xanh navy có ngăn',
      description:
        'Túi hội nghị 2 ngăn riêng cho tài liệu và laptop, màu xanh navy chuyên nghiệp. Quai vai dày, đeo thoải mái cả ngày.',
      price: 14800,
      image_url:
        'https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=900&auto=format&fit=crop',
      category_slug: 'tui-hoi-nghi',
    },
    {
      slug: 'tui-hoi-nghi-quai-deo',
      name: 'Túi hội nghị quai chéo — Đen',
      description:
        'Túi hội thảo dạng quai chéo (sling bag), vải 90 GSM. Phù hợp expo, workshop, sự kiện công nghệ.',
      price: 16500,
      image_url:
        'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=900&auto=format&fit=crop',
      category_slug: 'tui-hoi-nghi',
    },

    // ==================== Túi tote thời trang ====================
    {
      slug: 'tui-tote-canvas-tho',
      name: 'Túi tote vải canvas thô — Tự nhiên',
      description:
        'Túi tote vải canvas thô màu tự nhiên, kích thước 38×42cm. Quai dày bản 4cm, đeo vai thoải mái. In logo thời trang.',
      price: 22500,
      sale_price: 18900,
      sale_end_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      image_url:
        'https://images.unsplash.com/photo-1591193686104-fddba4d0e4d2?w=900&auto=format&fit=crop',
      category_slug: 'tui-tote-thoi-trang',
    },
    {
      slug: 'tui-tote-vai-khong-det-90gsm',
      name: 'Túi tote vải không dệt 90 GSM — Xanh mint',
      description:
        'Túi tote vải không dệt định lượng cao 90 GSM, màu xanh mint, kích thước 35×40×8cm. Có thể giặt tay nhẹ nhàng.',
      price: 12500,
      image_url:
        'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=900&auto=format&fit=crop',
      category_slug: 'tui-tote-thoi-trang',
    },
    {
      slug: 'tui-tote-canvas-in-print',
      name: 'Túi tote canvas in print — Custom design',
      description:
        'Túi tote canvas dày dặn, in chuyển nhiệt full màu theo thiết kế của khách. Phù hợp brand thời trang, kỷ niệm sự kiện.',
      price: 35000,
      image_url:
        'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=900&auto=format&fit=crop',
      category_slug: 'tui-tote-thoi-trang',
    },

    // ==================== Túi quà tặng doanh nghiệp ====================
    {
      slug: 'set-tui-qua-tet-2026',
      name: 'Set túi quà Tết 2026 — Đỏ vàng',
      description:
        'Bộ túi quà Tết doanh nghiệp, màu đỏ-vàng truyền thống, gồm 1 túi lớn + 1 túi nhỏ. In logo công ty 2 màu.',
      price: 28500,
      sale_price: 24500,
      sale_end_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      image_url:
        'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900&auto=format&fit=crop',
      category_slug: 'tui-qua-tang-doanh-nghiep',
    },
    {
      slug: 'tui-qua-tang-mini-vuong',
      name: 'Túi quà tặng vuông 20×20×8cm',
      description:
        'Túi quà tặng vuông cao cấp, vải 100 GSM, kèm dây ruy băng satin. Đựng nến thơm, hộp tea, mỹ phẩm.',
      price: 9500,
      image_url:
        'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?w=900&auto=format&fit=crop',
      category_slug: 'tui-qua-tang-doanh-nghiep',
    },
    {
      slug: 'tui-qua-tri-an-khach-hang',
      name: 'Túi tri ân khách hàng VIP — Premium',
      description:
        'Túi tri ân khách VIP, vải gấm cao cấp, in logo mạ vàng. Bao gồm dây nơ và thẻ cảm ơn cá nhân hoá.',
      price: 45000,
      image_url:
        'https://images.unsplash.com/photo-1591193686104-fddba4d0e4d2?w=900&auto=format&fit=crop',
      category_slug: 'tui-qua-tang-doanh-nghiep',
    },

    // ==================== Phụ kiện & Mẫu khác ====================
    {
      slug: 'tui-dung-giay-vai-khong-det',
      name: 'Túi đựng giày vải không dệt',
      description:
        'Túi đựng giày dạng dây rút, kích thước 35×40cm, có cửa sổ trong suốt nhìn được mẫu giày. Phù hợp shop giày.',
      price: 6800,
      image_url:
        'https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=900&auto=format&fit=crop',
      category_slug: 'phu-kien-va-mau-khac',
    },
    {
      slug: 'tui-dung-laptop-15-inch',
      name: 'Túi đựng laptop 15" — Vải dày',
      description:
        'Túi đựng laptop 15", lót bông mỏng chống xước, vải 100 GSM. Có thể in logo công ty làm quà nhân viên.',
      price: 18500,
      sale_price: 15500,
      sale_end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      image_url:
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop',
      category_slug: 'phu-kien-va-mau-khac',
    },
    {
      slug: 'tui-vai-da-nang-folding',
      name: 'Túi vải đa năng gấp gọn',
      description:
        'Túi vải không dệt gấp gọn được vào ví, mở ra thành túi shopping size lớn. Tiện cho khách đi siêu thị.',
      price: 7500,
      image_url:
        'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=900&auto=format&fit=crop',
      category_slug: 'phu-kien-va-mau-khac',
    },
  ];

  for (const p of products) {
    await sql`
      INSERT INTO products (category_id, name, slug, description, price, sale_price, sale_end_at, image_url)
      SELECT c.id, ${p.name}, ${p.slug}, ${p.description}, ${p.price},
             ${p.sale_price ?? null}, ${p.sale_end_at ?? null}, ${p.image_url}
      FROM categories c
      WHERE c.slug = ${p.category_slug}
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        sale_price = EXCLUDED.sale_price,
        sale_end_at = EXCLUDED.sale_end_at,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()
    `;
  }
  console.log(`Đã tạo ${products.length} sản phẩm mẫu.`);
  console.log('Seed hoàn tất.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

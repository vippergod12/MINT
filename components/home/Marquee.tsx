interface Props {
  items?: string[];
}

const DEFAULT_ITEMS = [
  'IN LOGO TỪ 100 TÚI',
  'XƯỞNG SẢN XUẤT TRỰC TIẾP',
  'GIAO HÀNG TOÀN QUỐC',
  'VẢI KHÔNG DỆT 60–100 GSM',
  'TÚI ECO-FRIENDLY',
  'BÁO GIÁ TRONG 30 PHÚT',
  'MOQ THẤP — GIÁ TỐT',
];

export default function Marquee({ items = DEFAULT_ITEMS }: Props) {
  const list = [...items, ...items, ...items];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {list.map((it, i) => (
          <span key={i} className="marquee-item">
            {it}
            <span className="marquee-sep">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import type { DragEvent, PointerEvent } from 'react';

/**
 * Khoảng cách tối thiểu (px) chuột/ngón tay phải di chuyển để được coi là
 * drag thay vì click. 6px đủ để lọc rung tay vô tình mà không bóp click thật.
 */
const DEFAULT_THRESHOLD = 6;

/**
 * Bảo vệ links/buttons bên trong vùng kéo (Swiper carousel) khỏi bị trigger
 * click khi user kéo ngang để chuyển slide.
 *
 * Tại sao cần dù Swiper đã có `preventClicks`:
 *   - Swiper attach click listener ở swiper element. Trong đa số case
 *     preventClicks + preventClicksPropagation chặn được click tới <Link>.
 *   - Tuy nhiên có edge case (browser cụ thể, route prefetch, focus, v.v.)
 *     mà click vẫn lọt qua → Next.js Link điều hướng. Hook này là safety
 *     net cuối cùng.
 *
 * Cách dùng:
 *   const guard = useDragGuard();
 *   <div className="..." {...guard.bind()}>
 *     <Swiper>...<Link href=... />...</Swiper>
 *   </div>
 *
 * Cơ chế:
 *   - `onPointerDownCapture` ở wrapper: lưu toạ độ + element wrapper.
 *   - `pointermove` ở **window/capture**: tracking nhận mọi pointermove dù
 *     Swiper có setPointerCapture / stopPropagation hay không.
 *   - `click` ở **window/capture**: phải dùng WINDOW (không phải document)
 *     vì Next.js App Router attach React event delegation TRỰC TIẾP lên
 *     document. Hai capture handler cùng trên document fire theo
 *     registration order — React register lúc hydration nên fire trước
 *     useEffect của hook → click lọt sang Link.
 *     Window là tổ tiên của document → capture handler trên window LUÔN
 *     fire trước handler trên document. preventDefault +
 *     stopImmediatePropagation ở đây block triệt để.
 *   - Thêm lớp phòng thủ: trong `pointerup`, nếu drag thật, set
 *     `pointer-events: none` trên wrapper trong 1 frame → click fire ra
 *     không trúng target nào trong wrapper.
 *   - `onDragStart`: chặn native HTML5 drag (ảnh/link mặc định).
 */
export function useDragGuard(threshold = DEFAULT_THRESHOLD) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);
  const trackingRef = useRef(false);
  const wrapperRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function onMove(e: globalThis.PointerEvent) {
      if (!trackingRef.current) return;
      const s = startRef.current;
      if (!s) return;
      if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > threshold) {
        draggedRef.current = true;
      }
    }

    function onEnd(e: globalThis.PointerEvent) {
      trackingRef.current = false;
      startRef.current = null;
      // Lớp phòng thủ #2: nếu vừa drag, tắt pointer-events trên wrapper
      // trong 1 microtask để click event sắp tới (nếu có) không trúng Link.
      // restore ngay sau bằng rAF để không ảnh hưởng tương tác kế tiếp.
      if (draggedRef.current && e.pointerType === 'mouse') {
        const w = wrapperRef.current;
        if (w) {
          w.style.pointerEvents = 'none';
          requestAnimationFrame(() => {
            w.style.pointerEvents = '';
          });
        }
      }
    }

    function onClickCapture(e: globalThis.MouseEvent) {
      if (!draggedRef.current) return;
      const w = wrapperRef.current;
      if (!w) return;
      const target = e.target as Node | null;
      if (!target || !w.contains(target)) {
        draggedRef.current = false;
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      draggedRef.current = false;
    }

    window.addEventListener('pointermove', onMove, { capture: true, passive: true });
    window.addEventListener('pointerup', onEnd, { capture: true });
    window.addEventListener('pointercancel', onEnd, { capture: true });
    // QUAN TRỌNG: window (không phải document) — xem ghi chú trên.
    window.addEventListener('click', onClickCapture, { capture: true });

    return () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onEnd, true);
      window.removeEventListener('pointercancel', onEnd, true);
      window.removeEventListener('click', onClickCapture, true);
    };
  }, [threshold]);

  function bind() {
    return {
      onPointerDownCapture(e: PointerEvent<HTMLElement>) {
        startRef.current = { x: e.clientX, y: e.clientY };
        draggedRef.current = false;
        trackingRef.current = true;
        wrapperRef.current = e.currentTarget;
      },
      onDragStart(e: DragEvent<HTMLElement>) {
        e.preventDefault();
      },
    };
  }

  return { bind };
}

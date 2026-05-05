'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { bytesOfDataUrl, compressImage, formatBytes } from '@/lib/utils/image';

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  /** Số ảnh tối đa cho phép. Mặc định 10. */
  max?: number;
  disabled?: boolean;
}

/**
 * Picker cho nhiều ảnh sản phẩm.
 *
 * - Ảnh đầu tiên = ảnh bìa (hiển thị trên thẻ sản phẩm + thumbnail)
 * - Có thể upload nhiều file cùng lúc, dán URL, xoá từng ảnh, đổi vị trí
 *   bằng nút ←/→ để chọn ảnh bìa khác.
 * - Mỗi file đều được resize/nén qua `compressImage` (cùng pipeline với
 *   `ImagePicker` đơn cũ) để giảm dung lượng trước khi gửi server.
 */
export default function MultiImagePicker({
  value,
  onChange,
  label = 'Ảnh sản phẩm',
  max = 10,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);

  const slotsLeft = Math.max(0, max - value.length);
  const isFull = slotsLeft === 0;

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (inputRef.current) inputRef.current.value = '';
    if (files.length === 0) return;

    setError(null);
    setBusy(true);
    try {
      const allowed = files.slice(0, slotsLeft);
      const skipped = files.length - allowed.length;
      const next: string[] = [...value];
      let totalBytes = 0;
      for (const file of allowed) {
        const dataUrl = await compressImage(file, { maxSize: 1000, quality: 0.82 });
        next.push(dataUrl);
        totalBytes += bytesOfDataUrl(dataUrl);
      }
      onChange(next);
      const note = `Đã thêm ${allowed.length} ảnh (~${formatBytes(totalBytes)})`;
      setInfo(skipped > 0 ? `${note} • bỏ qua ${skipped} ảnh do vượt giới hạn ${max}` : note);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xử lý được ảnh');
    } finally {
      setBusy(false);
    }
  }

  function removeAt(idx: number) {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
    setInfo(null);
    setError(null);
  }

  function moveLeft(idx: number) {
    if (idx <= 0) return;
    const next = [...value];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  }

  function moveRight(idx: number) {
    if (idx >= value.length - 1) return;
    const next = [...value];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  }

  function makeCover(idx: number) {
    if (idx === 0) return;
    const next = [...value];
    const [picked] = next.splice(idx, 1);
    next.unshift(picked);
    onChange(next);
  }

  function addUrl() {
    const raw = urlInputRef.current?.value.trim() ?? '';
    if (!raw) return;
    if (value.includes(raw)) {
      setError('Ảnh này đã có trong danh sách');
      return;
    }
    if (isFull) {
      setError(`Tối đa ${max} ảnh / sản phẩm`);
      return;
    }
    onChange([...value, raw]);
    if (urlInputRef.current) urlInputRef.current.value = '';
    setError(null);
    setInfo(`Đã thêm 1 ảnh từ URL`);
  }

  return (
    <div className="multi-image-picker">
      <div className="multi-image-picker-head">
        <span className="image-picker-label">{label}</span>
        <span className="multi-image-picker-counter">
          {value.length}/{max}
        </span>
      </div>

      {value.length > 0 && (
        <ul className="multi-image-picker-grid">
          {value.map((src, idx) => (
            <li
              key={`${idx}-${src.slice(0, 40)}`}
              className={`multi-image-picker-item ${idx === 0 ? 'is-cover' : ''}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Ảnh ${idx + 1}`} />
              {idx === 0 && <span className="multi-image-picker-cover-badge">Ảnh bìa</span>}
              <div className="multi-image-picker-item-actions">
                <button
                  type="button"
                  className="multi-image-picker-icon-btn"
                  onClick={() => moveLeft(idx)}
                  disabled={busy || disabled || idx === 0}
                  aria-label="Chuyển sang trái"
                  title="Chuyển trái"
                >
                  ‹
                </button>
                {idx !== 0 && (
                  <button
                    type="button"
                    className="multi-image-picker-icon-btn"
                    onClick={() => makeCover(idx)}
                    disabled={busy || disabled}
                    aria-label="Đặt làm ảnh bìa"
                    title="Đặt làm ảnh bìa"
                  >
                    ★
                  </button>
                )}
                <button
                  type="button"
                  className="multi-image-picker-icon-btn"
                  onClick={() => moveRight(idx)}
                  disabled={busy || disabled || idx === value.length - 1}
                  aria-label="Chuyển sang phải"
                  title="Chuyển phải"
                >
                  ›
                </button>
                <button
                  type="button"
                  className="multi-image-picker-icon-btn danger"
                  onClick={() => removeAt(idx)}
                  disabled={busy || disabled}
                  aria-label="Xoá ảnh"
                  title="Xoá ảnh"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
          {!isFull && (
            <li className="multi-image-picker-item is-empty">
              <button
                type="button"
                className="multi-image-picker-add"
                onClick={() => inputRef.current?.click()}
                disabled={busy || disabled}
              >
                <span className="multi-image-picker-add-icon" aria-hidden>
                  +
                </span>
                <span>{busy ? 'Đang xử lý...' : 'Thêm ảnh'}</span>
              </button>
            </li>
          )}
        </ul>
      )}

      {value.length === 0 && (
        <button
          type="button"
          className="image-picker-drop"
          onClick={() => inputRef.current?.click()}
          disabled={busy || disabled}
        >
          <span className="image-picker-icon" aria-hidden>
            ↑
          </span>
          <span className="image-picker-title">{busy ? 'Đang xử lý...' : 'Bấm để chọn ảnh'}</span>
          <span className="image-picker-sub">
            JPG / PNG / WEBP • có thể chọn nhiều ảnh • tự nén tới ~1000px
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        hidden
        disabled={busy || disabled}
      />

      {info && <div className="image-picker-info">{info}</div>}
      {error && <div className="form-error">{error}</div>}

      <button
        type="button"
        className="image-picker-toggle"
        onClick={() => setShowUrl((v) => !v)}
      >
        {showUrl ? 'Đóng' : 'Hoặc dán URL ảnh →'}
      </button>
      {showUrl && (
        <div className="multi-image-picker-url">
          <input
            ref={urlInputRef}
            type="url"
            placeholder="https://..."
            className="image-picker-url"
            disabled={disabled || isFull}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={addUrl}
            disabled={disabled || isFull}
          >
            Thêm
          </button>
        </div>
      )}
    </div>
  );
}

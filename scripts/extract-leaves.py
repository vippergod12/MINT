"""
Cắt từng chiếc lá phong từ 2 ảnh nguồn → PNG trong suốt → lưu vào public/leaves/.

Workflow:
  1. Đọc 2 ảnh nguồn (1 ảnh có nhiều lá nền trắng, 1 ảnh single-leaf nền đen).
  2. Tạo alpha mask:
     - Ảnh nền trắng: pixel càng sáng càng trong suốt (anti-alias mềm).
     - Ảnh nền đen: pixel càng tối càng trong suốt.
  3. Find connected components của vùng opaque, lọc bỏ noise nhỏ.
  4. Crop bbox + padding cho từng lá → resize về max 256px → lưu PNG.
"""

from __future__ import annotations
import os
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    r"C:\Users\sater\.cursor\projects\d-clone-web-shop-ban-tui\assets"
)
SRC_WHITE = (
    ASSETS
    / "c__Users_sater_AppData_Roaming_Cursor_User_workspaceStorage_e43a7d8a6e5c05673014b123db3d7fd8_images_image-dfbe17ab-9499-48e9-ad25-938df0ed5f8e.png"
)
SRC_BLACK = (
    ASSETS
    / "c__Users_sater_AppData_Roaming_Cursor_User_workspaceStorage_e43a7d8a6e5c05673014b123db3d7fd8_images_image-74a2912a-8cd8-4765-9d87-73e4719ac8b2.png"
)
OUT_DIR = ROOT / "public" / "leaves"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def alpha_from_white_bg(img: Image.Image) -> Image.Image:
    """Loại bỏ nền trắng → alpha PNG. Càng sáng càng trong suốt."""
    arr = np.array(img.convert("RGB"), dtype=np.int32)
    # Khoảng cách tới màu trắng (0 = trắng tinh, 765 = đen)
    dist_to_white = (255 - arr).sum(axis=2)
    # Nền trắng (dist <= 30) → alpha 0
    # Lá rõ (dist >= 120) → alpha 255
    # Giữa: chuyển mượt
    alpha = np.clip((dist_to_white - 30) * (255 / 90), 0, 255).astype(np.uint8)
    rgba = np.dstack([arr.astype(np.uint8), alpha])
    return Image.fromarray(rgba, "RGBA")


def alpha_from_black_bg(img: Image.Image) -> Image.Image:
    """Loại bỏ nền đen → alpha PNG. Càng tối càng trong suốt."""
    arr = np.array(img.convert("RGB"), dtype=np.int32)
    luminance = arr.max(axis=2)  # max channel — lá có vùng đỏ rất sáng
    # Nền đen (lum <= 25) → alpha 0
    # Lá (lum >= 90) → alpha 255
    alpha = np.clip((luminance - 25) * (255 / 65), 0, 255).astype(np.uint8)
    rgba = np.dstack([arr.astype(np.uint8), alpha])
    return Image.fromarray(rgba, "RGBA")


def smooth_alpha(img: Image.Image, radius: float = 0.6) -> Image.Image:
    """Làm mượt rìa alpha bằng Gaussian blur nhẹ trên kênh alpha."""
    r, g, b, a = img.split()
    a = a.filter(ImageFilter.GaussianBlur(radius=radius))
    return Image.merge("RGBA", (r, g, b, a))


def extract_components(
    rgba: Image.Image,
    *,
    min_area: int,
    pad: int,
    alpha_threshold: int = 32,
) -> list[Image.Image]:
    """Tìm connected components của vùng opaque, crop từng cái + padding."""
    arr = np.array(rgba)
    mask = arr[:, :, 3] >= alpha_threshold
    # Đóng hở nhỏ để các thuỳ lá liên kết chắc chắn
    mask = ndimage.binary_closing(mask, iterations=2)
    labeled, n = ndimage.label(mask)
    print(f"  → {n} component(s) tìm thấy")
    crops: list[Image.Image] = []
    for i in range(1, n + 1):
        ys, xs = np.where(labeled == i)
        area = len(ys)
        if area < min_area:
            continue
        y0, y1 = max(int(ys.min()) - pad, 0), min(int(ys.max()) + pad + 1, arr.shape[0])
        x0, x1 = max(int(xs.min()) - pad, 0), min(int(xs.max()) + pad + 1, arr.shape[1])
        crop = rgba.crop((x0, y0, x1, y1))
        # Lọc thêm: chỉ lấy crop có alpha lớn nhất chiếm > 30% bbox (loại nhiễu lẻ tẻ)
        ca = np.array(crop)[:, :, 3]
        if (ca >= alpha_threshold).mean() < 0.08:
            continue
        crops.append(crop)
        print(f"    component #{i}: area={area}, bbox=({x0},{y0})→({x1},{y1}), size={crop.size}")
    return crops


def fit_to_box(img: Image.Image, max_side: int = 256) -> Image.Image:
    w, h = img.size
    scale = max_side / max(w, h)
    if scale >= 1:
        return img
    return img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)


def main() -> None:
    print(f"Output: {OUT_DIR}")

    # ====== Ảnh 1: nhiều lá nền trắng/trong suốt ======
    print(f"\n[1/2] {SRC_WHITE.name}")
    src1 = Image.open(SRC_WHITE)
    rgba1 = alpha_from_white_bg(src1)
    rgba1 = smooth_alpha(rgba1, radius=0.5)
    crops1 = extract_components(rgba1, min_area=2500, pad=8)

    # ====== Ảnh 2: 1 lá đẹp nền đen ======
    print(f"\n[2/2] {SRC_BLACK.name}")
    src2 = Image.open(SRC_BLACK)
    rgba2 = alpha_from_black_bg(src2)
    rgba2 = smooth_alpha(rgba2, radius=0.7)
    crops2 = extract_components(rgba2, min_area=8000, pad=12, alpha_threshold=40)

    # ====== Ghi ra disk ======
    all_crops = crops1 + crops2
    for f in OUT_DIR.glob("leaf-*.png"):
        f.unlink()
    saved = 0
    for crop in all_crops:
        crop = fit_to_box(crop, 256)
        saved += 1
        out = OUT_DIR / f"leaf-{saved}.png"
        crop.save(out, "PNG", optimize=True)
        print(f"  → {out.name}  {crop.size}  {os.path.getsize(out)/1024:.1f} KB")
    print(f"\nĐã lưu {saved} chiếc lá vào {OUT_DIR}")


if __name__ == "__main__":
    main()

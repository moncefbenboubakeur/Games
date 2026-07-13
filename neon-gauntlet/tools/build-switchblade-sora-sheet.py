#!/usr/bin/env python3
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/assets/sprites/bosses/incoming/switchblade-sora-white-bg.png"
OUTPUT = ROOT / "public/assets/sprites/bosses/switchblade-sora-sheet.png"
CONTACT_DIR = ROOT / "docs/contact-sheets/bosses/switchblade-sora"

ATLAS_SIZE = (1536, 1024)

ENEMY_SLOTS = {
    "idle": [(75, 20, 129, 210)],
    "walk": [(45, 255, 190, 235), (250, 255, 190, 235), (455, 255, 190, 235), (660, 255, 190, 235)],
    "punch": [(885, 293, 193, 181), (1112, 293, 173, 181), (1298, 298, 203, 176)],
    "kick": [(61, 524, 164, 195), (278, 533, 175, 186), (501, 527, 226, 192)],
    "guard": [(867, 533, 135, 186), (1085, 533, 129, 186), (1305, 538, 127, 181)],
    "hurt": [(45, 765, 147, 211), (242, 785, 165, 191)],
    "jump": [(462, 737, 112, 178), (645, 729, 136, 196)],
    "down": [(962, 914, 191, 73)],
}

SOURCE_FRAME_MAP = {
    "idle": [0],
    "walk": [4, 5, 6, 8],
    "punch": [11, 12, 13],
    "kick": [16, 15, 17],
    "guard": [18, 19, 20],
    "hurt": [27, 28],
    "jump": [31, 32],
    "down": [35],
}


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    return a == 0 or (r > 236 and g > 236 and b > 236)


def alpha_clean(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    background = Image.new("1", image.size, 0)
    bg = background.load()
    queue: deque[tuple[int, int]] = deque()

    def add_if_bg(x: int, y: int) -> None:
      if bg[x, y] or not is_background(pixels[x, y]):
          return
      bg[x, y] = 1
      queue.append((x, y))

    for x in range(width):
        add_if_bg(x, 0)
        add_if_bg(x, height - 1)
    for y in range(height):
        add_if_bg(0, y)
        add_if_bg(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < width and 0 <= ny < height:
                add_if_bg(nx, ny)

    output = Image.new("RGBA", image.size, (0, 0, 0, 0))
    out = output.load()
    for y in range(height):
        for x in range(width):
            if bg[x, y]:
                continue
            r, g, b, a = pixels[x, y]
            out[x, y] = (r, g, b, a)
    return output


def foreground_mask(image: Image.Image) -> Image.Image:
    mask = Image.new("1", image.size, 0)
    mp = mask.load()
    pixels = image.convert("RGBA").load()
    width, height = image.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a and not (r > 238 and g > 238 and b > 238):
                mp[x, y] = 1
    return mask.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(5))


def connected_boxes(mask: Image.Image) -> list[tuple[int, int, int, int]]:
    width, height = mask.size
    pixels = mask.load()
    visited = bytearray(width * height)
    boxes: list[tuple[int, int, int, int, int]] = []
    for y in range(height):
        for x in range(width):
            start = y * width + x
            if visited[start] or not pixels[x, y]:
                continue
            stack = [(x, y)]
            visited[start] = 1
            min_x = max_x = x
            min_y = max_y = y
            count = 0
            while stack:
                cx, cy = stack.pop()
                count += 1
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if nx < 0 or nx >= width or ny < 0 or ny >= height:
                        continue
                    index = ny * width + nx
                    if not visited[index] and pixels[nx, ny]:
                        visited[index] = 1
                        stack.append((nx, ny))
            box_width = max_x - min_x + 1
            box_height = max_y - min_y + 1
            if count > 200 and box_width > 20 and box_height > 20:
                boxes.append((min_x, min_y, max_x + 1, max_y + 1, count))

    rows: list[dict[str, object]] = []
    for box in sorted(boxes, key=lambda item: (item[1] + item[3]) / 2):
        center_y = (box[1] + box[3]) / 2
        for row in rows:
            if abs(float(row["center_y"]) - center_y) < 130:
                row_boxes = row["boxes"]
                assert isinstance(row_boxes, list)
                row_boxes.append(box)
                row["center_y"] = (float(row["center_y"]) * (len(row_boxes) - 1) + center_y) / len(row_boxes)
                break
        else:
            rows.append({"center_y": center_y, "boxes": [box]})

    ordered: list[tuple[int, int, int, int]] = []
    for row in rows:
        row_boxes = row["boxes"]
        assert isinstance(row_boxes, list)
        row_boxes.sort(key=lambda item: item[0])
        ordered.extend((box[0], box[1], box[2], box[3]) for box in row_boxes)
    return ordered


def crop_frame(cleaned: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    width, height = cleaned.size
    x0, y0, x1, y1 = box
    pad = 10
    crop = cleaned.crop((max(0, x0 - pad), max(0, y0 - pad), min(width, x1 + pad), min(height, y1 + pad)))
    alpha_box = crop.getchannel("A").point(lambda a: 255 if a > 10 else 0).getbbox()
    if not alpha_box:
        raise ValueError(f"Empty crop for {box}")
    return crop.crop(alpha_box)


def paste_into_slot(atlas: Image.Image, frame: Image.Image, slot: tuple[int, int, int, int]) -> None:
    x, y, slot_w, slot_h = slot
    frame_w, frame_h = frame.size
    scale = min((slot_w - 6) / frame_w, (slot_h - 4) / frame_h)
    resized = frame.resize((max(1, round(frame_w * scale)), max(1, round(frame_h * scale))), Image.Resampling.NEAREST)
    px = x + (slot_w - resized.width) // 2
    py = y + slot_h - resized.height
    atlas.alpha_composite(resized, (px, py))


def write_contact_sheets(frames_by_action: dict[str, list[Image.Image]]) -> None:
    CONTACT_DIR.mkdir(parents=True, exist_ok=True)
    for action, frames in frames_by_action.items():
        cell_w = 170
        cell_h = 230
        header_h = 36
        sheet = Image.new("RGBA", (cell_w * len(frames), cell_h + header_h), (10, 12, 18, 255))
        draw = ImageDraw.Draw(sheet)
        draw.text((8, 8), f"switchblade-sora / {action}", fill=(255, 255, 255, 255))
        for index, frame in enumerate(frames):
            cell_x = index * cell_w
            draw.rectangle((cell_x + 2, header_h + 2, cell_x + cell_w - 2, header_h + cell_h - 2), outline=(58, 74, 92, 255))
            draw.text((cell_x + 8, header_h + 8), str(index), fill=(255, 209, 102, 255))
            scale = min((cell_w - 20) / frame.width, (cell_h - 36) / frame.height, 1)
            preview = frame.resize((max(1, round(frame.width * scale)), max(1, round(frame.height * scale))), Image.Resampling.NEAREST)
            sheet.alpha_composite(preview, (cell_x + (cell_w - preview.width) // 2, header_h + cell_h - preview.height - 12))
        sheet.save(CONTACT_DIR / f"{action}.png")


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    source = Image.open(SOURCE).convert("RGBA")
    cleaned = alpha_clean(source)
    boxes = connected_boxes(foreground_mask(source))
    if len(boxes) < 36:
        raise RuntimeError(f"Expected at least 36 detected frames, found {len(boxes)}")

    atlas = Image.new("RGBA", ATLAS_SIZE, (0, 0, 0, 0))
    frames_by_action: dict[str, list[Image.Image]] = {}

    for action, source_indexes in SOURCE_FRAME_MAP.items():
        frames = [crop_frame(cleaned, boxes[index]) for index in source_indexes]
        frames_by_action[action] = frames
        for frame, slot in zip(frames, ENEMY_SLOTS[action]):
            paste_into_slot(atlas, frame, slot)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(OUTPUT)
    write_contact_sheets(frames_by_action)
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    print(f"Wrote contact sheets to {CONTACT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

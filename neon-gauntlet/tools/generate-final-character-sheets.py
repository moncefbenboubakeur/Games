#!/usr/bin/env python3
from __future__ import annotations

import colorsys
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
ANIMATIONS = json.loads((ROOT / "public/data/animations.json").read_text())
ENEMY_SOURCE = ROOT / "public/assets/sprites/enemy-rival-sheet.png"
PLAYER_SOURCE = ROOT / "public/assets/sprites/player-sheet.png"
BOSS_DIR = ROOT / "public/assets/sprites/bosses"
ENEMY_DIR = ROOT / "public/assets/sprites/enemies"


ENEMY_SPECS = [
    {"id": "striker", "file": "striker-sheet.png", "hue": -0.03, "sat": 1.08, "value": 1.05, "weapon": None},
    {"id": "runner", "file": "runner-sheet.png", "hue": 0.47, "sat": 1.16, "value": 1.08, "weapon": "knife"},
    {"id": "bruiser", "file": "bruiser-sheet.png", "hue": 0.09, "sat": 1.08, "value": 0.92, "weapon": None},
    {"id": "staffer", "file": "staffer-sheet.png", "hue": 0.15, "sat": 1.05, "value": 1.02, "weapon": "staff"},
    {"id": "swordsman", "file": "swordsman-sheet.png", "hue": 0.62, "sat": 1.12, "value": 1.0, "weapon": "sword"},
    {"id": "nunchaku", "file": "nunchaku-sheet.png", "hue": 0.82, "sat": 1.18, "value": 1.03, "weapon": "nunchaku"},
]

BOSS_SPECS = [
    {"id": "turnstile-ren", "file": "turnstile-ren-sheet.png", "hue": 0.48, "sat": 1.08, "value": 1.04, "weapon": "knife"},
    {"id": "iron-wei", "file": "iron-wei-sheet.png", "hue": 0.08, "sat": 1.04, "value": 0.95, "weapon": "staff"},
    {"id": "lantern-mai", "file": "lantern-mai-sheet.png", "hue": 0.88, "sat": 1.08, "value": 1.06, "weapon": "nunchaku"},
    {"id": "forge-aya", "file": "forge-aya-sheet.png", "hue": 0.02, "sat": 1.12, "value": 1.02, "weapon": "staff"},
    {"id": "drone-queen-nova", "file": "drone-queen-nova-sheet.png", "hue": 0.55, "sat": 1.18, "value": 1.08, "weapon": "sword"},
    {"id": "cipher-iris", "file": "cipher-iris-sheet.png", "hue": 0.76, "sat": 1.18, "value": 1.02, "weapon": "nunchaku"},
    {"id": "harbor-hale", "file": "harbor-hale-sheet.png", "hue": 0.56, "sat": 1.02, "value": 1.06, "weapon": "staff"},
    {"id": "signal-vex", "file": "signal-vex-sheet.png", "hue": 0.49, "sat": 1.26, "value": 1.05, "weapon": "sword"},
    {"id": "zero-volt-ren", "file": "zero-volt-ren-sheet.png", "hue": 0.14, "sat": 1.18, "value": 1.12, "weapon": "knife"},
]


def ensure_alpha(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a > 0 and g > 190 and r < 80 and b < 100:
                pixels[x, y] = (0, 0, 0, 0)
    return image


def palette_shift(image: Image.Image, hue: float, sat: float, value: float) -> Image.Image:
    image = ensure_alpha(image)
    out = Image.new("RGBA", image.size)
    source = image.load()
    target = out.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = source[x, y]
            if a == 0:
                target[x, y] = (0, 0, 0, 0)
                continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            # Preserve bright whites/skin highlights more than clothing.
            strength = 0.34 if s < 0.16 or v > 0.82 else 0.72
            h = (h + hue * strength) % 1.0
            s = min(1.0, s * (1 + (sat - 1) * strength))
            v = min(1.0, v * (1 + (value - 1) * strength))
            nr, ng, nb = colorsys.hsv_to_rgb(h, s, v)
            target[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), a)
    return ImageEnhance.Sharpness(out).enhance(1.08)


def frame_groups() -> list[dict]:
    groups = []
    for action, frames in ANIMATIONS["enemy"]["animations"].items():
      for index, frame in enumerate(frames):
          groups.append({"action": action, "index": index, **frame})
    return groups


def draw_weapon(draw: ImageDraw.ImageDraw, frame: dict, weapon: str | None, boss_scale: float = 1.0) -> None:
    if not weapon or frame["action"] == "down":
        return
    x, y, w, h = frame["x"], frame["y"], frame["w"], frame["h"]
    hand_x = x + int(w * (0.60 if frame["action"] in ("punch", "kick") else 0.42))
    hand_y = y + int(h * (0.50 if frame["action"] in ("punch", "kick") else 0.58))
    width = max(3, int(4 * boss_scale))

    if weapon == "knife":
        draw.line((hand_x - 8, hand_y + 4, hand_x + 25, hand_y - 12), fill=(35, 42, 52, 255), width=width + 2)
        draw.line((hand_x - 4, hand_y + 2, hand_x + 25, hand_y - 13), fill=(224, 246, 255, 255), width=width)
        draw.rectangle((hand_x - 14, hand_y + 1, hand_x - 3, hand_y + 7), fill=(75, 42, 22, 255))
    elif weapon == "staff":
        draw.line((hand_x - 38, hand_y + 30, hand_x + 46, hand_y - 34), fill=(75, 39, 16, 255), width=width + 2)
        draw.line((hand_x - 37, hand_y + 28, hand_x + 45, hand_y - 35), fill=(190, 122, 52, 255), width=width)
    elif weapon == "sword":
        draw.line((hand_x - 28, hand_y + 24, hand_x + 60, hand_y - 42), fill=(38, 54, 72, 255), width=width + 3)
        draw.line((hand_x - 22, hand_y + 19, hand_x + 62, hand_y - 44), fill=(232, 248, 255, 255), width=width)
        draw.line((hand_x - 34, hand_y + 27, hand_x - 18, hand_y + 16), fill=(84, 45, 20, 255), width=width + 2)
    elif weapon == "nunchaku":
        draw.line((hand_x - 20, hand_y + 5, hand_x - 2, hand_y - 10), fill=(78, 44, 18, 255), width=width + 2)
        draw.line((hand_x + 10, hand_y - 3, hand_x + 30, hand_y - 18), fill=(78, 44, 18, 255), width=width + 2)
        draw.line((hand_x - 2, hand_y - 10, hand_x + 10, hand_y - 3), fill=(232, 210, 120, 255), width=max(1, width - 1))


def write_sheet(source: Path, output: Path, hue: float, sat: float, value: float, weapon: str | None, boss_scale: float = 1.0) -> None:
    image = palette_shift(Image.open(source), hue, sat, value)
    draw = ImageDraw.Draw(image)
    for frame in frame_groups():
        draw_weapon(draw, frame, weapon, boss_scale)
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output)
    print(output.relative_to(ROOT))


def main() -> None:
    # Player sheet is normalized through the same alpha cleanup path while keeping its current animation metadata.
    player = ensure_alpha(Image.open(PLAYER_SOURCE))
    player.save(PLAYER_SOURCE)
    for spec in ENEMY_SPECS:
        write_sheet(ENEMY_SOURCE, ENEMY_DIR / spec["file"], spec["hue"], spec["sat"], spec["value"], spec["weapon"])
    for spec in BOSS_SPECS:
        write_sheet(ENEMY_SOURCE, BOSS_DIR / spec["file"], spec["hue"], spec["sat"], spec["value"], spec["weapon"], 1.18)


if __name__ == "__main__":
    main()

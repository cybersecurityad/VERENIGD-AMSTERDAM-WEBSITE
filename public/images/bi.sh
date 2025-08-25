#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="."
OUT_DIR="."
SIZES=(400 800 1200)
SLUGS=(wonen economie veiligheid groen democratie cultuur)

mkdir -p "$OUT_DIR"

# Kwaliteit/instellingen
JPG_Q=82
WEBP_Q=82
AVIF_Q=45   # lager = sterker gecomprimeerd
AVIF_SPEED=4

for slug in "${SLUGS[@]}"; do
  # zoek bron (jpg/png/webp)
  src=""
  for ext in jpg jpeg png webp; do
    if [[ -f "$SRC_DIR/$slug.$ext" ]]; then src="$SRC_DIR/$slug.$ext"; break; fi
  done
  if [[ -z "$src" ]]; then
    echo "⚠️  Bron ontbreekt voor $slug (verwacht $SRC_DIR/$slug.(jpg|png|webp))"
    continue
  fi

  echo "🔧 Verwerk $slug → $OUT_DIR"

  for w in "${SIZES[@]}"; do
    base="$OUT_DIR/$slug-$w"

    # 1) Basis resample (sRGB, strip, sharpen light)
    magick "$src" -auto-orient -colorspace sRGB -strip \
      -resize "${w}x" -unsharp 0x0.75+0.75+0.008 \
      -quality $JPG_Q -sampling-factor 4:2:0 \
      "$base.jpg"

    # 2) WEBP
    magick "$src" -auto-orient -colorspace sRGB -strip \
      -resize "${w}x" -unsharp 0x0.75+0.75+0.008 \
      -define webp:method=6 -quality $WEBP_Q \
      "$base.webp"

    # 3) AVIF
    magick "$src" -auto-orient -colorspace sRGB -strip \
      -resize "${w}x" -unsharp 0x0.75+0.75+0.008 \
      -define heic:speed=$AVIF_SPEED -define heic:lossless=false -quality $AVIF_Q \
      "$base.avif"
  done

  # Maak ook een “default” 800w alias als je oude code nog /images/<slug>.jpg verwacht
  cp "$OUT_DIR/$slug-800.jpg" "$OUT_DIR/$slug.jpg" 2>/dev/null || true
  cp "$OUT_DIR/$slug-800.webp" "$OUT_DIR/$slug.webp" 2>/dev/null || true
  cp "$OUT_DIR/$slug-800.avif" "$OUT_DIR/$slug.avif" 2>/dev/null || true
done

echo "✅ Klaar. Geëxporteerd naar $OUT_DIR/ als -400/-800/-1200 (jpg/webp/avif)."

#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="new"
OUT_DIR="images"

mkdir -p "$SRC_DIR" "$OUT_DIR"

shopt -s nullglob nocaseglob
imgs=("$SRC_DIR"/*.{jpg,jpeg,png})
shopt -u nocaseglob

if [ ${#imgs[@]} -eq 0 ]; then
  echo "⚠️  Geen bronafbeeldingen gevonden in $SRC_DIR (jpg/png)."
  exit 0
fi

echo "✅ Start conversie → AVIF & WebP (ImageMagick v7)"

for src in "${imgs[@]}"; do
  base="$(basename "$src")"
  name="${base%.*}"
  ext="${base##*.}"

  # Kopieer 1-op-1 fallback JPG (of maak er eentje van PNG)
  jpg_out="$OUT_DIR/$name.jpg"
  if [[ "$ext" =~ ^png$|^PNG$ ]]; then
    magick "$src" -strip -auto-orient -colorspace sRGB -quality 88 "$jpg_out"
  else
    magick "$src" -strip -auto-orient -colorspace sRGB -quality 88 "$jpg_out"
  fi

  # WebP (lossy, redelijk klein, goede kwaliteit)
  webp_out="$OUT_DIR/$name.webp"
  magick "$src" -strip -auto-orient -colorspace sRGB \
    -quality 82 -define webp:method=6 -define webp:auto-filter=true \
    "$webp_out"

  # AVIF (iets trager, maar nóg kleiner bij vergelijkbare kwaliteit)
  avif_out="$OUT_DIR/$name.avif"
  magick "$src" -strip -auto-orient -colorspace sRGB \
    -define heic:avif=true -define heic:speed=6 -quality 50 \
    "$avif_out"

  echo "• $base → $(basename "$jpg_out"), $(basename "$webp_out"), $(basename "$avif_out")"
done

echo "🎉 Klaar! Bestanden staan in $OUT_DIR"

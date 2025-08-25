#!/bin/bash
# generate-mstiles.sh (ImageMagick 7)

SRC="logo.png"

if [ ! -f "$SRC" ]; then
  echo "❌ Bronbestand $SRC niet gevonden!"
  exit 1
fi

echo "✅ Genereren Windows Tiles vanuit $SRC..."

# 70x70
magick "$SRC" -resize 70x70 -background none -gravity center -extent 70x70 mstile-70x70.png
# 150x150
magick "$SRC" -resize 150x150 -background none -gravity center -extent 150x150 mstile-150x150.png
# 310x150
magick "$SRC" -resize 310x150 -background none -gravity center -extent 310x150 mstile-310x150.png
# 310x310
magick "$SRC" -resize 310x310 -background none -gravity center -extent 310x310 mstile-310x310.png
# 144x144
magick "$SRC" -resize 144x144 -background none -gravity center -extent 144x144 mstile-144x144.png

echo "🎉 Klaar! Icons aangemaakt:"
ls -1 mstile-*.png

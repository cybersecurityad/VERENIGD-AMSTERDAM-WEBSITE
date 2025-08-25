#!/usr/bin/env bash
set -euo pipefail

### === Config ===
SITE="https://verenigdamsterdam.nl"
SITEMAPS=(
  "$SITE/sitemap.xml"
  "$SITE/sitemap-news.xml"
)

# Bing Webmaster Tools API (domein moet geverifieerd zijn)
BING_API_KEY="9352291147a7428293893acafafe6215"
BING_ENDPOINT="https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${BING_API_KEY}"

# IndexNow
INDEXNOW_KEY="0fe3f6a176a940219f91397a031e2da2"
INDEXNOW_KEY_LOCATION="$SITE/${INDEXNOW_KEY}.txt"
INDEXNOW_BULK_ENDPOINT="https://api.indexnow.org/indexnow"

### === Helpers ===
need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Vereist commando ontbreekt: $1" >&2; exit 1; }; }

# URL-encoder (RFC3986-ish)
urlencode() {
  local s="${1}" out="" c
  for ((i=0; i<${#s}; i++)); do
    c="${s:i:1}"
    case "$c" in
      [a-zA-Z0-9.~_-]) out+="$c" ;;
      *) printf -v hex '%%%02X' "'$c"; out+="$hex" ;;
    esac
  done
  printf '%s' "$out"
}

echo "🔧 Checking tools..."
need curl
# optioneel; we hebben fallbacks
command -v jq >/dev/null || echo "ℹ️  jq niet gevonden; we gebruiken xmllint/sed fallback."
TMP_DIR="$(mktemp -d)"; trap 'rm -rf "$TMP_DIR"' EXIT

URLS_TXT="$TMP_DIR/urls.txt"
URLS_JSON="$TMP_DIR/urls.json"
INDEXNOW_JSON="$TMP_DIR/indexnow.json"
: > "$URLS_TXT"

### === URLs uit (meerdere) sitemaps halen ===
for SITEMAP_URL in "${SITEMAPS[@]}"; do
  echo "🌐 Haal sitemap op: $SITEMAP_URL"
  SITEMAP_XML="$TMP_DIR/$(basename "$SITEMAP_URL")"
  if curl -fsSL "$SITEMAP_URL" -o "$SITEMAP_XML"; then
    if command -v xmllint >/dev/null 2>&1; then
      xmllint --xpath "//*[local-name()='loc']/text()" "$SITEMAP_XML" 2>/dev/null \
        | tr ' ' '\n' | sed '/^$/d' >> "$URLS_TXT" || true
    else
      # eenvoudige fallback
      sed -n 's:.*<loc>\(.*\)</loc>.*:\1:p' "$SITEMAP_XML" >> "$URLS_TXT" || true
    fi
  else
    echo "⚠️  Niet kunnen ophalen: $SITEMAP_URL"
  fi
done

# Fallback: als alles leeg is, gebruik handmatige lijst
if [ ! -s "$URLS_TXT" ]; then
  echo "⚠️  Geen URLs uit sitemaps gevonden; gebruik fallback lijst."
  cat > "$URLS_TXT" <<'LIST'
https://verenigdamsterdam.nl/
https://verenigdamsterdam.nl/verkiezingsprogramma/
https://verenigdamsterdam.nl/standpunten/
https://verenigdamsterdam.nl/gemeenteraadsverkiezingen/
https://verenigdamsterdam.nl/gemeenteraadsverkiezingen/forum/
https://verenigdamsterdam.nl/nieuws/
https://verenigdamsterdam.nl/forum/
https://verenigdamsterdam.nl/network/
https://verenigdamsterdam.nl/app/
https://verenigdamsterdam.nl/doe-mee/
https://verenigdamsterdam.nl/over-ons/
https://verenigdamsterdam.nl/contact/
https://verenigdamsterdam.nl/privacy/
https://verenigdamsterdam.nl/voorwaarden/
https://verenigdamsterdam.nl/toegankelijkheid/
https://verenigdamsterdam.nl/404.html
https://verenigdamsterdam.nl/site.manifest.json
https://verenigdamsterdam.nl/robots.txt
LIST
fi

# Ontdubbelen + schoonmaken
sort -u "$URLS_TXT" | sed '/^$/d' > "$TMP_DIR/urls.clean"
mv "$TMP_DIR/urls.clean" "$URLS_TXT"
mapfile -t URLS_ARR < "$URLS_TXT"
COUNT="${#URLS_ARR[@]}"
echo "✅ $COUNT URLs verzameld."

### === JSON payloads bouwen (zonder awk) ===
echo "🧱 Bouw Bing JSON payload…"
{
  printf '{\n'
  printf '  "siteUrl": "%s",\n' "$SITE"
  printf '  "urlList": [\n'
  for i in "${!URLS_ARR[@]}"; do
    sep=""
    [ "$i" -lt $((${#URLS_ARR[@]} - 1)) ] && sep=","
    printf '    "%s"%s\n' "${URLS_ARR[$i]}" "$sep"
  done
  printf '  ]\n'
  printf '}\n'
} > "$URLS_JSON"

echo "🧱 Bouw IndexNow JSON payload…"
HOST_NO_SCHEME="$(echo "$SITE" | sed 's#^https\?://##; s#/$##')"
{
  printf '{\n'
  printf '  "host": "%s",\n' "$HOST_NO_SCHEME"
  printf '  "key": "%s",\n' "$INDEXNOW_KEY"
  printf '  "keyLocation": "%s",\n' "$INDEXNOW_KEY_LOCATION"
  printf '  "urlList": [\n'
  for i in "${!URLS_ARR[@]}"; do
    sep=""
    [ "$i" -lt $((${#URLS_ARR[@]} - 1)) ] && sep=","
    printf '    "%s"%s\n' "${URLS_ARR[$i]}" "$sep"
  done
  printf '  ]\n'
  printf '}\n'
} > "$INDEXNOW_JSON"

### === Submit naar Bing (batch) ===
echo "🚀 Submit naar Bing (batch)…"
BING_RESP="$(curl -sS -w '\n%{http_code}' -H 'Content-Type: application/json; charset=utf-8' \
  --data @"$URLS_JSON" "$BING_ENDPOINT")"
BING_BODY="$(echo "$BING_RESP" | sed '$d')"
BING_CODE="$(echo "$BING_RESP" | tail -n1)"
if [ "$BING_CODE" = "200" ]; then
  echo "✅ Bing OK (200)"
else
  echo "❌ Bing fout ($BING_CODE): $BING_BODY"
fi

### === Submit naar IndexNow (bulk) ===
echo "⚡ Submit naar IndexNow (bulk)…"
INX_RESP="$(curl -sS -w '\n%{http_code}' -H 'Content-Type: application/json; charset=utf-8' \
  --data @"$INDEXNOW_JSON" "$INDEXNOW_BULK_ENDPOINT")"
INX_BODY="$(echo "$INX_RESP" | sed '$d')"
INX_CODE="$(echo "$INX_RESP" | tail -n1)"
if [[ "$INX_CODE" =~ ^20[0-9]$ ]]; then
  echo "✅ IndexNow bulk OK ($INX_CODE)"
else
  echo "❌ IndexNow bulk fout ($INX_CODE): $INX_BODY"
fi

### === Extra: per-URL ping (IndexNow GET) ===
echo "🔁 Per-URL pings (IndexNow GET)…"
i=0
for URL in "${URLS_ARR[@]}"; do
  ((i++)) || true
  PING_URL="https://www.bing.com/indexnow?url=$(urlencode "$URL")&key=$INDEXNOW_KEY"
  CODE="$(curl -s -o /dev/null -w '%{http_code}' "$PING_URL")"
  if [[ "$CODE" =~ ^20[0-9]$ ]]; then
    printf "  [%03d] ✅ %s\n" "$i" "$URL"
  else
    printf "  [%03d] ❌ (%s) %s\n" "$i" "$CODE" "$URL"
  fi
  sleep 0.3
done

echo "🎉 Klaar."
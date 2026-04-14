#!/bin/bash
# =============================================================
# generate-keystore.sh
# Generate Android release keystore untuk Eldora
# Jalankan SEKALI saja sebelum pertama kali CI/CD dipakai.
# =============================================================

set -e

KEYSTORE_FILE="eldora-release.keystore"
KEY_ALIAS="eldora-key"

echo ""
echo "=== Eldora Android Release Keystore Generator ==="
echo ""
echo "File output : $KEYSTORE_FILE"
echo "Key alias   : $KEY_ALIAS"
echo ""
echo "Kamu akan diminta mengisi:"
echo "  - Keystore password (min 6 karakter)"
echo "  - Key password (boleh sama dengan keystore password)"
echo "  - Identitas: nama, organisasi, kota, negara, dll."
echo ""

keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore "$KEYSTORE_FILE" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

echo ""
echo "=== Keystore berhasil dibuat: $KEYSTORE_FILE ==="
echo ""
echo "--- Langkah selanjutnya: Encode ke Base64 untuk GitHub Secret ---"
echo ""

# Encode ke base64 (Linux/Mac)
if command -v base64 &>/dev/null; then
  BASE64_FILE="${KEYSTORE_FILE%.keystore}_base64.txt"
  base64 -w 0 "$KEYSTORE_FILE" > "$BASE64_FILE"
  echo "File base64 tersimpan di: $BASE64_FILE"
  echo ""
fi

echo "=== GitHub Secrets yang perlu di-set ==="
echo ""
echo "  Secret Name                  | Value"
echo "  -----------------------------|------------------------------------------"
echo "  ANDROID_KEYSTORE_BASE64      | isi dari $BASE64_FILE (atau: base64 -w 0 $KEYSTORE_FILE)"
echo "  ANDROID_KEYSTORE_PASSWORD    | password keystore yang kamu masukkan tadi"
echo "  ANDROID_KEY_ALIAS            | $KEY_ALIAS"
echo "  ANDROID_KEY_PASSWORD         | password key yang kamu masukkan tadi"
echo ""
echo "=== Cara set GitHub Secret ==="
echo ""
echo "  1. Buka repo di GitHub → Settings → Secrets and variables → Actions"
echo "  2. Klik 'New repository secret'"
echo "  3. Tambahkan keempat secret di atas"
echo ""
echo "PENTING: Simpan password keystore dengan aman (password manager)."
echo "         Jika hilang, kamu tidak bisa update app di Play Store."
echo ""

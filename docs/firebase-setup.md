# Firebase Setup — Eldora

Panduan mendapatkan `firebase-service-account.json` untuk notifikasi push (FCM).

---

## Langkah 1: Buka Firebase Console

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Login dengan akun Google
3. Klik **"Add project"** (atau pilih project yang sudah ada)
4. Beri nama project, misal: `Eldora`
5. Nonaktifkan Google Analytics jika tidak diperlukan → **Create project**

---

## Langkah 2: Daftarkan Aplikasi Android

1. Di halaman project, klik ikon **Android** (tambah app)
2. **Android package name**: `com.eldora.app` (sesuai `app.json`)
3. Klik **Register app**
4. Download file `google-services.json`
5. Letakkan di: `Frontend-Eldora/google-services.json`

> File ini juga dibutuhkan saat `expo prebuild` untuk konfigurasi FCM di Android.

---

## Langkah 3: Dapatkan Service Account (untuk Backend)

1. Di Firebase Console, klik ikon roda gigi ⚙️ → **Project Settings**
2. Pilih tab **Service Accounts**
3. Pastikan **Firebase Admin SDK** dipilih
4. Klik **"Generate new private key"**
5. Klik **"Generate key"** pada dialog konfirmasi
6. File JSON akan ter-download otomatis

---

## Langkah 4: Tempatkan di Backend

```bash
# Rename file yang didownload
mv ~/Downloads/eldora-firebase-adminsdk-*.json \
   c:/Dev/Eldora/Backend-Eldora/firebase-service-account.json
```

Pastikan path di `.env` Backend sudah benar:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

---

## Langkah 5: Verifikasi .gitignore

Pastikan file rahasia ini **tidak ter-commit** ke Git:

```
# Backend-Eldora/.gitignore
firebase-service-account.json
```

> File ini berisi private key — **jangan pernah di-push ke repository**.

---

## Struktur File Setelah Setup

```
Backend-Eldora/
├── firebase-service-account.json   ← private key (gitignored)
├── .env
└── src/config/firebase.ts          ← sudah dikonfigurasi

Frontend-Eldora/
└── google-services.json            ← untuk Android FCM
```

---

## Troubleshooting

| Error | Solusi |
|-------|--------|
| `FIREBASE_SERVICE_ACCOUNT_PATH file not found` | Cek path di `.env`, pastikan file ada di lokasi tersebut |
| `FCM send failed: invalid credentials` | Service account sudah expired atau salah project |
| `Notification tidak muncul di HP` | Pastikan `google-services.json` sesuai dengan `android.package` di `app.json` |
| Push token tidak tersimpan | Pastikan user memberi izin notifikasi di HP saat pertama buka app |

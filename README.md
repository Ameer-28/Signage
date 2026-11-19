# Signage NestJS

Pengganti SevenSign (CMS + player) berbasis NestJS. CMS dan player berupa halaman web, sehingga bisa dibuka dari mana saja lewat internet.

## Menjalankan

    npm install
    API_KEY=isi-kunci-rahasia npm start

(Windows PowerShell: `$env:API_KEY="isi-kunci-rahasia"; npm start`)

- CMS: http://localhost:3000/cms.html (ganti gambar/video iklan, teks berjalan, dan atur layout, lalu Publish)
- Player: http://localhost:3000/player.html (layar penuh atau Chrome `--kiosk`)
- Pemanggil antrian: http://localhost:3000/caller.html

Template asli SevenSign memiliki bingkai yang sudah menyatu di gambar latar (`BG.jpg`). Begitu blok dipindah, CMS otomatis memakai latar polos (`BG_polos.jpg`) agar tidak ada bingkai tertinggal. Latar bisa diganti di bagian "Latar layar", termasuk dengan gambar sendiri.

Hasil edit CMS disimpan di `data/channel.json`. Hapus file itu untuk kembali ke isi awal dari `data/PRAMITHA.XML`.

## Pasang di server (agar bisa diakses dari jauh)

1. Di VPS: `npm run build`, lalu `API_KEY=... PORT=3000 npm run start:prod`.
2. Pasang reverse proxy dengan HTTPS (Caddy atau Nginx) ke port 3000. WebSocket harus ikut diteruskan. Di Nginx, naikkan `client_max_body_size` (misalnya 300m) agar video bisa diunggah.
3. Di setiap layar, buka `https://domain-anda/player.html`. Untuk suara video, jalankan Chrome dengan `--autoplay-policy=no-user-gesture-required` (video saat ini diputar tanpa suara).

## API

| Method | Path | Kunci | Fungsi |
|---|---|---|---|
| GET | /api/channel | tidak | Isi channel |
| GET | /api/queue | tidak | Antrian terakhir per layanan |
| GET | /api/auth | ya | Cek kunci akses |
| PUT | /api/channel | ya | Simpan hasil edit dan publish ke semua player |
| POST | /api/media | ya | Unggah gambar/video (field `file`) |
| POST | /api/queue/call | ya | `{"service":1,"prefix":"A","number":"001"}` |

Kunci dikirim lewat header `x-api-key`.

## Belum ada

- Tambah atau hapus blok baru, dan mengatur urutan lapisan antar blok
- Database dan akun pengguna terpisah (sekarang satu kunci akses)
- Bridge UDP port 3333 untuk sistem antrian lama
- Suara panggilan, cache media offline, daftar status player, hapus file media yang tak terpakai

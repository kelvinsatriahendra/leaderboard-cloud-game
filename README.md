# Lari Trus

## Deskripsi Proyek

> **Proyek UAS:** Game ini dikembangkan untuk memenuhi Tugas Akhir Semester (UAS) mata kuliah **Cloud Computing**, **Pemrograman Game**, dan **Pemrograman Berbasis Mobile**.

## preview
![kentaro2-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/7e4adb08-8431-427b-80ea-7d13e13f4029)



Proyek ini adalah game platformer "endless" online yang dibangun menggunakan Library Phaser 3 dengan integrasi Cloud untuk penyimpanan data skor dan dapat dimainkan di perangkat mobile.

## Tampilan (Preview)



## 🔧 Dibuat Menggunakan

- HTML5 & CSS3
- Javascript
- [Phaser 3](http://phaser.io/phaser3) (Game Engine)
- **Firebase** (Realtime Database & Leaderboard)
- **Netlify** (Cloud Hosting)
- **Capacitor / Cordova** (Untuk build ke Android APK)

## Tentang Game

> **Lari Trus** adalah game platformer endless-runner sederhana yang berfokus pada mengumpulkan koin dan menjatuhkan misil.

> Game dimulai dengan karakter pemain yang sudah berlari ke depan, dan tujuanmu adalah membantunya mengumpulkan koin sebanyak mungkin sebelum bar kesehatan (*health bar*) habis sepenuhnya.

## Cara Bermain

- Klik tombol **Instructions** (Petunjuk) di **Main Menu** game untuk membaca aturan dan tujuan permainan, serta kontrol untuk menggerakkan karakter pemain.

## 🔴 Demo & Download

- **Mainkan di Web:** [Lari Trus di Netlify](https://lari-terus-kelvin.netlify.app/)

## Pengembangan Game

- ### Ideasi & Konteks Akademik
  Game ini dirancang sebagai implementasi dari tugas gabungan mata kuliah **Pemrograman Game**, **Cloud Computing**, dan **Pemrograman Berbasis Mobile**. 
  
  Tantangan utamanya adalah menciptakan game yang responsif, ringan, terintegrasi dengan layanan cloud, dan dapat berjalan lancar di perangkat mobile (Android). Saya memutuskan untuk membuat genre *Endless Runner* karena membutuhkan logika permainan yang cepat dan manajemen memori yang efisien.

- ## Desain
  Meskipun proyek ini adalah game 2D sederhana, saya ingin visualnya menarik. Saya membangun sistem **Parallax** dengan 3 lapisan gambar latar belakang bergulir.
  
  Tantangan teknisnya adalah membuat background bergulir tanpa batas (*infinite scrolling*) tanpa membebani memori browser/ponsel, yang berhasil diatasi dengan teknik daur ulang aset gambar (*pooling*).

- ## Pengembangan (Development)
  Pengembangan dilakukan menggunakan Phaser 3 dengan langkah-langkah berikut:

  - Menginstal Phaser menggunakan Node Package Manager (npm).
  - Mendesain Scene Game:
    1. Membuat latar belakang parallax.
    1. Menambahkan logika karakter pemain (lompat, lari, *hitbox*).
    1. Menambahkan rintangan dan musuh.
  - **Integrasi Cloud Computing:**
    - Menghubungkan game dengan **Firebase Realtime Database**.
    - Membuat sistem **Leaderboard** online di mana skor tertinggi pemain akan tersimpan di server cloud (Firebase).
  - **Implementasi Mobile:**
    - Mengonversi game web menjadi aplikasi Android (`.apk`) agar memenuhi syarat Pemrograman Berbasis Mobile.
    - Menyesuaikan kontrol sentuh (touchscreen) agar nyaman dimainkan di HP.
  - Finalisasi dan uji coba.

- ## Deployment
  Game ini di-hosting menggunakan layanan cloud **Netlify** agar dapat diakses secara global dengan performa yang cepat (CDN). Database skor menggunakan **Google Firebase**.

## Cara menjalankan game di komputer lokal

### Prasyarat
1. Node Package Manager (npm)

### Langkah-langkah

1. Kloning repositori ke komputer lokal kamu dengan menjalankan perintah berikut di terminal:
   ```bash
   git clone [https://github.com/kelvinsatriahendra/leaderboard-cloud-game.git](https://github.com/kelvinsatriahendra/leaderboard-cloud-game.git)

## ✒️  Penulis

👤 **Kelvin Satria Hendra**

- Github: [@KelvinSatriaHendra](https://github.com/KelvinSatriaHendra)
- LinkedIn: [Kelvin Satria Hendra](https://www.linkedin.com/in/kelvinsatriahendra)

## Dukungan

Berikan bintang ⭐️ jika kamu menyukai proyek ini!

## Terimakasih
(Credits)
Terima kasih kepada penyedia aset gratis yang digunakan dalam pembelajaran ini:

OpenGameArt.org

CoolText.com

kenney.nl

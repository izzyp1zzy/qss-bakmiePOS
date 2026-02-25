🛒 Point of Sale (POS) & Inventory System

Aplikasi web kasir (Point of Sale) dan manajemen inventaris real-time berbasis cloud yang dirancang untuk kecepatan operasional bisnis (UMKM, F&B, Retail). Dibangun menggunakan ekosistem React.js dan Firebase, dengan dukungan integrasi pencetakan struk thermal.

🔗 Live Demo: https://qss-bakmie.web.app

🚀 Fitur Utama

Role-Based Access Control (RBAC): Sistem autentikasi berlapis menggunakan PIN internal untuk membedakan hak akses antara Owner, Admin, Kasir, dan Investor.

Real-Time Data Sync: Menggunakan onSnapshot Firestore sehingga data transaksi dan sisa stok bahan baku langsung ter-update di semua perangkat tanpa perlu me-refresh halaman.

Dynamic Inventory Engine: Logika pemotongan stok bahan baku secara otomatis (berdasarkan resep/komposisi) setiap kali transaksi berhasil diproses. Perhitungan HPP (Harga Pokok Penjualan) secara real-time.

Hardware Integration: Mendukung pencetakan struk kasir (thermal printer) dengan antarmuka struk khusus menggunakan @media print CSS.

Responsive UI/UX: Tampilan kasir dan dashboard manajemen yang mulus dan responsif di berbagai ukuran layar, dibangun menggunakan Tailwind CSS.

🛠️ Tech Stack (Teknologi yang Digunakan)

Frontend: React.js, Vite, Tailwind CSS, Lucide React (Icons).

Backend/BaaS: Firebase Firestore (NoSQL Database), Firebase Authentication (Anonymous & Custom Auth).

Deployment: Firebase Hosting.

Workflow: AI-Assisted Development (Prompting, Refactoring, Debugging).

📸 Screenshots / Tangkapan Layar

(Tips: Nanti ganti teks di bawah ini dengan gambar asli aplikasimu saat di-upload ke GitHub)

**1. Halaman Login & PIN Akses**
![Halaman Login](screenshots/login.png)

**2. Halaman dashboard**
![Halaman dashboard](screenshots/dashboardview.png)

**3. HAlaman Inventory**
![Halaman Inventory](screenshots/inventoryview.PNG)

**4 POSview**
![halaman POS](screenshots/POSview.PNG)


**5. laporan**
![Laporan View](screenshots/laporan.PNG)

**6. karyawan**
![karyawan View](screenshots/kinerjatim.PNG)


💻 Cara Menjalankan di Komputer Lokal (Local Development)

Jika Anda ingin menjalankan atau mengembangkan aplikasi ini di komputer Anda, ikuti langkah berikut:

Clone repository ini (jika dari GitHub) atau buka folder project di terminal.

Install dependensi:

npm install


Konfigurasi Firebase:
Pastikan Anda telah membuat project di Firebase Console dan mengganti konfigurasi firebaseConfig di dalam file firebase.js dengan konfigurasi milik Anda.

Jalankan server lokal:

npm run dev


Buka http://localhost:5173 di browser Anda.

📦 Deployment (Hosting)

Proyek ini telah dikonfigurasi untuk Firebase Hosting. Untuk melakukan deploy versi terbaru, jalankan perintah:

npm run build
firebase deploy


Dikembangkan oleh [Muhammad Iwan Nur Fauzy] - 2026

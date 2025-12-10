// Import fungsi yang dibutuhkan dari Firebase
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";

// --- KONFIGURASI FIREBASE KAMU ---
const firebaseConfig = {
  apiKey: "AIzaSyAwS2GmDji84CoVXLthA6cFkuXQXfY_6Gc",
  authDomain: "lariterusdb.firebaseapp.com",
  databaseURL:
    "https://lariterusdb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lariterusdb",
  storageBucket: "lariterusdb.firebasestorage.app",
  messagingSenderId: "54228960394",
  appId: "1:54228960394:web:b06e24459e05aca2fc9973",
};

// --- INISIALISASI ---
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- [DIUBAH] FUNGSI CEK NAMA ---
// Karena tidak ada kuncian Device ID, semua nama BOLEH dipakai.
// Kita hanya cek untuk menyapa "Selamat Datang Kembali" atau "Pemain Baru".
export const checkUsernameAvailability = async (usernameInput) => {
  // Bersihkan nama dari karakter terlarang Firebase (., #, $, [, ])
  const safeName = usernameInput.replace(/[.#$[\]]/g, "");

  const userRef = ref(db, "leaderboard/" + safeName);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return { status: true, msg: `Halo lagi, ${usernameInput}!` };
    } else {
      return { status: true, msg: "Nama tersedia, selamat main!" };
    }
  } catch (error) {
    return { status: true, msg: "Offline Mode" };
  }
};

// --- [DIUBAH] FUNGSI SIMPAN SKOR (BERDASARKAN NAMA) ---
export const saveScoreToCloud = async (name, newScore) => {
  // Gunakan Nama sebagai Kunci (ID)
  const safeName = name.replace(/[.#$[\]]/g, "");
  const userRef = ref(db, "leaderboard/" + safeName);

  try {
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      // --- DATA SUDAH ADA ---
      const oldData = snapshot.val();
      const oldScore = oldData.score;

      // Cek Highscore: Kalau skor baru lebih tinggi, Update!
      if (newScore > oldScore) {
        set(userRef, { username: name, score: newScore });
        console.log(`Rekor ${name} pecah! ${oldScore} -> ${newScore}`);
      } else {
        console.log(`Skor ${newScore} belum mengalahkan ${oldScore}.`);
      }
    } else {
      // --- DATA BARU ---
      set(userRef, { username: name, score: newScore });
      console.log(`Pemain baru ${name} dicatat!`);
    }
  } catch (error) {
    console.error("Gagal simpan skor:", error);
  }
};

// --- FUNGSI AMBIL LEADERBOARD (TETAP) ---
export const getTopScores = (callback) => {
  const topScoreQuery = query(
    ref(db, "leaderboard"),
    orderByChild("score"),
    limitToLast(10)
  );

  onValue(topScoreQuery, (snapshot) => {
    const data = snapshot.val();
    let parsedData = [];
    if (data) {
      Object.keys(data).forEach((key) => {
        parsedData.push(data[key]);
      });
      parsedData.sort((a, b) => b.score - a.score);
    }
    callback(parsedData);
  });
};

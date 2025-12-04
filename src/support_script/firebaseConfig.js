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
  equalTo,
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

// ==========================================
// BAGIAN BARU: SISTEM ID UNIK & CEK SKOR
// ==========================================

// 1. FUNGSI ID UNIK (KTP DIGITAL)
// Membuat ID khusus untuk HP/Laptop ini agar tidak tertukar dengan orang lain
function getDeviceID() {
  let id = localStorage.getItem("lari_terus_id");
  if (!id) {
    // Kalau belum punya ID, buat baru
    id = "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    localStorage.setItem("lari_terus_id", id);
  }
  return id;
}

// 2. FUNGSI CEK NAMA (Dipanggil di Boot.js)
// Mencegah orang lain pakai nama yang sudah diklaim di HP ini
export const checkUsernameAvailability = async (usernameInput) => {
  const currentDeviceID = getDeviceID();
  const dbRef = ref(db, "leaderboard");

  // Cari apakah ada username yang sama
  const q = query(dbRef, orderByChild("username"), equalTo(usernameInput));

  try {
    const snapshot = await get(q);

    if (snapshot.exists()) {
      // Nama ditemukan! Cek siapa pemiliknya.
      let isMyName = false;

      snapshot.forEach((childSnapshot) => {
        // Cek apakah data itu milik Device ID ini?
        if (childSnapshot.key === currentDeviceID) {
          isMyName = true;
        }
      });

      if (isMyName) {
        return { status: true, msg: "Selamat datang kembali!" };
      } else {
        return { status: false, msg: "Nama sudah dipakai orang lain!" };
      }
    } else {
      return { status: true, msg: "Nama tersedia." };
    }
  } catch (error) {
    console.error("Error cek nama:", error);
    return { status: true, msg: "Offline Mode" };
  }
};

// 3. FUNGSI SIMPAN SKOR PINTAR
// Hanya simpan kalau SKOR BARU > SKOR LAMA
export const saveScoreToCloud = async (name, newScore) => {
  const userID = getDeviceID(); // Ambil ID HP ini
  const userRef = ref(db, "leaderboard/" + userID); // Simpan di loker khusus ID ini

  try {
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const oldData = snapshot.val();
      const oldScore = oldData.score;

      // Bandingkan skor
      if (newScore > oldScore) {
        set(userRef, { username: name, score: newScore });
        console.log(`Rekor Baru! ${oldScore} -> ${newScore}`);
      } else {
        console.log(`Skor ${newScore} tidak cukup tinggi.`);
      }
    } else {
      // Pemain baru, langsung simpan
      set(userRef, { username: name, score: newScore });
      console.log("Data pemain baru disimpan!");
    }
  } catch (error) {
    console.error("Gagal simpan:", error);
  }
};

// 4. FUNGSI AMBIL LEADERBOARD (Tetap Sama)
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

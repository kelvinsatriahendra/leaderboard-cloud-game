import Phaser from "phaser";
import { gameState, playStopAudio } from "./boot";
import CustomButton from "./support_script/CustomButton";
// Pastikan file firebaseConfig.js sudah aman ya!
import { getTopScores } from "./support_script/firebaseConfig";
import "regenerator-runtime/runtime";

class LeaderBoard extends Phaser.Scene {
  constructor() {
    super({ key: "Leader" }); // Key-nya 'Leader' sesuai GameOver.js
  }

  create() {
    this.hoverSound = this.sound.add("hoverBtnSound", { loop: false });
    this.clickSound = this.sound.add("clickBtnSound", { loop: false });

    // 1. BACKGROUND
    this.add
      .image(gameState.sceneWidth / 2, gameState.sceneHeight / 2, "sky")
      .setScale(0.5);

    // Panel Hitam Transparan
    const panelWidth = 600;
    const panelHeight = 400;
    const panelX = (gameState.sceneWidth - panelWidth) / 2;
    const panelY = (gameState.sceneHeight - panelHeight) / 2;

    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 0.85);
    graphics.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
    graphics.lineStyle(4, 0xffd700, 1);
    graphics.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);

    // 2. JUDUL
    this.add
      .text(gameState.sceneWidth / 2, panelY + 40, "HALL OF FAME", {
        fontSize: "40px",
        fill: "#FFD700",
        fontFamily: '"Akaya Telivigala"',
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // 3. HEADER KOLOM
    const headerY = panelY + 90;
    const colRankX = panelX + 80;
    const colNameX = panelX + 200;
    const colScoreX = panelX + 520;
    const headerStyle = {
      fontSize: "24px",
      fill: "#00ffff",
      fontFamily: '"Akaya Telivigala"',
      stroke: "#000",
      strokeThickness: 2,
    };

    this.add.text(colRankX, headerY, "RANK", headerStyle).setOrigin(0.5);
    this.add.text(colNameX, headerY, "NAME", headerStyle).setOrigin(0, 0.5);
    this.add.text(colScoreX, headerY, "SCORE", headerStyle).setOrigin(1, 0.5);

    // 4. LOGIKA FIREBASE (Data Skor)
    this.loadingText = this.add
      .text(
        gameState.sceneWidth / 2,
        gameState.sceneHeight / 2,
        "Memuat Data Cloud...",
        {
          fontSize: "25px",
          fill: "#00ff00",
          fontFamily: '"Akaya Telivigala"',
        }
      )
      .setOrigin(0.5);

    getTopScores((scores) => {
      if (this.loadingText) this.loadingText.destroy();
      if (scores && scores.length > 0) {
        this.displayScores(scores, panelX, headerY + 40);
      } else {
        this.showEmptyMessage();
      }
    });

    // --- 5. [BARU] TOMBOL SHARE FACEBOOK ---
    const shareBtn = this.add
      .text(
        gameState.sceneWidth / 2,
        panelY + panelHeight - 80,
        "SHARE SCORE",
        {
          fontSize: "28px",
          fill: "#ffffff",
          fontFamily: '"Akaya Telivigala"',
          backgroundColor: "#1877F2", // Warna Biru Facebook
          padding: { x: 15, y: 8 },
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    shareBtn.on("pointerup", () => {
      // Link Game Kamu (Ganti dengan link Netlify nanti)
      const gameUrl = "https://lari-terus-kelvin.netlify.app";
      const caption = `Saya baru saja mencetak skor ${gameState.score} di Game Lari Terus! Coba kalahkan saya!`;

      // Membuka jendela share Facebook
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        gameUrl
      )}&quote=${encodeURIComponent(caption)}`;
      window.open(shareUrl, "_blank");
    });

    // 6. TOMBOL KEMBALI
    const backBtn = new CustomButton(
      this,
      gameState.sceneWidth / 2,
      panelY + panelHeight - 30,
      "mainMenu",
      "mainMenuHover"
    );
    backBtn.setScale(0.6);
    this.add.existing(backBtn);

    backBtn
      .setInteractive()
      .on("pointerup", () => {
        playStopAudio(gameState.sound, this.clickSound);
        this.scene.stop();
        this.scene.start("Menu");
      })
      .on("pointerover", () => {
        playStopAudio(gameState.sound, this.hoverSound);
      });
  }

  showEmptyMessage() {
    this.add
      .text(
        gameState.sceneWidth / 2,
        gameState.sceneHeight / 2,
        "Belum ada data.",
        {
          fontSize: "30px",
          fill: "#888888",
          fontFamily: '"Akaya Telivigala"',
          align: "center",
        }
      )
      .setOrigin(0.5);
  }

  displayScores(scores, startX, startY) {
    let yPos = startY;
    // Tampilkan 5 Skor Teratas
    for (let i = 0; i < Math.min(scores.length, 5); i++) {
      const rank = i + 1;
      const user = scores[i].username || scores[i].user || "Unknown";
      const score = scores[i].score;

      let rankColor = "#ffffff";
      if (rank === 1) rankColor = "#FFD700"; // Emas
      else if (rank === 2) rankColor = "#C0C0C0"; // Perak
      else if (rank === 3) rankColor = "#CD7F32"; // Perunggu

      const rowStyle = {
        fontSize: "22px",
        fill: rankColor,
        fontFamily: '"Akaya Telivigala"',
        stroke: "#000",
        strokeThickness: 1,
      };

      this.add.text(startX + 80, yPos, `${rank}`, rowStyle).setOrigin(0.5);
      this.add.text(startX + 200, yPos, user, rowStyle).setOrigin(0, 0.5);
      this.add.text(startX + 520, yPos, `${score}`, rowStyle).setOrigin(1, 0.5);

      yPos += 35;
    }
  }
}

export default LeaderBoard;

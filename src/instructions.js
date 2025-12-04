import Phaser from "phaser";
import { gameState, playStopAudio } from "./boot";
import CustomButton from "./support_script/CustomButton";
import { setText } from "./gameOver";

class Instructions extends Phaser.Scene {
  constructor() {
    super({ key: "instructions" });
  }

  create() {
    this.hoverSound = this.sound.add("hoverBtnSound", { loop: false });
    this.clickSound = this.sound.add("clickBtnSound", { loop: false });

    playStopAudio(gameState.music, gameState.theme1);

    this.add
      .image(gameState.sceneWidth / 2, gameState.sceneHeight / 2, "sky")
      .setScale(0.5);

    this.add
      .rectangle(
        0,
        0,
        gameState.sceneWidth,
        gameState.sceneHeight,
        0x000000,
        0.2
      )
      .setOrigin(0);

    const message = `"Lari Terus" adalah game seru sederhana
  tentang mengumpulkan koin dan menghancurkan rudal.
  
  Tujuanmu adalah mengumpulkan koin sebanyak mungkin
  sebelum bar "Nyawa" kamu habis.
  
  Mengambil Koin dan menghancurkan Rudal akan
  menambah nyawamu agar bisa bertahan lebih lama.
  (Hati-hati: Menabrak rudal akan mengurangi
  nyawamu secara drastis).
  
  Gunakan panah 'ATAS' untuk melompat (Tekan
  dua kali untuk lompatan ganda).
  
  
  `;

    const message2 = "!! AYO SEKARANG KITA MAIN !!";

    setText(
      this,
      gameState.sceneWidth / 2 + 70,
      gameState.sceneHeight / 2,
      "INSTRUKSI",
      "60px",
      "#00ff00",
      "#ffffff",
      0,
      0.5
    );

    setText(this, 20, 10, message, "20px", "#000000", "#ffffff", 0, 0);
    setText(
      this,
      20,
      gameState.sceneHeight - 20,
      message2,
      "20px",
      "#ffffff",
      "#ff00ff",
      0,
      0.5
    );

    const backBtn = new CustomButton(
      this,
      gameState.sceneWidth - 100,
      gameState.sceneHeight - 50,
      "mainMenu",
      "mainMenuHover"
    );
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
}

export default Instructions;

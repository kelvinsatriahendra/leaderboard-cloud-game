import Phaser from "phaser";
import { gameState, playStopAudio } from "./boot";
import * as fetchScoreData from "./support_script/fetchData";
import "regenerator-runtime/runtime";

// --- HELPER FUNCTIONS ---
const createPlatform = (group, spriteWidth, myTexture, dist = 0) => {
  const platform = group
    .create(spriteWidth + dist, gameState.sceneHeight, myTexture)
    .setOrigin(0, 1)
    .setScale(0.5);
  if (myTexture === "ground") {
    platform.setImmovable(true);
    platform.setSize(platform.displayWidth * 2, platform.displayHeight - 50);
  }
  if (myTexture === "ground") platform.setDepth(2);
  if (myTexture === "plateau") platform.setDepth(1);
};

const updatePlatform = (group, spriteWidth, myTexture, dist = 0) => {
  const child = group.get(spriteWidth - dist, gameState.sceneHeight, myTexture);
  child.setVisible(true);
  child.setActive(true);
  if (myTexture === "ground") child.setDepth(2);
  if (myTexture === "plateau") child.setDepth(1);
};

const moveBackgroundPlatform = (
  group,
  platformWidth,
  myTexture,
  scrollFactor
) => {
  group.children.iterate((child) => {
    child.x -= scrollFactor;
    if (child.x < -child.displayWidth) {
      group.killAndHide(child);
      updatePlatform(group, platformWidth, myTexture, scrollFactor);
    }
  });
};

// --- MAIN CLASS ---
class Game extends Phaser.Scene {
  constructor() {
    super({ key: "Game" });
    this.timer = 0;
    this.secondTimer = 0;
    this.healthTimer = 0;
    this.missileScore = 0;
  }

  create() {
    this.gameTheme = this.sound.add("theme2", { loop: true });
    this.gameTheme.volume = 0.1;
    playStopAudio(gameState.music, this.gameTheme);
    this.addSoundEffects();

    gameState.score = 0;
    this.health = 120;

    // --- UI TEXT & HEALTH BAR ---
    this.scoreText = this.add
      .text(50, 25, "Coins: ", {
        fontSize: "40px",
        fill: "#ffffff",
        fontFamily: '"Akaya Telivigala"',
        strokeThickness: 10,
        stroke: "#FFD700",
      })
      .setDepth(8);
    this.scoreValue = this.add
      .text(170, 25, `${gameState.score}`, {
        fontSize: "40px",
        fill: "#ffffff",
        fontFamily: '"Akaya Telivigala"',
        strokeThickness: 5,
        stroke: "#000",
      })
      .setDepth(8);
    this.healthText = this.add
      .text(50, 75, "Health: ", {
        fontSize: "30px",
        fill: "#ffffff",
        strokeThickness: 8,
        fontFamily: '"Akaya Telivigala"',
        stroke: "#FF69B4",
      })
      .setDepth(8);

    this.progressBox = this.add.graphics().setDepth(8);
    this.progressBar = this.add.graphics().setDepth(8);
    this.progressBox.lineStyle(3, 0x0275d8, 1);
    this.progressBox.strokeRect(170, 95, this.health, 10);
    this.progressBar.fillStyle(0xffd700, 1);
    this.progressBar.fillRect(170, 95, this.health, 10);

    this.addGameBackground();

    // --- SETTING PLAYER (KENTARO) ---
    // Scale 0.12 sesuai permintaan
    this.player = this.physics.add
      .sprite(100, gameState.sceneHeight - 150, "kentaro")
      .setScale(0.12);

    this.physics.add.collider(this.player, this.groundGroup);
    this.player.setGravityY(1000);
    this.player.setDepth(6);
    this.player.body.setCollideWorldBounds();

    this.cursors = this.input.keyboard.createCursorKeys();

    // --- [BARU] FITUR TOUCHSCREEN / KLIK MOUSE ---
    // Kode ini ditambahkan agar bisa main di HP
    this.input.on("pointerdown", () => {
      if (
        this.player.body.touching.down ||
        (this.jump < this.jumpTimes && this.jump > 0)
      ) {
        this.player.setVelocityY(-400);
        this.jumpSound.play();
        if (this.player.body.touching.down) {
          this.jump = 0;
        }
        this.jump += 1;
      }
    });
    // ---------------------------------------------

    this.jumpTimes = 2;
    this.jump = 0;

    // --- BIRDS GROUP ---
    this.birdGroup = this.physics.add.group();
    const createBird = () => {
      const myY = Phaser.Math.Between(100, 300);
      const bird = this.birdGroup
        .create(gameState.sceneWidth + 100, myY, "bird")
        .setScale(0.3);
      bird.setVelocityX(-100);
      bird.flipX = true;
      bird.setDepth(6);
      bird.setSize(bird.displayWidth - 10, bird.displayHeight - 10);
    };

    this.createAnimations("fly", "bird", 0, 4, -1, 7);

    this.birdCreationTime = this.time.addEvent({
      callback: createBird,
      delay: Phaser.Math.Between(2500, 5000),
      callbackScope: this,
      loop: true,
    });

    // --- COINS GROUP ---
    this.coinGroup = this.physics.add.group();
    this.physics.add.collider(this.coinGroup, this.groundGroup, (s) =>
      s.setVelocityX(-200)
    );
    this.physics.add.overlap(this.player, this.coinGroup, (player, s) => {
      this.pickCoin.play();
      s.destroy();
      gameState.score += 1;
      this.health += 1;
      this.scoreValue.setText(`${gameState.score}`);
      this.hoveringTextScore(player, "1+", "#0000ff");
    });
    this.time.addEvent({
      callback: () => this.createBirdDrop(this.coinGroup, "coin"),
      delay: 1000,
      callbackScope: this,
      loop: true,
    });

    // --- SPIKES GROUP ---
    this.spikeGroup = this.physics.add.group();
    this.physics.add.collider(this.spikeGroup, this.groundGroup, (s) =>
      s.setVelocityX(-200)
    );
    this.physics.add.overlap(this.player, this.spikeGroup, (player, s) => {
      this.spikeSound.play();
      s.destroy();
      this.health -= 15;
      this.hoveringTextScore(player, "Spiked!", "#CCCC00", "#800080");
    });
    this.time.addEvent({
      callback: () => this.createBirdDrop(this.spikeGroup, "spike"),
      delay: 5000,
      callbackScope: this,
      loop: true,
    });

    // --- MISSILES & EXPLOSION ---
    this.missileGroup = this.physics.add.group();

    // Setup Ledakan: Default Visible False agar tidak muncul di awal
    this.explosion = this.add
      .sprite(-100, -100, "explosion")
      .setScale(0.5)
      .setDepth(8)
      .setVisible(false);

    this.createAnimations("explode", "explosion", 0, 5, 0, 20);
    this.createAnimations("idle", "explosion", 5, 5, -1, 1);

    this.physics.add.collider(
      this.player,
      this.missileGroup,
      (player, missile) => {
        if (player.body.touching.down && missile.body.touching.up) {
          // Player menginjak missile (Kill)
          this.killMissile.play();
          player.setVelocityY(-300);
          missile.setVelocityY(300);
          this.missileScore += missile.y < 350 ? 0.5 : 0.25;
          this.hoveringTextScore(
            player,
            missile.y < 350 ? "+0.5" : "+0.25",
            "#00ff00"
          );
        } else {
          // Player kena tabrak missile (Damage)
          this.explodeSound.play();
          this.health -= missile.y < 350 ? 15 : 10;
          missile.destroy();
          player.setVelocityY(0);
          this.hoveringTextScore(player, "Damage", "#ff0000", "#ff0000");

          // --- LOGIKA LEDAKAN (FIXED) ---
          // 1. Pindahkan ke posisi player & Munculkan
          this.explosion.setPosition(player.x, player.y);
          this.explosion.setVisible(true);

          // 2. Mainkan animasi
          this.explosion.play("explode", true);

          // 3. Sembunyikan kembali setelah animasi selesai
          this.explosion.once(
            Phaser.Animations.Events.ANIMATION_COMPLETE,
            () => {
              this.explosion.setVisible(false);
            }
          );
        }
      }
    );

    // --- BOUNDS & CLEANUP ---
    this.leftBound = this.add
      .rectangle(-50, 0, 10, gameState.sceneHeight, 0x000000)
      .setOrigin(0);
    this.bottomBound = this.add
      .rectangle(0, gameState.sceneHeight, gameState.sceneWidth, 10, 0x000000)
      .setOrigin(0);
    this.boundGroup = this.physics.add.staticGroup();
    this.boundGroup.add(this.leftBound);
    this.boundGroup.add(this.bottomBound);

    const cleanUp = (obj) => obj.destroy();
    this.physics.add.collider(this.birdGroup, this.boundGroup, cleanUp);
    this.physics.add.collider(this.coinGroup, this.boundGroup, cleanUp);
    this.physics.add.collider(this.spikeGroup, this.boundGroup, cleanUp);
    this.physics.add.collider(this.missileGroup, this.boundGroup, cleanUp);

    // --- HEALTH TIMER ---
    this.time.addEvent({
      callback: () => {
        this.progressBar.clear();
        this.progressBar.fillStyle(0xffd700, 1);
        this.progressBar.fillRect(170, 95, this.health, 10);
        this.healthTimer = 0;
      },
      delay: 500,
      loop: true,
      callbackScope: this,
    });
  }

  // --- UTILITIES ---
  createAnimations(key, texture, start, end, repeat, rate) {
    return this.anims.create({
      key: key,
      frames: this.anims.generateFrameNumbers(texture, {
        start: start,
        end: end,
      }),
      frameRate: rate,
      repeat: repeat,
    });
  }

  addGameBackground() {
    this.add
      .image(gameState.sceneWidth / 2, gameState.sceneHeight / 2, "sky")
      .setScale(0.5);
    this.mountainGroup = this.add.group();
    this.firstMountain = this.mountainGroup
      .create(0, gameState.sceneHeight, "mountains")
      .setScale(0.5)
      .setOrigin(0, 1);
    this.mountainWidth = this.firstMountain.displayWidth;
    createPlatform(this.mountainGroup, this.mountainWidth, "mountains");
    this.plateauGroup = this.add.group();
    this.firstPlateau = this.plateauGroup
      .create(0, gameState.sceneHeight, "plateau")
      .setScale(0.5)
      .setOrigin(0, 1);
    this.plateauWidth = this.firstPlateau.displayWidth;
    createPlatform(this.plateauGroup, this.plateauWidth, "plateau");
    this.groundGroup = this.physics.add.group();
    this.first = this.groundGroup
      .create(0, this.scale.height, "ground")
      .setOrigin(0, 1)
      .setScale(0.5);
    this.first.setImmovable(true);
    this.groundWidth = this.first.displayWidth;
    this.groundHeight = this.first.displayHeight;
    this.first.setSize(this.groundWidth * 2, this.groundHeight - 50);
    createPlatform(this.groundGroup, this.groundWidth, "ground");
  }

  createBirdDrop(group, texture) {
    if (this.birdGroup.getLength() >= 2) {
      const child =
        this.birdGroup.getChildren()[
          Phaser.Math.Between(0, this.birdGroup.getLength() - 1)
        ];
      const drop = group.create(child.x, child.y, texture).setScale(0.05);
      if (texture === "spike") drop.setScale(0.1);
      drop.setGravityY(700).setGravityX(0).setDepth(6).setBounce(1);
      drop.setSize(drop.width - 200, drop.height - 200);
    }
  }

  createMissile(height, texture) {
    const missile = this.missileGroup.create(
      gameState.sceneWidth + 100,
      height,
      texture
    );
    missile.setScale(0.1).setDepth(6);
    missile.setSize(missile.width, missile.height - 300).setOffset(0, 150);
  }

  hoveringTextScore(player, message, strokeColor, fillColor = "#ffffff") {
    const text = this.add
      .text(player.x, player.y, message, {
        fontSize: "30px",
        fill: fillColor,
        fontFamily: '"Akaya Telivigala"',
        strokeThickness: 2,
        stroke: strokeColor,
      })
      .setDepth(7);
    this.tweens.add({
      targets: text,
      repeat: 0,
      duration: 1000,
      alpha: 0,
      y: text.y - 100,
      onComplete() {
        text.destroy();
      },
    });
  }

  createSoundEffect(key, vol, loop = false) {
    const e = this.sound.add(key, { loop });
    e.volume = vol;
    return e;
  }

  addSoundEffects() {
    this.pickCoin = this.createSoundEffect("pickCoin", 0.3);
    this.explodeSound = this.createSoundEffect("explosion", 0.4);
    this.killMissile = this.createSoundEffect("killMissile", 0.1);
    this.jumpSound = this.createSoundEffect("jumpSound", 0.05);
    this.spikeSound = this.createSoundEffect("spikeSound", 0.2);
  }

  // --- UPDATE LOOP ---
  update(time, delta) {
    moveBackgroundPlatform(
      this.mountainGroup,
      this.mountainWidth,
      "mountains",
      0.5
    );
    moveBackgroundPlatform(
      this.plateauGroup,
      this.plateauWidth,
      "plateau",
      1.5
    );
    moveBackgroundPlatform(this.groundGroup, this.groundWidth, "ground", 4);

    if (this.health <= 0) {
      const myUrl = `${fetchScoreData.apiUrl + fetchScoreData.apiKey}/scores`;
      fetchScoreData.postScores(myUrl, {
        user: gameState.playerName,
        score: gameState.score,
      });
      this.gameTheme.stop();
      this.scene.stop();
      this.scene.start("GameOver");
    }

    if (this.missileScore >= 1) {
      this.health += 1;
      this.missileScore -= 1;
    }

    this.birdGroup.children.iterate((c) => c.anims.play("fly", true));
    this.missileGroup.children.iterate((c) => (c.x -= 5));

    this.timer += delta;
    if (this.timer >= 5000) {
      this.createMissile(415, "missile");
      this.timer = 0;
    }
    this.secondTimer += delta;
    if (this.secondTimer >= 7000) {
      this.createMissile(300, "missile2");
      this.secondTimer = 0;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      if (
        this.player.body.touching.down ||
        (this.jump < this.jumpTimes && this.jump > 0)
      ) {
        this.player.setVelocityY(-400);
        this.jumpSound.play();
        if (this.player.body.touching.down) this.jump = 0;
        this.jump += 1;
      }
    }
    if (this.cursors.down.isDown && !this.player.body.touching.down)
      this.player.setGravityY(1300);
    if (this.player.body.touching.down) this.player.setGravityY(800);
  }
}

export default Game;

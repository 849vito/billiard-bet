
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const BALL_RADIUS = 10;
const TABLE_WIDTH = 800;
const TABLE_HEIGHT = 600;
const BALL_MASS = 0.2;
const PLAYER1 = 'Giocatore 1';
const PLAYER2 = 'Giocatore 2';

class BilliardGame extends Phaser.Scene {
  cueBall: Phaser.Physics.Arcade.Image;
  balls: Phaser.Physics.Arcade.Group;
  cue: Phaser.GameObjects.Image;
  pockets: Phaser.Geom.Circle[];
  currentPlayer: string;
  playerTypes: Record<string, string>;
  ballPocketedThisTurn: boolean;
  scoreText: Phaser.GameObjects.Text;
  startPointer: Phaser.Input.Pointer;
  
  constructor() {
    super('BilliardGame');
    this.playerTypes = {};
  }

  preload() {
    // Use base64 encoded images since we don't have the actual assets
    this.load.image('table', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    this.load.image('ball', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    this.load.image('cue', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  }

  create() {
    // Tavolo
    this.add.image(TABLE_WIDTH / 2, TABLE_HEIGHT / 2, 'table')
      .setDisplaySize(TABLE_WIDTH, TABLE_HEIGHT)
      .setTint(0x0a5c36); // Green felt color

    // Punteggio e turni
    this.currentPlayer = PLAYER1;
    this.ballPocketedThisTurn = false;
    this.scoreText = this.add.text(20, 20, '', { fontSize: '20px', fill: '#fff' });
    this.updateScoreText();

    // Palla bianca
    this.cueBall = this.physics.add.image(400, 400, 'ball');
    this.prepareBall(this.cueBall);
    this.cueBall.name = 'cue';
    this.cueBall.setTint(0xffffff); // White color

    // Altre palline
    this.balls = this.physics.add.group();
    this.createBallTriangle(500, 300);

    // Collisioni
    this.physics.add.collider(this.cueBall, this.balls);
    this.physics.add.collider(this.balls, this.balls);

    // Stecca
    this.cue = this.add.image(this.cueBall.x, this.cueBall.y, 'cue');
    this.cue.setOrigin(0, 0.5);
    this.cue.setDisplaySize(200, 10);
    this.cue.setTint(0xB86125); // Wood color
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.onPointerDown(pointer), this);
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.onPointerUp(pointer), this);

    // Buche (sistema semplice: zone nei bordi)
    this.pockets = [
      new Phaser.Geom.Circle(40, 40, 30),
      new Phaser.Geom.Circle(TABLE_WIDTH - 40, 40, 30),
      new Phaser.Geom.Circle(40, TABLE_HEIGHT - 40, 30),
      new Phaser.Geom.Circle(TABLE_WIDTH - 40, TABLE_HEIGHT - 40, 30),
      new Phaser.Geom.Circle(TABLE_WIDTH / 2, 30, 30),
      new Phaser.Geom.Circle(TABLE_WIDTH / 2, TABLE_HEIGHT - 30, 30)
    ];
    
    // Visualize pockets
    this.pockets.forEach(pocket => {
      this.add.circle(pocket.x, pocket.y, pocket.radius, 0x000000);
    });
  }

  prepareBall(ball: Phaser.Physics.Arcade.Image) {
    ball.setCircle(BALL_RADIUS);
    ball.setBounce(0.98);
    ball.setCollideWorldBounds(true);
    ball.setDamping(true);
    ball.setDrag(0.99);
    ball.setMass(BALL_MASS);
  }

  createBallTriangle(x: number, y: number) {
    const colors = [
      0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0000ff, 
      0x4b0082, 0x9400d3, 0xff0000, 0xff7700, 0xffff00, 
      0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3, 0x000000
    ];
    
    const offset = 22;
    let count = 1;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        const bx = x + row * offset;
        const by = y - (row * offset) / 2 + col * offset;
        const ball = this.physics.add.image(bx, by, 'ball');
        this.prepareBall(ball);
        ball.name = `ball${count}`;
        ball.setTint(colors[count - 1]); // Set ball color
        
        // Tag ball as solid or striped
        const ballData = ball as any;
        ballData.type = count % 2 === 0 ? 'rigata' : 'piena';
        
        this.balls.add(ball);
        count++;
      }
    }
  }

  onPointerDown(pointer: Phaser.Input.Pointer) {
    if (this.isBallMoving()) return;
    this.startPointer = pointer;
  }

  onPointerUp(pointer: Phaser.Input.Pointer) {
    if (this.isBallMoving() || !this.startPointer) return;
    const dx = this.startPointer.x - pointer.x;
    const dy = this.startPointer.y - pointer.y;
    this.cueBall.setVelocity(dx * 0.5, dy * 0.5);
    this.ballPocketedThisTurn = false;
  }

  isBallMoving() {
    const balls = this.balls.getChildren();
    for (let b of balls) {
      const ball = b as Phaser.Physics.Arcade.Image;
      if (ball.body.speed > 1) return true;
    }
    return this.cueBall.body.speed > 1;
  }

  update() {
    if (!this.isBallMoving()) {
      this.checkPockets();
      const pointer = this.input.activePointer;
      const angle = Phaser.Math.Angle.Between(
        this.cueBall.x,
        this.cueBall.y,
        pointer.x,
        pointer.y
      );
      this.cue.setPosition(this.cueBall.x, this.cueBall.y);
      this.cue.setRotation(angle);
      this.cue.setVisible(true);
    } else {
      this.cue.setVisible(false);
    }
  }

  checkPockets() {
    const ballsToRemove: Phaser.Physics.Arcade.Image[] = [];
    const allBalls = [...this.balls.getChildren(), this.cueBall] as Phaser.Physics.Arcade.Image[];
    
    for (let ball of allBalls) {
      for (let pocket of this.pockets) {
        if (Phaser.Geom.Circle.ContainsPoint(pocket, ball)) {
          ballsToRemove.push(ball);
          if (ball.name === 'cue') {
            this.resetCueBall();
          } else {
            const ballData = ball as any;
            if (!this.playerTypes[this.currentPlayer]) {
              this.playerTypes[this.currentPlayer] = ballData.type;
              this.playerTypes[this.getOpponent()] = ballData.type === 'piena' ? 'rigata' : 'piena';
            }
            if (this.playerTypes[this.currentPlayer] === ballData.type) {
              this.ballPocketedThisTurn = true;
            }
          }
        }
      }
    }

    for (let ball of ballsToRemove) {
      if (ball !== this.cueBall) ball.destroy();
    }

    if (!this.isBallMoving() && ballsToRemove.length > 0) {
      this.updateScoreText();
      if (!this.ballPocketedThisTurn) this.switchPlayer();
    }
  }

  resetCueBall() {
    this.cueBall.setPosition(400, 400);
    this.cueBall.setVelocity(0, 0);
  }

  getOpponent() {
    return this.currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
  }

  switchPlayer() {
    this.currentPlayer = this.getOpponent();
    this.updateScoreText();
  }

  updateScoreText() {
    this.scoreText.setText(`Turno: ${this.currentPlayer}\n${PLAYER1}: ${this.playerTypes[PLAYER1] || '?'}\n${PLAYER2}: ${this.playerTypes[PLAYER2] || '?'}`);
  }
}

interface PhaserBilliardGameProps {
  resetKey?: number;
}

const PhaserBilliardGame = ({ resetKey = 0 }: PhaserBilliardGameProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Make sure we have a valid container before creating the game
    if (!gameContainerRef.current) return;
    
    // Clean up any existing game instance
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
    
    // Create a new game instance
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: TABLE_WIDTH,
      height: TABLE_HEIGHT,
      backgroundColor: '#1d1d1d',
      parent: gameContainerRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: BilliardGame
    };
    
    gameRef.current = new Phaser.Game(config);
    
    // Cleanup on component unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [resetKey]); // Recreate game when resetKey changes
  
  return (
    <div className="rounded-lg overflow-hidden shadow-lg mx-auto">
      <div ref={gameContainerRef} className="aspect-video w-full max-w-4xl" />
    </div>
  );
};

export default PhaserBilliardGame;

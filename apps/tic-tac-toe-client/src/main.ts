import Phaser from "phaser";
import { LobbyScene } from "./scenes/LobbyScene";
import { GameScene } from "./scenes/GameScene";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 },
        }
    },
    backgroundColor: '#4CAF50',
    scene: [LobbyScene, GameScene]
} as Phaser.Types.Core.GameConfig;

const game = new Phaser.Game(config);
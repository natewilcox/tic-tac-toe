import Phaser from "phaser";
import * as data from "./version.json";
import * as Nathan from "@natewilcox/phaser-nathan";
import { GameScene } from "./scenes/GameScene";
import { addBuildInfo } from "@natewilcox/version-meta";

// adds build info to the window object
addBuildInfo(data);

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
    backgroundColor: '#4CAF50'
} as Phaser.Types.Core.GameConfig;

const game = new Phaser.Game(config);
game.scene.add('menu', Nathan.BasicMenuScene, false);
game.scene.add('game', GameScene, false);

const menuConfig: Nathan.BasicMenuSceneConfig = {
    title: 'TIC TAC TOE',
    subTitle: 'SELECT MODE:',
    menuItems: [{
        name: 'CPU',
        options: {
            online: false,
        }
    },
    {
        name: 'PLAYER',
        options: {
            online: true,
        }
    },
    {
        name: 'INVITE',
        options: {
            online: true,
            invite: true
        },
        mobileOnly: true
    }],
    oncreated: (scene: Nathan.Scene) => {

        //add resize listener when scene is created
        Nathan.resizeToScreen(scene, true, 800, 800);
    }
};

//start menu with configured menu items
game.scene.start('menu', menuConfig);
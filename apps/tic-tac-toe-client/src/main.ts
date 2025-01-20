import Phaser from "phaser";
import * as data from "./version.json";
import { GameScene } from "./scenes/GameScene";
import { addBuildInfo } from "@natewilcox/version-meta";
import { BasicMenuScene } from "./scenes/BasicMenuScene";
import { BasicMenuSceneConfig } from "./types/BasicMenuSceneConfig";
import { Scene } from "./scenes/Scene";
import { resizeToScreen } from "./utils/SceneUtils";
import { requestPermissionForNotification } from "./utils/NotificationUtils";

// adds build info to the window object
addBuildInfo(data);
requestPermissionForNotification();

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
game.scene.add('menu', BasicMenuScene, false);
game.scene.add('game', GameScene, false);

const menuConfig: BasicMenuSceneConfig = {
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
    }],
    oncreated: (scene: Scene) => {

        //add resize listener when scene is created
        resizeToScreen(scene, true, 800, 800);
    }
};

//start menu with configured menu items
game.scene.start('menu', menuConfig);

async function unregisterServiceWorker() {

    const existingRegistration = await navigator.serviceWorker.getRegistration();
  
    if (existingRegistration) {
        console.log('Service worker already registered with scope:', existingRegistration.scope);
        await existingRegistration.unregister();
        console.log('ServiceWorker unregistered successful');
    } 
    else {
        console.log('Service worker not registered');
    }
}

async function registerServiceWorker() {

    const existingRegistration = await navigator.serviceWorker.getRegistration();
  
    if (existingRegistration) {
        console.log('Service worker already registered with scope:', existingRegistration.scope);
    } 
    else {
        const serviceWorkerUrl = new URL('../public/js/service-worker.js', import.meta.url);
        const registration = await navigator.serviceWorker.register(serviceWorkerUrl.href, { type: 'module' });
        console.log('ServiceWorker registrated successful with scope: ', registration.scope);
    }
}

unregisterServiceWorker().then(() => registerServiceWorker());
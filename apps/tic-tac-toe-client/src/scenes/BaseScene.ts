import { Scene } from "@natewilcox/phaser-nathan";

export class BaseScene extends Scene
{
    DEFAULT_HEIGHT = 600;
    DEFAULT_WIDTH = 800;

    get isMobile() {
        return 'contacts' in navigator;
    }

    get gameWidth() {

        const mediaQuery = window.matchMedia("(max-width: 768px)");  
        const fullDeviceSize = this.scale.isFullscreen || mediaQuery.matches;
        const width = Math.min(window.innerWidth, this.DEFAULT_WIDTH);

        return width;
    }

    get gameHeight() {

        const mediaQuery = window.matchMedia("(max-width: 768px)");  
        const fullDeviceSize = this.scale.isFullscreen || mediaQuery.matches;
        const height = Math.min(window.innerHeight, this.DEFAULT_HEIGHT);

        return height;
    }

    addImage(x: number, y: number, frame: string, cb?: () => void) {

        const img = this.add.image(x, y, frame);
        img.setScale(0.5, 0.5);
        img.setOrigin(0.5);

        if(cb) {
            img.setInteractive();
            img.on('pointerdown', cb);
        }

        return img;
    }

    addText(x: number, y: number, txt: string, size: string, color: string, cb?: () => void) {

        const gameText = this.add.text(x, y, txt, {
            fontSize: size,
            fontFamily: 'Arial',
            color: color,
            align: 'center'
        });

        gameText.setOrigin(0.5);

        if(cb) {
            gameText.setInteractive();
            gameText.on('pointerdown', cb);
        }

        return gameText;
    }
}
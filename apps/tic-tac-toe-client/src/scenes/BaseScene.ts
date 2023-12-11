import { Scene } from "@natewilcox/phaser-nathan";

export class BaseScene extends Scene
{
    DEFAULT_HEIGHT = 800;
    DEFAULT_WIDTH = 800;

    get isMobile() {
        return 'contacts' in navigator;
    }
    
    configureResize(scene: Scene) {

        const resize = () => {
            scene.setScreenSize(Math.min(this.DEFAULT_WIDTH, window.screen.width), Math.min(this.DEFAULT_HEIGHT, window.screen.height));
        }
    
        window.addEventListener('resize', resize);
        console.log(window.screen.width, this.scale.width)

        //if the screen size is different than the scale size, resize
        if(window.screen.width != this.scale.width || window.screen.height != this.scale.height) {
            resize();
        }
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
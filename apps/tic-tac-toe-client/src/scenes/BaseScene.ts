import { Scene } from "@natewilcox/phaser-nathan";

export class BaseScene extends Scene
{
    DEFAULT_HEIGHT = 800;
    DEFAULT_WIDTH = 800;

    create() {
        super.create();
    }
    
    get isMobile() {
        return 'contacts' in navigator;
    }
    
    configureResize(scene: Scene) {

        const resize = () => {
            scene.setScreenSize(Math.min(this.DEFAULT_WIDTH, window.innerWidth), Math.min(this.DEFAULT_HEIGHT, window.innerHeight));
        }
    
        window.addEventListener('resize', () => {
            resize();
        });
   
        //if the screen size is different than the scale size, resize
        if(window.innerWidth != this.scale.width || window.innerWidth != this.scale.height) {
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
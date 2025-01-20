import { Scene } from "../scenes/Scene";

export function resizeToScreen(scene: Scene, addListener?: boolean, maxWidth? : number, maxHeight? : number) {

    const resize = () => {
        scene.setScreenSize(Math.min(maxWidth, document.documentElement.clientWidth), Math.min(maxHeight, document.documentElement.clientHeight));
    }

    if(addListener) {
        window.addEventListener('resize', resize);
    }

    //if the screen size is different than the scale size, resize
    if(window.innerWidth != scene.scale.width || window.innerWidth != scene.scale.height) {
        resize();
    }
}

export function addText(scene: Scene, txt: string, x: number, y: number, config?: any, cb?: () => void) {

    const gameText = scene.add.text(x, y, txt, {
        fontSize: config.size || '32px',
        fontFamily: config.font || 'Arial',
        color: config.color || '#ffffff',
        align: config.align || 'center'
    })
    .setOrigin(config.origin || config.originX || 0.5, config.origin || config.originY || 0.5);

    if(cb) {
        gameText.setInteractive();
        gameText.on('pointerdown', cb);
    }

    return gameText;
}

export function addImage(scene: Scene, frame: string, x: number, y: number, config?: any, cb?: () => void) {

    const image = scene.add.image(x, y, frame);
    image.setScale(config.scale || 1);
    image.setOrigin(config.origin || config.originX || 0.5, config.origin || config.originY || 0.5);

    if(cb) {
        image.setInteractive();
        image.on('pointerdown', cb);
    }

    return image;
}

export function sendSMSInvite(url: string, roomId: string) {
    
    const inviteUrl = `${url}?invite=${roomId}`;
    var smsUri = 'sms:?body=' + encodeURIComponent(`I challenge you at ${inviteUrl}`);

    // Open the messaging app with the default message
    window.open(smsUri, '_blank');
}
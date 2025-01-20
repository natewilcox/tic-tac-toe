import Phaser from "phaser";

export const GAME_EVENT_EMMITER = new Phaser.Events.EventEmitter();

export enum GameEvents {
    OnResizing = 'onresizing',
    OnResized = 'onresized',
    OnFullScreen = 'onfullscreen',
    OnStopFullScreen = 'onstopfullscreen'
}

export class Scene extends Phaser.Scene {
 
    get isMobile() {
        return 'contacts' in navigator;
    }
    
    create() {

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            GAME_EVENT_EMMITER.destroy();
        })
    }

    setScreenSize(width: number, height: number, cssWidth?: number, cssHeight?: number) {

        GAME_EVENT_EMMITER.emit(GameEvents.OnResizing);
    
        // Set screen resolution
        this.game.canvas.width = width;
        this.game.canvas.height = height;
    
        // If cssWidth and cssHeight are not provided, use width and height
        cssWidth = cssWidth || width;
        cssHeight = cssHeight || height;
    
        // Set CSS size
        this.game.canvas.style.width = cssWidth + 'px';
        this.game.canvas.style.height = cssHeight + 'px';
    
        console.info(`resizing to ${width}x${height}`);
        this.game.renderer.resize(width, height);
        this.scale.resize(width, height);
        this.scale.refresh();
        
        GAME_EVENT_EMMITER.emit(GameEvents.OnResized);
    }

    toggleFullscreen = () => {

        if(!this.scale.isFullscreen) {

            this.scale.startFullscreen();
            GAME_EVENT_EMMITER.emit(GameEvents.OnFullScreen);
        }
        else {
            this.scale.stopFullscreen();
            GAME_EVENT_EMMITER.emit(GameEvents.OnStopFullScreen);
        }
    }

    onScreenResizing(cb: () => void) {
        GAME_EVENT_EMMITER.on(GameEvents.OnResizing, cb)
    }

    onScreenResized(cb: () => void) {
        GAME_EVENT_EMMITER.on(GameEvents.OnResized, cb)
    }

    onFullscreen(cb: () => void) {
        GAME_EVENT_EMMITER.on(GameEvents.OnFullScreen, cb)
    }

    onStopFullscreen(cb: () => void) {
        GAME_EVENT_EMMITER.on(GameEvents.OnStopFullScreen, cb)
    }
}
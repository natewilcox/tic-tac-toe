import { BaseScene } from "./BaseScene";

export class LobbyScene extends BaseScene
{
    titleText: Phaser.GameObjects.Text;
    instructionsText: Phaser.GameObjects.Text;
    playerText: Phaser.GameObjects.Text;
    cpuText: Phaser.GameObjects.Text;
    inviteText: Phaser.GameObjects.Text;
    fullscreen: Phaser.GameObjects.Image;  

    constructor () {
        super('lobby');
    }

    async preload() {
        this.load.image("rematch", "images/rematch.png");
        this.load.image("full-screen", "images/full-screen.png");
    }

    create() {
        super.create();
        this.configureResize(this);
        
        //check if an invite code is in url
        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get('invite');

        if(inviteCode) {
            
            //remove from search params and remove from history
            urlParams.delete('invite');
            const newURL = window.location.pathname + '?' + urlParams.toString();
            window.history.replaceState({}, document.title, newURL);

            this.redeedInvite(inviteCode);
        }

        this.onScreenResized(() => {
            this.printWelcomeScreen()
        });

        this.printWelcomeScreen();
    }

    private playOnline = () => {
        console.log("playing online");

        this.scene.stop('lobby');
        this.scene.launch('game', {
            online: true
        });
    }

    private playCpu = () => {
        console.log("playing cpu");

        this.scene.stop('lobby');
        this.scene.launch('game', {
            online: false
        });
    }

    private invitePlayer = () => {
        console.log("invite player");

        this.scene.stop('lobby');
        this.scene.launch('game', {
            online: true,
            invite: true
        });
    }

    private redeedInvite = (inviteCode: string) => {
        console.log(`redeem invite=${inviteCode}`);

        this.scene.stop('lobby');
        this.scene.launch('game', {
            online: true,
            inviteCode: inviteCode
        });
    };

    private printWelcomeScreen = () => {

        console.log("drawing menu")
        const scale = this.cameras.main.height / 800;
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        if(this.titleText) {
            this.titleText.destroy();
        }

        this.titleText = this.add.text(centerX, 50 * scale, 'TIC TAC TOE', {
            fontFamily: 'Arial',
            fontSize: `${50 * scale}px`,
            align: 'center' ,
        }).setOrigin(0.5, 0);

        if(this.instructionsText) {
            this.instructionsText.destroy();
        }

        this.instructionsText = this.add.text(centerX, centerY- (75*scale), 'SELECT MODE:', {
            fontFamily: 'Arial',
            fontSize: `${30 * scale}px`,
            align: 'center' ,
        }).setOrigin(0.5, 0);


        if(this.cpuText) {
            this.cpuText.destroy();
            this.cpuText.off('pointerdown')
        }

        this.cpuText = this.add.text(centerX, centerY, 'CPU', {
            fontFamily: 'Arial',
            fontSize: `${60 * scale}px`,
            align: 'center' ,
        }).setOrigin(0.5, 0);
        this.cpuText.setInteractive();
        this.cpuText.on('pointerdown', this.playCpu);

        if(this.playerText) {
            this.playerText.destroy();
            this.playerText.off('pointerdown');
        }

        this.playerText = this.add.text(centerX, centerY + (75*scale), 'Player', {
            fontFamily: 'Arial',
            fontSize: `${60 * scale}px`,
            align: 'center' ,
        }).setOrigin(0.5, 0);
        this.playerText.setInteractive();
        this.playerText.on('pointerdown', this.playOnline);

        if(this.inviteText?.active) {
            this.inviteText.destroy();
            this.inviteText.off('pointerdown');
        }

        this.inviteText = this.add.text(centerX, centerY + (150*scale), 'Invite', {
            fontFamily: 'Arial',
            fontSize: `${60 * scale}px`,
            align: 'center' ,
        }).setOrigin(0.5, 0);
        this.inviteText.setInteractive();
        this.inviteText.on('pointerdown', this.invitePlayer);

        if(!('contacts' in navigator)) {
           this.inviteText.setVisible(false);
        }

        if(this.fullscreen) {
            this.fullscreen.destroy();
            this.fullscreen.off("pointerdown");
        }
        
        this.fullscreen = this.addImage(this.cameras.main.width-25, 20, 'full-screen', this.toggleFullscreen);
        this.fullscreen.setScale(0.25, 0.25);
        this.fullscreen.setVisible(this.isMobile);
        this.fullscreen.setAlpha(0.4);
    }
}
import { BasicMenuSceneConfig } from "../types/BasicMenuSceneConfig";
import { MenuOptionConfig } from "../types/MenuOptionConfig";
import { Scene } from "./Scene";

export class BasicMenuScene extends Scene
{
    titleText: Phaser.GameObjects.Text;
    subTitleText: Phaser.GameObjects.Text;
    menuItems: Phaser.GameObjects.Text[] = [];

    // Scene to start when a menu item is selected
    nextScene: string;

    constructor () {
        super('menu');
    }

    create(config?: BasicMenuSceneConfig) {

        super.create();

        // Call the oncreated callback if it exists
        if(config.oncreate) {
            config.oncreate(this);
        }

        this.nextScene = config.nextScene || 'game';

        const inviteCode = this.getInviteCode();
        if(inviteCode) {
            this.redeedInvite(inviteCode);
        }

        this.onScreenResized(() => {
            this.displayMenu(config.title, config.subTitle, config.menuItems);
        });

        this.displayMenu(config.title, config.subTitle, config.menuItems);

        // Call the oncreated callback if it exists
        if(config.oncreated) {
            config.oncreated(this);
        }
    }

    private getInviteCode = () => { 

        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get('invite');
        
        urlParams.delete('invite');
        const newURL = window.location.pathname + '?' + urlParams.toString();
        window.history.replaceState({}, document.title, newURL);

        return inviteCode;
    }

    private redeedInvite = (inviteCode: string) => {
        console.log(`redeem invite=${inviteCode}`);

        this.scene.stop('lobby');
        this.scene.launch('game', {
            online: true,
            inviteCode: inviteCode
        });
    };

    private menuItemSelected = (options: any) => {
        console.log(options);
        this.scene.stop('menu');
        this.scene.launch('game', options);
    }

    private displayMenu = (title: string, subtitle: string, menuItemConfigs: MenuOptionConfig[]) => {

        const scale = this.cameras.main.height / 800;
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        if(this.titleText) {
            this.titleText.destroy();
        }

        this.titleText = this.add.text(centerX, 50 * scale, title, {
            fontFamily: 'Arial',
            fontSize: `${50 * scale}px`,
            align: 'center' ,
        }).setOrigin(0.5, 0);

        if(this.subTitleText) {
            this.subTitleText.destroy();
        }

        this.subTitleText = this.add.text(centerX, centerY- (75*scale), subtitle, {
            fontFamily: 'Arial',
            fontSize: `${30 * scale}px`,
            align: 'center' ,
        }).setOrigin(0.5, 0);

        // Destroy old options
        for(let menuItem of this.menuItems) {
            menuItem.destroy();
            menuItem.off('pointerdown');
        }

        let optionVerticalOffset = 0;

        // Create new options
        for(let menuItemConfig of menuItemConfigs) {
            this.menuItems.push(this.createMenuItem(menuItemConfig, centerX, centerY + (optionVerticalOffset*scale), 60 * scale));
            optionVerticalOffset+=75;
        }
    }

    private createMenuItem(menuItemConfig: MenuOptionConfig, x: number, y: number, size: number) {

        const menuItem = this.add.text(x, y, menuItemConfig.name, {
            fontFamily: 'Arial',
            fontSize: `${size}px`,
            align: 'center' ,
        })
        .setOrigin(0.5, 0)
        .setInteractive()
        .on('pointerdown', this.menuItemSelected.bind(this, menuItemConfig.options))
        .setVisible(menuItemConfig.mobileOnly ? this.isMobile : true);

        return menuItem;
    }
}
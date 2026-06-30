import { KEYS, SCENES } from '../config/constants.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.MENU });
        this.menuWidgets = [];
    }

    create() {
        this.scene.launch('MenuDemoScene');
        this.scene.bringToTop();

        this.scale.on('resize', this.handleResize, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off('resize', this.handleResize, this);
            this.scene.stop('MenuDemoScene');
        });

        this.buildMenu();
        this.handleResize({ width: this.scale.width, height: this.scale.height });
    }

    buildMenu() {
        const buttons = [
            this.createMenuButton(KEYS.UI_MENU_PLAY, KEYS.UI_MENU_PLAY_PRESSED, 'Jogar', () => {
                this.scene.stop('MenuDemoScene');
                this.scene.start(SCENES.LEVEL1);
            })
        ];

        this.menuWidgets = [...buttons.map((button) => button.sprite)];
        this.buttons = buttons;

        this.copyrightText = this.add.text(0, 0, '© Todos os direitos reservados.\nGabriel Cesar, Igor Moura, Ciro Moraes', {
            fontFamily: 'Courier, monospace',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 1).setAlpha(0.8);
    }

    createMenuButton(defaultKey, pressedKey, label, onClick) {
        const sprite = this.add.image(0, 0, defaultKey)
            .setOrigin(0.5)
            .setScale(4)
            .setInteractive({ useHandCursor: false });

        sprite.on('pointerdown', () => {
            sprite.setTexture(pressedKey);
        });

        sprite.on('pointerup', () => {
            sprite.setTexture(defaultKey);
            onClick();
        });

        sprite.on('pointerout', () => {
            sprite.setTexture(defaultKey);
        });

        return { sprite, defaultKey, pressedKey, label };
    }

    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        const centerX = width / 2;
        const centerY = height / 2;

        this.buttons.forEach((button, index) => {
            button.sprite.setPosition(centerX, centerY + (index * 62));
        });

        if (this.copyrightText) {
            this.copyrightText.setPosition(centerX, height - 20);
        }
    }
}

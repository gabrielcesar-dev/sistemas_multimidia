import { KEYS, SCENES } from '../config/constants.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.MENU });
        this.menuWidgets = [];
    }

    create() {
        this.cameras.main.setBackgroundColor('#131313');
        this.scale.on('resize', this.handleResize, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off('resize', this.handleResize, this);
        });

        this.buildMenu();
        this.handleResize({ width: this.scale.width, height: this.scale.height });
    }

    buildMenu() {
        const title = this.add.text(0, 0, 'SISTEMAS MULTIMIDIA', {
            fontFamily: 'Georgia',
            fontSize: '34px',
            color: '#f2e7c9',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        const subtitle = this.add.text(0, 0, 'Tela de Inicio', {
            fontFamily: 'Georgia',
            fontSize: '16px',
            color: '#d6c6a5'
        }).setOrigin(0.5);

        const panel = this.add.rectangle(0, 0, 340, 300, 0x201910, 0.82)
            .setStrokeStyle(3, 0xc2a36a, 1);

        const statusText = this.add.text(0, 0, 'Escolha uma opcao', {
            fontFamily: 'Georgia',
            fontSize: '14px',
            color: '#f2e7c9',
            align: 'center'
        }).setOrigin(0.5);

        const buttons = [
            this.createMenuButton(KEYS.UI_MENU_PLAY, KEYS.UI_MENU_PLAY_PRESSED, 'Jogar', () => {
                this.scene.start(SCENES.CHARACTER_SELECT);
            }),
            this.createMenuButton(KEYS.UI_MENU_LOAD, KEYS.UI_MENU_LOAD_PRESSED, 'Load', () => {
                statusText.setText('Load ainda nao foi implementado');
            }),
            this.createMenuButton(KEYS.UI_MENU_SETTINGS, KEYS.UI_MENU_SETTINGS_PRESSED, 'Settings', () => {
                statusText.setText('Settings ainda nao foi implementado');
            }),
            this.createMenuButton(KEYS.UI_MENU_QUIT, KEYS.UI_MENU_QUIT_PRESSED, 'Sair', () => {
                statusText.setText('Feche a aba/janela para sair');
            })
        ];

        const cursor = this.add.image(0, 0, KEYS.UI_MENU_CURSOR)
            .setOrigin(0.5)
            .setScale(3)
            .setVisible(false);

        buttons.forEach((button) => {
            button.sprite.on('pointerover', () => {
                cursor.setVisible(true);
                cursor.setPosition(button.sprite.x - (button.sprite.displayWidth / 2) - 18, button.sprite.y);
            });
            button.sprite.on('pointerout', () => {
                cursor.setVisible(false);
            });
        });

        this.menuWidgets = [title, subtitle, panel, statusText, cursor, ...buttons.map((button) => button.sprite)];
        this.titleText = title;
        this.subtitleText = subtitle;
        this.panel = panel;
        this.statusText = statusText;
        this.cursor = cursor;
        this.buttons = buttons;
    }

    createMenuButton(defaultKey, pressedKey, label, onClick) {
        const sprite = this.add.image(0, 0, defaultKey)
            .setOrigin(0.5)
            .setScale(4)
            .setInteractive({ useHandCursor: true });

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

        sprite.on('pointerover', () => {
            this.statusText.setText(label);
        });

        return { sprite, defaultKey, pressedKey, label };
    }

    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        const centerX = width / 2;
        const centerY = height / 2;

        this.titleText.setPosition(centerX, centerY - 170);
        this.subtitleText.setPosition(centerX, centerY - 135);
        this.panel.setPosition(centerX, centerY - 5);
        this.statusText.setPosition(centerX, centerY + 145);

        const startY = centerY - 70;
        const gap = 62;

        this.buttons.forEach((button, index) => {
            button.sprite.setPosition(centerX, startY + (index * gap));
        });

        this.cursor.setVisible(false);
    }
}

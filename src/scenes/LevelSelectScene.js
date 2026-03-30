import { SCENES } from '../config/constants.js';

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.LEVEL_SELECT });
    }

    create() {
        this.cameras.main.setBackgroundColor('#15120f');
        this.scale.on('resize', this.handleResize, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off('resize', this.handleResize, this);
        });

        this.buildUI();
        this.handleResize({ width: this.scale.width, height: this.scale.height });
    }

    buildUI() {
        this.titleText = this.add.text(0, 0, 'Escolha a Fase', {
            fontFamily: 'Georgia',
            fontSize: '30px',
            color: '#f2e7c9',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.subtitleText = this.add.text(0, 0, 'Selecione para onde ir', {
            fontFamily: 'Georgia',
            fontSize: '16px',
            color: '#d7c4a0'
        }).setOrigin(0.5);

        this.level1Card = this.createLevelCard('Level 1', 'Ambiente natural', 0x2d4e2f, () => {
            this.scene.start(SCENES.LEVEL1);
        });

        this.level2Card = this.createLevelCard('Level 2', 'Ambiente sombrio', 0x4a3124, () => {
            this.scene.start(SCENES.LEVEL2);
        });

        this.backButton = this.createActionButton('Voltar', () => {
            this.scene.start(SCENES.CHARACTER_SELECT);
        });
    }

    createLevelCard(title, description, previewColor, onClick) {
        const container = this.add.container(0, 0);
        const bg = this.add.rectangle(0, 0, 260, 240, 0x231b13, 0.95)
            .setStrokeStyle(3, 0xc7a970, 1)
            .setInteractive({ useHandCursor: true });
        const preview = this.add.rectangle(0, -32, 180, 94, previewColor, 1)
            .setStrokeStyle(2, 0xf2e7c9, 0.85)
            .setInteractive({ useHandCursor: true });
        const titleText = this.add.text(0, 54, title, {
            fontFamily: 'Georgia',
            fontSize: '24px',
            color: '#fff0d3'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const descriptionText = this.add.text(0, 92, description, {
            fontFamily: 'Georgia',
            fontSize: '14px',
            color: '#d7c4a0'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const hoverOn = () => bg.setFillStyle(0x312519, 0.98);
        const hoverOff = () => bg.setFillStyle(0x231b13, 0.95);

        [bg, preview, titleText, descriptionText].forEach((item) => {
            item.on('pointerover', hoverOn);
            item.on('pointerout', hoverOff);
            item.on('pointerdown', onClick);
        });

        container.add([bg, preview, titleText, descriptionText]);
        return { container };
    }

    createActionButton(label, onClick) {
        const bg = this.add.rectangle(0, 0, 180, 44, 0x4b3924, 1)
            .setStrokeStyle(2, 0xd7b47b, 1)
            .setInteractive({ useHandCursor: true });
        const text = this.add.text(0, 0, label, {
            fontFamily: 'Georgia',
            fontSize: '18px',
            color: '#fff4dd'
        }).setOrigin(0.5);

        bg.on('pointerover', () => bg.setFillStyle(0x6a5030, 1));
        bg.on('pointerout', () => bg.setFillStyle(0x4b3924, 1));
        bg.on('pointerdown', () => bg.setFillStyle(0x8a6942, 1));
        bg.on('pointerup', () => {
            bg.setFillStyle(0x6a5030, 1);
            onClick();
        });

        return { bg, text };
    }

    handleResize(gameSize) {
        const centerX = gameSize.width / 2;
        const centerY = gameSize.height / 2;

        this.titleText.setPosition(centerX, centerY - 210);
        this.subtitleText.setPosition(centerX, centerY - 175);
        this.level1Card.container.setPosition(centerX - 170, centerY - 8);
        this.level2Card.container.setPosition(centerX + 170, centerY - 8);
        this.backButton.bg.setPosition(centerX, centerY + 190);
        this.backButton.text.setPosition(centerX, centerY + 190);
    }
}

import { KEYS, SCENES } from '../config/constants.js';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.CHARACTER_SELECT });
    }

    create() {
        this.cameras.main.setBackgroundColor('#12100d');
        this.scale.on('resize', this.handleResize, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off('resize', this.handleResize, this);
        });

        this.selectedType = this.registry.get('selectedPlayerType') || 'main';
        this.buildUI();
        this.handleResize({ width: this.scale.width, height: this.scale.height });
        this.refreshSelectionState();
    }

    buildUI() {
        this.titleText = this.add.text(0, 0, 'Escolha Seu Personagem', {
            fontFamily: 'Georgia',
            fontSize: '30px',
            color: '#f2e7c9',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.subtitleText = this.add.text(0, 0, 'Selecione um dos 2 personagens para iniciar', {
            fontFamily: 'Georgia',
            fontSize: '16px',
            color: '#d7c4a0'
        }).setOrigin(0.5);

        this.mainCard = this.createCharacterCard({
            title: 'Main',
            description: 'Personagem novo',
            texture: KEYS.PLAYER_MAIN_IDLE_DOWN,
            frame: 0,
            scale: 7,
            onClick: () => this.selectCharacter('main')
        });
        this.mainCard.preview.play('anim_player_main_idle_down');

        this.soldierCard = this.createCharacterCard({
            title: 'Soldier',
            description: 'Personagem antigo',
            texture: KEYS.PLAYER_SOLDIER_IDLE,
            frame: 0,
            scale: 1.9,
            onClick: () => this.selectCharacter('soldier')
        });
        this.soldierCard.preview.play('anim_player_soldier_idle');

        this.confirmButton = this.createActionButton('Jogar', () => {
            this.registry.set('selectedPlayerType', this.selectedType);
            this.scene.start(SCENES.LEVEL1);
        });

        this.backButton = this.createActionButton('Voltar', () => {
            this.scene.start(SCENES.MENU);
        });
    }

    createCharacterCard({ title, description, texture, frame, scale, onClick }) {
        const container = this.add.container(0, 0);
        const bg = this.add.rectangle(0, 0, 230, 280, 0x231b13, 0.95)
            .setStrokeStyle(3, 0x7f6540, 1)
            .setInteractive({ useHandCursor: true });
        const titleText = this.add.text(0, -110, title, {
            fontFamily: 'Georgia',
            fontSize: '22px',
            color: '#f7ead0'
        }).setOrigin(0.5);
        const preview = this.add.sprite(0, -10, texture, frame).setScale(scale);
        const descriptionText = this.add.text(0, 95, description, {
            fontFamily: 'Georgia',
            fontSize: '14px',
            color: '#d5c19b'
        }).setOrigin(0.5);

        bg.on('pointerdown', onClick);
        preview.setInteractive({ useHandCursor: true }).on('pointerdown', onClick);
        titleText.setInteractive({ useHandCursor: true }).on('pointerdown', onClick);
        descriptionText.setInteractive({ useHandCursor: true }).on('pointerdown', onClick);

        container.add([bg, titleText, preview, descriptionText]);

        return { container, bg, titleText, preview, descriptionText };
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

    selectCharacter(type) {
        this.selectedType = type;
        this.refreshSelectionState();
    }

    refreshSelectionState() {
        const activeStroke = 0xe2bf7d;
        const inactiveStroke = 0x7f6540;

        this.mainCard.bg.setStrokeStyle(4, this.selectedType === 'main' ? activeStroke : inactiveStroke, 1);
        this.soldierCard.bg.setStrokeStyle(4, this.selectedType === 'soldier' ? activeStroke : inactiveStroke, 1);
    }

    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        const centerX = width / 2;
        const centerY = height / 2;

        this.titleText.setPosition(centerX, centerY - 230);
        this.subtitleText.setPosition(centerX, centerY - 195);

        this.mainCard.container.setPosition(centerX - 150, centerY - 20);
        this.soldierCard.container.setPosition(centerX + 150, centerY - 20);

        this.confirmButton.bg.setPosition(centerX + 100, centerY + 190);
        this.confirmButton.text.setPosition(centerX + 100, centerY + 190);
        this.backButton.bg.setPosition(centerX - 100, centerY + 190);
        this.backButton.text.setPosition(centerX - 100, centerY + 190);
    }
}

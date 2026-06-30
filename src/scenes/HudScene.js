import { KEYS, SCENES } from '../config/constants.js';

export default class HudScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.HUD || 'HudScene' });
    }

    init(data) {
        this.levelScene = data.levelScene;
    }

    create() {
        this.createGameHud();
        this.createPauseMenu();
        this.createInfoMenu();
        this.createGameOverMenu();

        // Bind events from active level scene
        if (this.levelScene) {
            this.levelScene.events.on('hpChanged', this.updateHearts, this);
            this.levelScene.events.on('killChanged', this.updateKills, this);
            this.levelScene.events.on('timeChanged', this.updateTimer, this);
            this.levelScene.events.on('weaponPickedUp', this.showWeaponUi, this);
            this.levelScene.events.on('ammoChanged', this.updateAmmo, this);
            this.levelScene.events.on('pauseStateChanged', this.handlePauseState, this);
            this.levelScene.events.on('infoStateChanged', this.handleInfoState, this);
            this.levelScene.events.on('phaseChanged', this.updatePhase, this);
            this.levelScene.events.on('threatChanged', this.updateThreat, this);
        }

        // Handle scaling/resizing
        this.scale.on('resize', this.handleResize, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off('resize', this.handleResize, this);
            if (this.levelScene) {
                this.levelScene.events.off('hpChanged', this.updateHearts, this);
                this.levelScene.events.off('killChanged', this.updateKills, this);
                this.levelScene.events.off('timeChanged', this.updateTimer, this);
                this.levelScene.events.off('weaponPickedUp', this.showWeaponUi, this);
                this.levelScene.events.off('ammoChanged', this.updateAmmo, this);
                this.levelScene.events.off('pauseStateChanged', this.handlePauseState, this);
                this.levelScene.events.off('infoStateChanged', this.handleInfoState, this);
                this.levelScene.events.off('phaseChanged', this.updatePhase, this);
                this.levelScene.events.off('threatChanged', this.updateThreat, this);
            }
        });

        // Initialize HUD values
        if (this.levelScene) {
            this.updateHearts(this.levelScene.player.getComponent('health').hp);
            this.updateKills(this.levelScene.kills || 0);
            if (this.levelScene.player.weapon) {
                this.showWeaponUi(this.levelScene.player.weapon);
                this.updateAmmo(this.levelScene.player.ammo);
            }
        }
    }

    createGameHud() {
        // 1. Draw Hearts (no background panel, as requested)
        this.hearts = [];
        for (let i = 0; i < 5; i++) {
            const heart = this.add.image(40 + i * 32, 40, 'heart_full')
                .setScale(2.5)
                .setDepth(100);
            this.hearts.push(heart);
        }

        // 2. Draw Weapon Slot Border
        this.weaponSlotBorder = this.add.image(230, 40, 'ui_inventory_chosen')
            .setScale(2.0)
            .setDepth(100);
        this.weaponSlotIcon = this.add.image(230, 40, 'icon_shotgun')
            .setScale(1.5)
            .setDepth(101)
            .setVisible(false);

        // 3. Draw Shotgun Ammo Cartridges
        this.ammoShells = [];
        for (let i = 0; i < 10; i++) {
            const shell = this.add.image(270 + i * 15, 40, 'ui_shotgun_shell')
                .setScale(1.8)
                .setDepth(100)
                .setVisible(false);
            this.ammoShells.push(shell);
        }

        // 4. Draw Kill Text (now Points)
        this.killText = this.add.text(this.scale.width - 200, 24, 'Pontos: 0', {
            fontFamily: 'Courier New',
            fontSize: '28px',
            fill: '#f2e7c9',
            stroke: '#000000',
            strokeThickness: 4
        }).setDepth(100);

        // 5. Draw Timer Text
        this.timerText = this.add.text(this.scale.width / 2, 24, '00:00', {
            fontFamily: 'Courier New',
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5, 0).setDepth(100);
        
        // 6. Draw Phase & Threat
        this.phaseText = this.add.text(this.scale.width / 2, 64, 'FASE 1', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            fill: '#ffaa00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0).setDepth(100);
        
        this.threatText = this.add.text(this.scale.width / 2, 94, '', {
            fontFamily: 'Courier New',
            fontSize: '20px',
            fill: '#ff4444',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0).setDepth(100);
        
        // 7. Giant Phase Transition Text
        this.phaseTransitionText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'FASE 2', {
            fontFamily: 'Georgia',
            fontSize: '80px',
            fill: '#ffffff',
            stroke: '#ff0000',
            strokeThickness: 10,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 20, stroke: true, fill: true }
        }).setOrigin(0.5).setDepth(200).setVisible(false).setAlpha(0);
    }

    updatePhase(phase) {
        if (this.phaseText) {
            this.phaseText.setText(`FASE ${phase}`);
        }
        
        if (this.phaseTransitionText) {
            this.phaseTransitionText.setText(`FASE ${phase}`);
            this.phaseTransitionText.setVisible(true);
            this.phaseTransitionText.setAlpha(0);
            this.phaseTransitionText.setScale(0.5);
            
            this.tweens.add({
                targets: this.phaseTransitionText,
                alpha: 1,
                scale: 1.2,
                duration: 500,
                ease: 'Back.easeOut',
                yoyo: true,
                hold: 2000,
                onComplete: () => {
                    this.phaseTransitionText.setVisible(false);
                }
            });
        }
    }

    updateThreat(threat) {
        if (this.threatText) {
            this.threatText.setText(`AMEAÇA ${threat}`);
        }
    }

    updateHearts(hp) {
        let maxHp = hp;
        if (this.levelScene && this.levelScene.player) {
            const healthComp = this.levelScene.player.getComponent('health');
            if (healthComp) maxHp = healthComp.maxHp;
        }
        
        const heartsNeeded = Math.ceil(maxHp / 2);
        while (this.hearts.length < heartsNeeded) {
            const i = this.hearts.length;
            const heart = this.add.image(40 + i * 32, 40, 'heart_empty')
                .setScale(2.5)
                .setDepth(100);
            this.hearts.push(heart);
        }

        for (let i = 0; i < this.hearts.length; i++) {
            if (i >= heartsNeeded) {
                this.hearts[i].setVisible(false);
                continue;
            }
            this.hearts[i].setVisible(true);
            
            const currentHpSegment = hp - (i * 2);
            if (currentHpSegment >= 2) {
                this.hearts[i].setTexture('heart_full');
            } else if (currentHpSegment === 1) {
                this.hearts[i].setTexture('heart_half');
            } else {
                this.hearts[i].setTexture('heart_empty');
            }
        }
    }

    updateKills(count) {
        if (this.killText) {
            this.killText.setText(`Pontos: ${count}`);
        }
    }

    updateTimer(seconds) {
        if (this.timerText) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            this.timerText.setText(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
    }

    showWeaponUi(weaponId) {
        if (this.weaponSlotIcon) {
            let texture = 'shotgun_drop';
            if (weaponId === 'pistol') texture = 'pistol_drop';
            if (weaponId === 'gun') texture = 'gun_drop';
            
            this.weaponSlotIcon.setTexture(texture);
            this.weaponSlotIcon.setVisible(true);
            this.weaponSlotIcon.clearTint();
        }
        this.currentWeaponId = weaponId;
    }

    updateAmmo(count) {
        if (!this.ammoShells) return;
        
        let shellTexture = 'ui_shotgun_shell';
        if (this.currentWeaponId === 'pistol') shellTexture = 'ui_pistol_shell';
        if (this.currentWeaponId === 'gun') shellTexture = 'ui_gun_shell';
        
        // Garantir que temos shells suficientes para desenhar (caso a arma tenha mais de 10)
        while (this.ammoShells.length < count) {
            const i = this.ammoShells.length;
            const shell = this.add.image(270 + i * 15, 40, shellTexture)
                .setScale(1.8)
                .setDepth(100)
                .setVisible(false);
            this.ammoShells.push(shell);
        }

        this.ammoShells.forEach((shell, index) => {
            if (index < count) {
                shell.setTexture(shellTexture);
                shell.clearTint();
                shell.setVisible(true);
            } else {
                shell.setVisible(false); // Esconde as munições gastas para não bugar outras armas
            }
        });

        // Ocultar ícone da arma quando zerar as balas
        if (this.weaponSlotIcon) {
            this.weaponSlotIcon.setVisible(count > 0);
        }
    }

    createPauseMenu() {
        const width = this.scale.width;
        const height = this.scale.height;
        const depth = 20;

        this.pauseOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.68)
            .setOrigin(0)
            .setDepth(depth)
            .setVisible(false);

        this.pauseTitle = this.add.text(width / 2, height / 2 - 80, 'PAUSE', {
            fontFamily: 'Georgia',
            fontSize: '32px',
            color: '#f3e7c9',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(depth + 2).setVisible(false);

        this.continueButton = this.createUiButton('Continuar', width / 2, height / 2 - 10, depth + 2, () => {
            if (this.levelScene) this.levelScene.resumeGame();
        });

        this.backToMenuButton = this.createUiButton('Menu Principal', width / 2, height / 2 + 50, depth + 2, () => {
            if (this.levelScene) {
                this.levelScene.scene.stop();
                this.scene.stop();
                this.levelScene.scene.start(SCENES.MENU);
            }
        });
    }

    createInfoMenu() {
        const width = this.scale.width;
        const height = this.scale.height;
        const depth = 20;

        this.infoOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.68)
            .setOrigin(0)
            .setDepth(depth)
            .setVisible(false);

        this.infoTitle = this.add.text(width / 2, height / 2 - 90, 'INFORMAÇÕES', {
            fontFamily: 'Georgia',
            fontSize: '28px',
            color: '#f3e7c9',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(depth + 2).setVisible(false);

        this.infoHealthText = this.add.text(width / 2, height / 2 - 30, '', {
            fontFamily: 'Georgia',
            fontSize: '18px',
            color: '#ffdddd'
        }).setOrigin(0.5).setDepth(depth + 2).setVisible(false);

        this.infoKillText = this.add.text(width / 2, height / 2 + 10, '', {
            fontFamily: 'Georgia',
            fontSize: '18px',
            color: '#ddffdd'
        }).setOrigin(0.5).setDepth(depth + 2).setVisible(false);

        this.infoSubText = this.add.text(width / 2, height / 2 + 50, 'Pressione B ou ESC para fechar', {
            fontFamily: 'Georgia',
            fontSize: '13px',
            color: '#a89c83'
        }).setOrigin(0.5).setDepth(depth + 2).setVisible(false);
    }

    createGameOverMenu() {
        const width = this.scale.width;
        const height = this.scale.height;
        const depth = 50;

        this.gameOverText = this.add.text(width / 2, height / 2 - 60, 'VOCÊ MORREU', {
            fontFamily: 'Georgia',
            fontSize: '48px',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(depth).setVisible(false);

        this.restartButton = this.createUiButton('Tentar Novamente', width / 2, height / 2 + 30, depth, () => {
            if (this.levelScene) {
                this.levelScene.physics.world.timeScale = 1.0; // Restaura a velocidade original
                this.levelScene.scene.restart();
                this.scene.restart();
            }
        });
    }

    showGameOver() {
        // Semi-transparent red overlay (not fully opaque — lets you see the dead body)
        if (!this.gameOverOverlay) {
            this.gameOverOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x330000, 0.5)
                .setOrigin(0)
                .setDepth(49);
        }
        this.gameOverOverlay.setVisible(true);

        if (this.gameOverText) this.gameOverText.setVisible(true);
        if (this.restartButton) {
            this.restartButton.buttonBg.setVisible(true);
            this.restartButton.buttonText.setVisible(true);
        }
    }

    createUiButton(labelText, x, y, depth, onClick) {
        const buttonBg = this.add.image(x, y, KEYS.UI_MENU_BLANK)
            .setOrigin(0.5)
            .setScale(3.5)
            .setDepth(depth)
            .setInteractive({ useHandCursor: false })
            .setVisible(false);

        // Text offset: the button sprite has a thicker bottom edge,
        // so nudge the text up by a few px to sit in the visual center
        const textOffsetY = -3;
        const buttonText = this.add.text(x, y + textOffsetY, labelText, {
            fontFamily: 'Georgia',
            fontSize: '20px',
            color: '#f5ebd5',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(depth + 1).setVisible(false);

        buttonBg.on('pointerover', () => buttonBg.setTint(0xdddddd));
        buttonBg.on('pointerout', () => {
            buttonBg.clearTint();
            buttonBg.setTexture(KEYS.UI_MENU_BLANK);
        });
        buttonBg.on('pointerdown', () => {
            buttonBg.setTexture(KEYS.UI_MENU_BLANK_PRESSED);
            buttonBg.clearTint();
        });
        buttonBg.on('pointerup', () => {
            buttonBg.setTexture(KEYS.UI_MENU_BLANK);
            buttonBg.clearTint();
            onClick();
        });

        return { buttonBg, buttonText };
    }

    handlePauseState(isOpen) {
        this.pauseOverlay.setVisible(isOpen);
        this.pauseTitle.setVisible(isOpen);
        this.continueButton.buttonBg.setVisible(isOpen);
        this.continueButton.buttonText.setVisible(isOpen);
        this.backToMenuButton.buttonBg.setVisible(isOpen);
        this.backToMenuButton.buttonText.setVisible(isOpen);
    }

    handleInfoState(isOpen) {
        if (isOpen && this.levelScene) {
            const hp = this.levelScene.player.getComponent('health').hp;
            const maxHp = this.levelScene.player.getComponent('health').maxHp;
            const kills = this.levelScene.kills;

            this.infoHealthText.setText(`Vida: ${hp} / ${maxHp}`);
            this.infoKillText.setText(`Abates: ${kills}`);
        }

        this.infoOverlay.setVisible(isOpen);
        this.infoTitle.setVisible(isOpen);
        this.infoHealthText.setVisible(isOpen);
        this.infoKillText.setVisible(isOpen);
        this.infoSubText.setVisible(isOpen);
    }

    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;

        if (this.killText) {
            this.killText.setPosition(width - 180, 18);
        }
        if (this.timerText) this.timerText.setPosition(width / 2, 24);
        if (this.phaseText) this.phaseText.setPosition(width / 2, 64);
        if (this.threatText) this.threatText.setPosition(width / 2, 94);
        if (this.phaseTransitionText) this.phaseTransitionText.setPosition(width / 2, height / 2);

        if (this.pauseOverlay) this.pauseOverlay.setSize(width, height);
        if (this.pauseTitle) this.pauseTitle.setPosition(width / 2, height / 2 - 80);
        if (this.continueButton) {
            this.continueButton.buttonBg.setPosition(width / 2, height / 2 - 10);
            this.continueButton.buttonText.setPosition(width / 2, height / 2 - 10 - 3);
        }
        if (this.backToMenuButton) {
            this.backToMenuButton.buttonBg.setPosition(width / 2, height / 2 + 50);
            this.backToMenuButton.buttonText.setPosition(width / 2, height / 2 + 50 - 3);
        }

        if (this.infoOverlay) this.infoOverlay.setSize(width, height);
        if (this.infoTitle) this.infoTitle.setPosition(width / 2, height / 2 - 90);
        if (this.infoHealthText) this.infoHealthText.setPosition(width / 2, height / 2 - 30);
        if (this.infoKillText) this.infoKillText.setPosition(width / 2, height / 2 + 10);
        if (this.infoSubText) this.infoSubText.setPosition(width / 2, height / 2 + 50);

        if (this.gameOverText) this.gameOverText.setPosition(width / 2, height / 2 - 60);
        if (this.restartButton) {
            this.restartButton.buttonBg.setPosition(width / 2, height / 2 + 30);
            this.restartButton.buttonText.setPosition(width / 2, height / 2 + 30 - 3);
        }
    }
}

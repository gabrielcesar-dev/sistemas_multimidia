import { KEYS, SCENES } from '../config/constants.js';
import { PLAYER_TYPE } from '../config/player.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.BOOT });
    }

    preload() {
        // --- PLAYER ---
        this.load.spritesheet(KEYS.PLAYER_SOLDIER_IDLE, 'assets/Character/Soldier_100x100/Soldier with shadows/Soldier-Idle.png', {
            frameWidth: 100, frameHeight: 100
        });
        this.load.spritesheet(KEYS.PLAYER_SOLDIER_WALK, 'assets/Character/Soldier_100x100/Soldier with shadows/Soldier-Walk.png', {
            frameWidth: 100, frameHeight: 100
        });
        this.load.spritesheet(KEYS.PLAYER_SOLDIER_ATTACK_1, 'assets/Character/Soldier_100x100/Soldier with shadows/Soldier-Attack01.png', {
            frameWidth: 100, frameHeight: 100
        });
        this.load.spritesheet(KEYS.PLAYER_SOLDIER_HURT, 'assets/Character/Soldier_100x100/Soldier with shadows/Soldier-Hurt.png', {
            frameWidth: 100, frameHeight: 100
        });
        this.load.spritesheet(KEYS.PLAYER_SOLDIER_DEATH, 'assets/Character/Soldier_100x100/Soldier with shadows/Soldier-Death.png', {
            frameWidth: 100, frameHeight: 100
        });

        this.load.image(KEYS.PLAYER_MAIN_IDLE_UP, 'assets/Character/Main/Idle/Character_up_idle-Sheet6.png');
        this.load.image(KEYS.PLAYER_MAIN_IDLE_DOWN, 'assets/Character/Main/Idle/Character_down_idle-Sheet6.png');
        this.load.image(KEYS.PLAYER_MAIN_IDLE_SIDE, 'assets/Character/Main/Idle/Character_side_idle-Sheet6.png');
        this.load.image(KEYS.PLAYER_MAIN_IDLE_SIDE_LEFT, 'assets/Character/Main/Idle/Character_side-left_idle-Sheet6.png');
        this.load.image(KEYS.PLAYER_MAIN_RUN_UP, 'assets/Character/Main/Run/Character_up_run-Sheet6.png');
        this.load.image(KEYS.PLAYER_MAIN_RUN_DOWN, 'assets/Character/Main/Run/Character_down_run-Sheet6.png');
        this.load.image(KEYS.PLAYER_MAIN_RUN_SIDE, 'assets/Character/Main/Run/Character_side_run-Sheet6.png');
        this.load.image(KEYS.PLAYER_MAIN_RUN_SIDE_LEFT, 'assets/Character/Main/Run/Character_side-left_run-Sheet6.png');
        this.load.image(KEYS.PLAYER_MAIN_PUNCH_UP, 'assets/Character/Main/Punch/Character_up_punch-Sheet4.png');
        this.load.image(KEYS.PLAYER_MAIN_PUNCH_DOWN, 'assets/Character/Main/Punch/Character_down_punch-Sheet4.png');
        this.load.image(KEYS.PLAYER_MAIN_PUNCH_SIDE, 'assets/Character/Main/Punch/Character_side_punch-Sheet4.png');
        this.load.image(KEYS.PLAYER_MAIN_PUNCH_SIDE_LEFT, 'assets/Character/Main/Punch/Character_side-left_punch-Sheet4.png');
        this.load.image(KEYS.PLAYER_MAIN_PICKUP_UP, 'assets/Character/Main/Pick-up/Character_up_Pick-up-Sheet3.png');
        this.load.image(KEYS.PLAYER_MAIN_PICKUP_DOWN, 'assets/Character/Main/Pick-up/Character_down_Pick-up-Sheet3.png');
        this.load.image(KEYS.PLAYER_MAIN_PICKUP_SIDE, 'assets/Character/Main/Pick-up/Character_side_Pick-up-Sheet3.png');
        this.load.image(KEYS.PLAYER_MAIN_PICKUP_SIDE_LEFT, 'assets/Character/Main/Pick-up/Character_side-left_Pick-up-Sheet3.png');

        // --- MENU UI ---
        this.load.image(KEYS.UI_MENU_PLAY, 'assets/UI/Menu/Main Menu/Play_Not-Pressed.png');
        this.load.image(KEYS.UI_MENU_PLAY_PRESSED, 'assets/UI/Menu/Main Menu/Play_Pressed.png');
        this.load.image(KEYS.UI_MENU_LOAD, 'assets/UI/Menu/Main Menu/Load_Not-Pressed.png');
        this.load.image(KEYS.UI_MENU_LOAD_PRESSED, 'assets/UI/Menu/Main Menu/Load_Pressed.png');
        this.load.image(KEYS.UI_MENU_SETTINGS, 'assets/UI/Menu/Main Menu/Settings_Not-Pressed.png');
        this.load.image(KEYS.UI_MENU_SETTINGS_PRESSED, 'assets/UI/Menu/Main Menu/Settings_Pressed.png');
        this.load.image(KEYS.UI_MENU_QUIT, 'assets/UI/Menu/Main Menu/Quit_Not-Pressed.png');
        this.load.image(KEYS.UI_MENU_QUIT_PRESSED, 'assets/UI/Menu/Main Menu/Quit_Pressed.png');
        this.load.image(KEYS.UI_MENU_BLANK, 'assets/UI/Menu/Main Menu/Blank_Not-Pressed.png');
        this.load.image(KEYS.UI_MENU_BLANK_PRESSED, 'assets/UI/Menu/Main Menu/Blank_Pressed.png');
        this.load.image(KEYS.UI_MENU_CURSOR, 'assets/UI/Menu/Cursor.png');

        // --- ZOMBIES ---
        // Load dynamically by rules (will create frames in create())
        this.load.image(KEYS.ZOMBIE_DOWN_IDLE, 'assets/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_DOWN_WALK, 'assets/Enemies/Zombie_Small/Zombie_Small_Down_walk-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_UP_IDLE, 'assets/Enemies/Zombie_Small/Zombie_Small_Up_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_UP_WALK, 'assets/Enemies/Zombie_Small/Zombie_Small_Up_Walk-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_SIDE_IDLE, 'assets/Enemies/Zombie_Small/Zombie_Small_Side_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_SIDE_WALK, 'assets/Enemies/Zombie_Small/Zombie_Small_Side_Walk-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_SIDE_DEATH, 'assets/Enemies/Zombie_Small/Zombie_Small_Side_First-Death-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_SIDE_LEFT_DEATH, 'assets/Enemies/Zombie_Small/Zombie_Small_Side-left_First-Death-Sheet6.png');

        this.load.image(KEYS.ZOMBIE_AXE_DOWN_IDLE, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Down_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_AXE_DOWN_WALK, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Down_Walk-Sheet8.png');
        this.load.image(KEYS.ZOMBIE_AXE_UP_IDLE, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Up_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_AXE_UP_WALK, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Up_Walk-Sheet8.png');
        this.load.image(KEYS.ZOMBIE_AXE_SIDE_IDLE, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Side_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_AXE_SIDE_WALK, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Side_Walk-Sheet8.png');
        this.load.image(KEYS.ZOMBIE_AXE_SIDE_DEATH, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Side_First-Death-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_AXE_SIDE_LEFT_DEATH, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Side-left_First-Death-Sheet6.png');

        this.load.image(KEYS.ZOMBIE_BIG_DOWN_IDLE, 'assets/Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_BIG_DOWN_WALK, 'assets/Enemies/Zombie_Big/Zombie_Big_Down_Walk-Sheet8.png');
        this.load.image(KEYS.ZOMBIE_BIG_UP_IDLE, 'assets/Enemies/Zombie_Big/Zombie_Big_Up_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_BIG_UP_WALK, 'assets/Enemies/Zombie_Big/Zombie_Big_Up_Walk-Sheet8.png');
        this.load.image(KEYS.ZOMBIE_BIG_SIDE_IDLE, 'assets/Enemies/Zombie_Big/Zombie_Big_Side_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_BIG_SIDE_WALK, 'assets/Enemies/Zombie_Big/Zombie_Big_Side_Walk-Sheet8.png');
        this.load.image(KEYS.ZOMBIE_BIG_SIDE_DEATH, 'assets/Enemies/Zombie_Big/Zombie_Big_Side_First-Death-Sheet7.png');
        this.load.image(KEYS.ZOMBIE_BIG_SIDE_LEFT_DEATH, 'assets/Enemies/Zombie_Big/Zombie_Big_Side-left_First-Death-Sheet7.png');

        // --- ENVIRONMENT & PROPS ---
        this.load.image(KEYS.TREE, 'assets/Objects/Nature/Green/Tree_1_Spruce_Green.png');
        this.load.image(KEYS.GRASS, 'assets/Objects/Nature/Green/Grass_1_Green.png');
        this.load.image(KEYS.TILESET_GREEN, 'assets/Tiles/Background_Green_TileSet.png');
        this.load.image(KEYS.TILESET_BLEAK, 'assets/Tiles/Background_Bleak-Yellow_TileSet.png');
        this.load.image(KEYS.TILESET_DARK, 'assets/Tiles/Background_Dark-Green_TileSet.png');

        this.load.image(KEYS.CAR, 'assets/Objects/Vehicles/Rust/Car_1_Rust/Car_1_Rust_Blue.png');
        this.load.image(KEYS.BUSH, 'assets/Objects/Nature/Green/Bush_1_Green.png');
        this.load.image(KEYS.BUSH_2_GREEN, 'assets/Objects/Nature/Green/Bush_2_Green.png');
        this.load.image(KEYS.TREE_2_SPRUCE_SPARSE_GREEN, 'assets/Objects/Nature/Green/Tree_2_Spruce-Sparse_Green.png');
        this.load.image(KEYS.TREE_3_NORMAL_GREEN, 'assets/Objects/Nature/Green/Tree_3_Normal_Green.png');
        this.load.image(KEYS.TREE_5_BIG_GREEN, 'assets/Objects/Nature/Green/Tree_5_Big_Green.png');
        this.load.image(KEYS.TREE_6_PINE_BIG_GREEN, 'assets/Objects/Nature/Green/Tree_6_Pine_Big_Green.png');
        this.load.image(KEYS.TREE_7_BIRCH_GREEN, 'assets/Objects/Nature/Green/Tree_7_Birch_Green.png');
        this.load.image(KEYS.TREE_8_BIRCH_GREEN, 'assets/Objects/Nature/Green/Tree_8_Birch_Green.png');
        this.load.image(KEYS.TREE_9_SMALL_OAK_GREEN, 'assets/Objects/Nature/Green/Tree_9_Small-oak_Green.png');
        this.load.image(KEYS.TREE_10_SMALL_OAK_GREEN, 'assets/Objects/Nature/Green/Tree_10_Small-oak_Green.png');
        this.load.image(KEYS.TREE_TRUNK_2_GRASS_GREEN, 'assets/Objects/Nature/Green/Tree-trunk_2_grass_Green.png');
        this.load.image(KEYS.ROCK_GRASS_GREEN, 'assets/Objects/Nature/Green/Rocks/Rock-grass.png');
        this.load.image(KEYS.BUSH_DARK, 'assets/Objects/Nature/Dark-Green/Bush_1_Dark-Green.png');
        this.load.image(KEYS.BUSH_2_DARK, 'assets/Objects/Nature/Dark-Green/Bush_2_Dark-Green.png');
        this.load.image(KEYS.TREE_2_SPRUCE_SPARSE_DARK, 'assets/Objects/Nature/Dark-Green/Tree_2_Spruce-Sparse_Dark-Green.png');
        this.load.image(KEYS.TREE_3_NORMAL_DARK, 'assets/Objects/Nature/Dark-Green/Tree_3_Normal_Dark-Green.png');
        this.load.image(KEYS.TREE_5_BIG_DARK, 'assets/Objects/Nature/Dark-Green/Tree_5_Big_Dark-Green.png');
        this.load.image(KEYS.TREE_6_PINE_BIG_DARK, 'assets/Objects/Nature/Dark-Green/Tree_6_Big-pine_Dark-Green.png');
        this.load.image(KEYS.TREE_7_BIRCH_DARK, 'assets/Objects/Nature/Dark-Green/Tree_7_Birch_Dark-Green.png');
        this.load.image(KEYS.TREE_8_BIRCH_DARK, 'assets/Objects/Nature/Dark-Green/Tree_8_Birch_Dark-Green.png');
        this.load.image(KEYS.TREE_9_SMALL_OAK_DARK, 'assets/Objects/Nature/Dark-Green/Tree_9_Small-oak_Dark-Green.png');
        this.load.image(KEYS.TREE_10_SMALL_OAK_DARK, 'assets/Objects/Nature/Dark-Green/Tree_10_Small-oak_Dark-Green.png');
        this.load.image(KEYS.TREE_TRUNK_2_GRASS_DARK, 'assets/Objects/Nature/Dark-Green/Tree-trunk_2_grass_Dark-Green.png');
        this.load.image(KEYS.ROCK_GRASS_DARK, 'assets/Objects/Nature/Dark-Green/Rocks/Rock-grass_Dark-Green.png');
    }

    create() {
        this.processDynamicSpritesheets();
        this.createAnimations();
        this.registry.set('selectedPlayerType', this.registry.get('selectedPlayerType') || PLAYER_TYPE);

        this.scene.start(SCENES.MENU);
    }

    processDynamicSpritesheets() {
        // Enforce the rule: file ends with -SheetX.png -> width / X
        const parseDynamicFrames = (key, framesX) => {
            const tex = this.textures.get(key);
            if (!tex || tex.key === '__MISSING') return;

            const baseImage = tex.getSourceImage();
            const fw = Math.floor(baseImage.width / framesX);
            const fh = baseImage.height;

            // Inject the frames explicitly
            for (let i = 0; i < framesX; i++) {
                tex.add(i, 0, i * fw, 0, fw, fh);
            }
        };

        parseDynamicFrames(KEYS.PLAYER_MAIN_IDLE_UP, 6);
        parseDynamicFrames(KEYS.PLAYER_MAIN_IDLE_DOWN, 6);
        parseDynamicFrames(KEYS.PLAYER_MAIN_IDLE_SIDE, 6);
        parseDynamicFrames(KEYS.PLAYER_MAIN_IDLE_SIDE_LEFT, 6);
        parseDynamicFrames(KEYS.PLAYER_MAIN_RUN_UP, 6);
        parseDynamicFrames(KEYS.PLAYER_MAIN_RUN_DOWN, 6);
        parseDynamicFrames(KEYS.PLAYER_MAIN_RUN_SIDE, 6);
        parseDynamicFrames(KEYS.PLAYER_MAIN_RUN_SIDE_LEFT, 6);
        parseDynamicFrames(KEYS.PLAYER_MAIN_PUNCH_UP, 4);
        parseDynamicFrames(KEYS.PLAYER_MAIN_PUNCH_DOWN, 4);
        parseDynamicFrames(KEYS.PLAYER_MAIN_PUNCH_SIDE, 4);
        parseDynamicFrames(KEYS.PLAYER_MAIN_PUNCH_SIDE_LEFT, 4);
        parseDynamicFrames(KEYS.PLAYER_MAIN_PICKUP_UP, 3);
        parseDynamicFrames(KEYS.PLAYER_MAIN_PICKUP_DOWN, 3);
        parseDynamicFrames(KEYS.PLAYER_MAIN_PICKUP_SIDE, 3);
        parseDynamicFrames(KEYS.PLAYER_MAIN_PICKUP_SIDE_LEFT, 3);

        // All of these have -Sheet6 in their names as verified in the dir
        parseDynamicFrames(KEYS.ZOMBIE_DOWN_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_DOWN_WALK, 6);
        parseDynamicFrames(KEYS.ZOMBIE_UP_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_UP_WALK, 6);
        parseDynamicFrames(KEYS.ZOMBIE_SIDE_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_SIDE_WALK, 6);
        parseDynamicFrames(KEYS.ZOMBIE_SIDE_DEATH, 6);
        parseDynamicFrames(KEYS.ZOMBIE_SIDE_LEFT_DEATH, 6);

        parseDynamicFrames(KEYS.ZOMBIE_AXE_DOWN_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_DOWN_WALK, 8);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_UP_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_UP_WALK, 8);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_SIDE_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_SIDE_WALK, 8);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_SIDE_DEATH, 6);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_SIDE_LEFT_DEATH, 6);

        parseDynamicFrames(KEYS.ZOMBIE_BIG_DOWN_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_DOWN_WALK, 8);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_UP_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_UP_WALK, 8);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_SIDE_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_SIDE_WALK, 8);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_SIDE_DEATH, 7);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_SIDE_LEFT_DEATH, 7);
    }

    createAnimations() {
        // PLAYER 
        const createPlayerAnim = (animKey, spriteKey, length, frameRate, repeat = -1) => {
            const frames = Array.from({ length }, (_, i) => ({ key: spriteKey, frame: i }));
            this.anims.create({
                key: animKey,
                frames,
                frameRate,
                repeat
            });
        };

        this.anims.create({
            key: 'anim_player_soldier_idle',
            frames: this.anims.generateFrameNumbers(KEYS.PLAYER_SOLDIER_IDLE),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'anim_player_soldier_walk',
            frames: this.anims.generateFrameNumbers(KEYS.PLAYER_SOLDIER_WALK),
            frameRate: 14,
            repeat: -1
        });
        this.anims.create({
            key: 'anim_player_soldier_attack',
            frames: this.anims.generateFrameNumbers(KEYS.PLAYER_SOLDIER_ATTACK_1),
            frameRate: 14,
            repeat: 0
        });
        this.anims.create({
            key: 'anim_player_soldier_hurt',
            frames: this.anims.generateFrameNumbers(KEYS.PLAYER_SOLDIER_HURT),
            frameRate: 12,
            repeat: 0
        });
        this.anims.create({
            key: 'anim_player_soldier_death',
            frames: this.anims.generateFrameNumbers(KEYS.PLAYER_SOLDIER_DEATH),
            frameRate: 10,
            repeat: 0
        });

        createPlayerAnim('anim_player_main_idle_up', KEYS.PLAYER_MAIN_IDLE_UP, 6, 10);
        createPlayerAnim('anim_player_main_idle_down', KEYS.PLAYER_MAIN_IDLE_DOWN, 6, 10);
        createPlayerAnim('anim_player_main_idle_side', KEYS.PLAYER_MAIN_IDLE_SIDE, 6, 10);
        createPlayerAnim('anim_player_main_idle_side_left', KEYS.PLAYER_MAIN_IDLE_SIDE_LEFT, 6, 10);
        createPlayerAnim('anim_player_main_run_up', KEYS.PLAYER_MAIN_RUN_UP, 6, 14);
        createPlayerAnim('anim_player_main_run_down', KEYS.PLAYER_MAIN_RUN_DOWN, 6, 14);
        createPlayerAnim('anim_player_main_run_side', KEYS.PLAYER_MAIN_RUN_SIDE, 6, 14);
        createPlayerAnim('anim_player_main_run_side_left', KEYS.PLAYER_MAIN_RUN_SIDE_LEFT, 6, 14);
        createPlayerAnim('anim_player_main_punch_up', KEYS.PLAYER_MAIN_PUNCH_UP, 4, 14, 0);
        createPlayerAnim('anim_player_main_punch_down', KEYS.PLAYER_MAIN_PUNCH_DOWN, 4, 14, 0);
        createPlayerAnim('anim_player_main_punch_side', KEYS.PLAYER_MAIN_PUNCH_SIDE, 4, 14, 0);
        createPlayerAnim('anim_player_main_punch_side_left', KEYS.PLAYER_MAIN_PUNCH_SIDE_LEFT, 4, 14, 0);
        createPlayerAnim('anim_player_main_pickup_up', KEYS.PLAYER_MAIN_PICKUP_UP, 3, 10, 0);
        createPlayerAnim('anim_player_main_pickup_down', KEYS.PLAYER_MAIN_PICKUP_DOWN, 3, 10, 0);
        createPlayerAnim('anim_player_main_pickup_side', KEYS.PLAYER_MAIN_PICKUP_SIDE, 3, 10, 0);
        createPlayerAnim('anim_player_main_pickup_side_left', KEYS.PLAYER_MAIN_PICKUP_SIDE_LEFT, 3, 10, 0);

        // ZOMBIES
        const createZombieAnim = (animKey, spriteKey, length, frameRate = 8, repeat = -1) => {
            const frames = Array.from({length: length}, (_, i) => ({ key: spriteKey, frame: i }));
            this.anims.create({
                key: animKey,
                frames: frames,
                frameRate,
                repeat
            });
        };

        createZombieAnim('anim_zombie_down_idle', KEYS.ZOMBIE_DOWN_IDLE, 6);
        createZombieAnim('anim_zombie_down_walk', KEYS.ZOMBIE_DOWN_WALK, 6);
        createZombieAnim('anim_zombie_up_idle', KEYS.ZOMBIE_UP_IDLE, 6);
        createZombieAnim('anim_zombie_up_walk', KEYS.ZOMBIE_UP_WALK, 6);
        createZombieAnim('anim_zombie_side_idle', KEYS.ZOMBIE_SIDE_IDLE, 6);
        createZombieAnim('anim_zombie_side_walk', KEYS.ZOMBIE_SIDE_WALK, 6);
        createZombieAnim('anim_zombie_side_death', KEYS.ZOMBIE_SIDE_DEATH, 6, 10, 0);
        createZombieAnim('anim_zombie_side_left_death', KEYS.ZOMBIE_SIDE_LEFT_DEATH, 6, 10, 0);

        createZombieAnim('anim_zombie_axe_down_idle', KEYS.ZOMBIE_AXE_DOWN_IDLE, 6);
        createZombieAnim('anim_zombie_axe_down_walk', KEYS.ZOMBIE_AXE_DOWN_WALK, 8);
        createZombieAnim('anim_zombie_axe_up_idle', KEYS.ZOMBIE_AXE_UP_IDLE, 6);
        createZombieAnim('anim_zombie_axe_up_walk', KEYS.ZOMBIE_AXE_UP_WALK, 8);
        createZombieAnim('anim_zombie_axe_side_idle', KEYS.ZOMBIE_AXE_SIDE_IDLE, 6);
        createZombieAnim('anim_zombie_axe_side_walk', KEYS.ZOMBIE_AXE_SIDE_WALK, 8);
        createZombieAnim('anim_zombie_axe_side_death', KEYS.ZOMBIE_AXE_SIDE_DEATH, 6, 10, 0);
        createZombieAnim('anim_zombie_axe_side_left_death', KEYS.ZOMBIE_AXE_SIDE_LEFT_DEATH, 6, 10, 0);

        createZombieAnim('anim_zombie_big_down_idle', KEYS.ZOMBIE_BIG_DOWN_IDLE, 6);
        createZombieAnim('anim_zombie_big_down_walk', KEYS.ZOMBIE_BIG_DOWN_WALK, 8);
        createZombieAnim('anim_zombie_big_up_idle', KEYS.ZOMBIE_BIG_UP_IDLE, 6);
        createZombieAnim('anim_zombie_big_up_walk', KEYS.ZOMBIE_BIG_UP_WALK, 8);
        createZombieAnim('anim_zombie_big_side_idle', KEYS.ZOMBIE_BIG_SIDE_IDLE, 6);
        createZombieAnim('anim_zombie_big_side_walk', KEYS.ZOMBIE_BIG_SIDE_WALK, 8);
        createZombieAnim('anim_zombie_big_side_death', KEYS.ZOMBIE_BIG_SIDE_DEATH, 7, 10, 0);
        createZombieAnim('anim_zombie_big_side_left_death', KEYS.ZOMBIE_BIG_SIDE_LEFT_DEATH, 7, 10, 0);
    }
}

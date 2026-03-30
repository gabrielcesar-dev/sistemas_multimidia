import { KEYS, SCENES } from '../config/constants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.BOOT });
    }

    preload() {
        // --- PLAYER ---
        this.load.spritesheet(KEYS.PLAYER_IDLE, 'assets/Character/Soldier_100x100/Soldier with shadows/Soldier-Idle.png', {
            frameWidth: 100, frameHeight: 100
        });
        this.load.spritesheet(KEYS.PLAYER_WALK, 'assets/Character/Soldier_100x100/Soldier with shadows/Soldier-Walk.png', {
            frameWidth: 100, frameHeight: 100
        });

        // --- ZOMBIES ---
        // Load dynamically by rules (will create frames in create())
        this.load.image(KEYS.ZOMBIE_DOWN_IDLE, 'assets/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_DOWN_WALK, 'assets/Enemies/Zombie_Small/Zombie_Small_Down_walk-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_UP_IDLE, 'assets/Enemies/Zombie_Small/Zombie_Small_Up_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_UP_WALK, 'assets/Enemies/Zombie_Small/Zombie_Small_Up_Walk-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_SIDE_IDLE, 'assets/Enemies/Zombie_Small/Zombie_Small_Side_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_SIDE_WALK, 'assets/Enemies/Zombie_Small/Zombie_Small_Side_Walk-Sheet6.png');

        this.load.image(KEYS.ZOMBIE_AXE_DOWN_IDLE, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Down_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_AXE_DOWN_WALK, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Down_Walk-Sheet8.png');
        this.load.image(KEYS.ZOMBIE_AXE_UP_IDLE, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Up_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_AXE_UP_WALK, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Up_Walk-Sheet8.png');
        this.load.image(KEYS.ZOMBIE_AXE_SIDE_IDLE, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Side_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_AXE_SIDE_WALK, 'assets/Enemies/Zombie_Axe/Zombie_Axe_Side_Walk-Sheet8.png');

        this.load.image(KEYS.ZOMBIE_BIG_DOWN_IDLE, 'assets/Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_BIG_DOWN_WALK, 'assets/Enemies/Zombie_Big/Zombie_Big_Down_Walk-Sheet8.png');
        this.load.image(KEYS.ZOMBIE_BIG_UP_IDLE, 'assets/Enemies/Zombie_Big/Zombie_Big_Up_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_BIG_UP_WALK, 'assets/Enemies/Zombie_Big/Zombie_Big_Up_Walk-Sheet8.png');
        this.load.image(KEYS.ZOMBIE_BIG_SIDE_IDLE, 'assets/Enemies/Zombie_Big/Zombie_Big_Side_Idle-Sheet6.png');
        this.load.image(KEYS.ZOMBIE_BIG_SIDE_WALK, 'assets/Enemies/Zombie_Big/Zombie_Big_Side_Walk-Sheet8.png');

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
    }

    create() {
        this.processDynamicSpritesheets();
        this.createAnimations();

        this.scene.start(SCENES.LEVEL1);
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

        // All of these have -Sheet6 in their names as verified in the dir
        parseDynamicFrames(KEYS.ZOMBIE_DOWN_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_DOWN_WALK, 6);
        parseDynamicFrames(KEYS.ZOMBIE_UP_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_UP_WALK, 6);
        parseDynamicFrames(KEYS.ZOMBIE_SIDE_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_SIDE_WALK, 6);

        parseDynamicFrames(KEYS.ZOMBIE_AXE_DOWN_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_DOWN_WALK, 8);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_UP_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_UP_WALK, 8);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_SIDE_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_AXE_SIDE_WALK, 8);

        parseDynamicFrames(KEYS.ZOMBIE_BIG_DOWN_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_DOWN_WALK, 8);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_UP_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_UP_WALK, 8);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_SIDE_IDLE, 6);
        parseDynamicFrames(KEYS.ZOMBIE_BIG_SIDE_WALK, 8);
    }

    createAnimations() {
        // PLAYER 
        // generateFrameNumbers automatically fetches all frames registered from load.spritesheet
        this.anims.create({
            key: 'anim_player_idle',
            frames: this.anims.generateFrameNumbers(KEYS.PLAYER_IDLE),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'anim_player_walk',
            frames: this.anims.generateFrameNumbers(KEYS.PLAYER_WALK),
            frameRate: 14,
            repeat: -1
        });

        // ZOMBIES
        const createZombieAnim = (animKey, spriteKey, length) => {
            const frames = Array.from({length: length}, (_, i) => ({ key: spriteKey, frame: i }));
            this.anims.create({
                key: animKey,
                frames: frames,
                frameRate: 8,
                repeat: -1
            });
        };

        createZombieAnim('anim_zombie_down_idle', KEYS.ZOMBIE_DOWN_IDLE, 6);
        createZombieAnim('anim_zombie_down_walk', KEYS.ZOMBIE_DOWN_WALK, 6);
        createZombieAnim('anim_zombie_up_idle', KEYS.ZOMBIE_UP_IDLE, 6);
        createZombieAnim('anim_zombie_up_walk', KEYS.ZOMBIE_UP_WALK, 6);
        createZombieAnim('anim_zombie_side_idle', KEYS.ZOMBIE_SIDE_IDLE, 6);
        createZombieAnim('anim_zombie_side_walk', KEYS.ZOMBIE_SIDE_WALK, 6);

        createZombieAnim('anim_zombie_axe_down_idle', KEYS.ZOMBIE_AXE_DOWN_IDLE, 6);
        createZombieAnim('anim_zombie_axe_down_walk', KEYS.ZOMBIE_AXE_DOWN_WALK, 8);
        createZombieAnim('anim_zombie_axe_up_idle', KEYS.ZOMBIE_AXE_UP_IDLE, 6);
        createZombieAnim('anim_zombie_axe_up_walk', KEYS.ZOMBIE_AXE_UP_WALK, 8);
        createZombieAnim('anim_zombie_axe_side_idle', KEYS.ZOMBIE_AXE_SIDE_IDLE, 6);
        createZombieAnim('anim_zombie_axe_side_walk', KEYS.ZOMBIE_AXE_SIDE_WALK, 8);

        createZombieAnim('anim_zombie_big_down_idle', KEYS.ZOMBIE_BIG_DOWN_IDLE, 6);
        createZombieAnim('anim_zombie_big_down_walk', KEYS.ZOMBIE_BIG_DOWN_WALK, 8);
        createZombieAnim('anim_zombie_big_up_idle', KEYS.ZOMBIE_BIG_UP_IDLE, 6);
        createZombieAnim('anim_zombie_big_up_walk', KEYS.ZOMBIE_BIG_UP_WALK, 8);
        createZombieAnim('anim_zombie_big_side_idle', KEYS.ZOMBIE_BIG_SIDE_IDLE, 6);
        createZombieAnim('anim_zombie_big_side_walk', KEYS.ZOMBIE_BIG_SIDE_WALK, 8);
    }
}

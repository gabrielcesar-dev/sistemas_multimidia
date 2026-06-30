import BaseEntity from './BaseEntity.js';

export default class BaseProp extends BaseEntity {
    constructor(scene, x, y, textureKey, scale = 1, isStatic = true) {
        super(scene, x, y, textureKey, isStatic);
        
        this.setScale(scale);
        this.applyYDepthSorting();
    }
}

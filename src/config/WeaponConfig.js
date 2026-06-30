export const WEAPON_CONFIG = {
    shotgun: {
        id: 'shotgun',
        pelletCount: 10,
        spreadAngle: Math.PI / 4, // 45 graus de cone
        speed: 900,
        baseDamage: 4,
        pierce: 3,
        knockback: 1200,
        knockbackDuration: 300,
        shakeIntensity: 0.02,
        shakeDuration: 150,
        hitstopDuration: 60,
        aimAssistRadius: 25, // Hitbox radius (makes bullets fatter invisibly)
        falloff: {
            shortRange: 150,   // up to 150px: 100% damage, 100% knockback
            midRange: 350,     // up to 350px: 50% damage, 50% knockback
            longRangeDamage: 1, // beyond 350px
            longRangeKnockback: 100
        },
        cooldown: 800
    },
    pistol: {
        id: 'pistol',
        pelletCount: 1,
        spreadAngle: 0,
        speed: 1000,
        baseDamage: 5,
        pierce: 2,
        knockback: 250,
        shakeIntensity: 0.01,
        shakeDuration: 100,
        hitstopDuration: 0,
        aimAssistRadius: 20,
        falloff: {
            shortRange: 800,
            midRange: 1200,
            longRangeDamage: 5,
            longRangeKnockback: 250
        },
        cooldown: 500,
        burstCount: 3,
        burstDelay: 80
    },
    gun: {
        id: 'gun',
        pelletCount: 1,
        spreadAngle: 0,
        speed: 1200,
        baseDamage: 4,
        pierce: 1,
        knockback: 150,
        shakeIntensity: 0.00003,
        shakeDuration: 80,
        hitstopDuration: 0,
        aimAssistRadius: 15,
        falloff: {
            shortRange: 800,
            midRange: 1200,
            longRangeDamage: 4,
            longRangeKnockback: 150
        },
        isAutomatic: true,
        cooldown: 150
    }
};

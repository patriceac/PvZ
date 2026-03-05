/**
 * @typedef {"menu"|"running"|"paused"|"won"|"lost"} GameStatus
 */

/**
 * @typedef {Object} Settings
 * @property {"normal"|"hard"|"smoke"} difficulty
 * @property {boolean} muted
 */

/**
 * @typedef {Object} PlantDef
 * @property {string} id
 * @property {string} name
 * @property {string} cardSymbol
 * @property {number} cost
 * @property {number} cooldownMs
 * @property {number} maxHp
 * @property {string} spriteKey
 * @property {number=} shootIntervalMs
 * @property {number=} shotsPerVolley
 * @property {number=} projectileDamage
 * @property {number=} sunIntervalMs
 * @property {number=} armTimeMs
 * @property {number=} mineDamage
 * @property {number=} mineRadius
 * @property {number=} fuseTimeMs
 * @property {number=} blastDamage
 * @property {number=} blastRadius
 */

/**
 * @typedef {Object} ZombieDef
 * @property {string} id
 * @property {string} name
 * @property {number} maxHp
 * @property {number} armor
 * @property {number} speed
 * @property {number} biteDamage
 * @property {number} biteIntervalMs
 */

/**
 * @typedef {Object} ProjectileDef
 * @property {string} id
 * @property {string} spriteKey
 * @property {number} speed
 * @property {number} damage
 */

/**
 * @typedef {Object} WaveEntry
 * @property {number} timeMs
 * @property {number} lane
 * @property {string} zombieType
 * @property {boolean=} flag
 */

/**
 * @typedef {Object} Entity
 * @property {string} id
 * @property {number} lane
 * @property {number} x
 * @property {number} hp
 * @property {string} state
 * @property {string} spriteKey
 */

export {};

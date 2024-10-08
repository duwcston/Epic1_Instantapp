import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../sprites/Player';
import { Enemy } from '../sprites/Enemy';
import { Controller } from '../utils/Controller';
import { PlayerHealth } from '../sprites/PlayerHealth';
import { EnemyHealth } from '../sprites/EnemyHealth';
import { Border } from '../utils/Border';
import { UnitSpawner } from '../utils/UnitSpawner';
import { Unit } from '../sprites/Unit';
import { UnitEnemySpawner } from '../utils/UnitEnemySpawner';
import { UnitEnemy } from '../sprites/UnitEnemy';
import { PlayerSkill } from '../sprites/PlayerSkill';
import { EnemySkill } from '../sprites/EnemySkill';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    sky: Phaser.GameObjects.Image;
    bottomLeft: Phaser.GameObjects.Image;
    bottomRight: Phaser.GameObjects.Image;
    bottomMid: Phaser.GameObjects.Image;
    topCutLeft: Phaser.GameObjects.Image;
    topCutRight: Phaser.GameObjects.Image;
    topCutMid: Phaser.GameObjects.Image;
    avatarFrameLeft: Phaser.GameObjects.Image;
    avatarFrameRight: Phaser.GameObjects.Image;
    athenaIcon: Phaser.GameObjects.Image;
    michaelIcon: Phaser.GameObjects.Image;
    characterName: Phaser.GameObjects.Text;

    border: Border;
    player: Player;
    enemy: Enemy;
    controller: Controller;
    playerHealth: PlayerHealth;
    enemyHealth: EnemyHealth;
    unitSpawner: UnitSpawner;
    unit: Unit;
    unitEnemySpawner: UnitEnemySpawner;
    unitEnemy: UnitEnemy;
    playerSkill: PlayerSkill;
    enemySkill: EnemySkill;

    constructor() {
        super('Game');
    }

    create() {
        const { width, height } = this.sys.game.config;

        this.camera = this.cameras.main;

        this.sky = this.add.image(width as number / 2, 90, 'sky').setScale(2.6, 1);
        this.background = this.physics.add.image(width as number / 2, height as number / 2, 'background')
            .setScale(1.5, 1.2)
            .setOffset(0, height as number / 2 + 40)
            .setImmovable(true);

        this.bottomLeft = this.add.image(0, height as number, 'bottom_left')
            .setScale(0.7)
            .setOrigin(0, 1)
            .setDepth(1);
        this.bottomRight = this.add.image(width as number, height as number, 'bottom_right')
            .setScale(0.8, 0.7)
            .setOrigin(1, 1)
            .setDepth(1);
        this.bottomMid = this.add.image(width as number / 2, height as number, 'bottom_mid')
            .setScale(5, 0.7)
            .setOrigin(0.5, 1)
            .setScrollFactor(0);
        this.topCutMid = this.add.image(width as number / 2, 0, 'top_cut_mid')
            .setScale(4, 0.7)
            .setOrigin(0.5, 0)
            .setScrollFactor(0);

        this.avatarFrameLeft = this.add.image(40, 45, 'avatar_frame_left').setScale(0.7).setDepth(10);
        this.michaelIcon = this.add.image(40, 45, 'michael-icon').setScale(0.7);
        this.characterName = this.add.text(90, 40, 'Archangel Michael', { fontSize: '12px', color: '#ffff00' });

        this.avatarFrameRight = this.add.image(width as number - 40, 45, 'avatar_frame_right').setScale(0.7).setDepth(10);
        this.athenaIcon = this.add.image(width as number - 40, 45, 'athena-icon').setScale(0.7).setFlipX(true);
        this.characterName = this.add.text(width as number - 130, 40, 'Athena', { fontSize: '12px', color: '#ffff00' });

        this.border = new Border(this);

        this.player = new Player(this, this.background);
        this.playerHealth = new PlayerHealth(this);

        this.enemy = new Enemy(this, this.background);
        this.enemyHealth = new EnemyHealth(this);

        this.controller = new Controller(this, this.player);

        this.unitSpawner = new UnitSpawner(this, this.enemy, this.background);
        this.unitEnemySpawner = new UnitEnemySpawner(this, this.player, this.background);

        this.unit = new Unit(this, this.enemy);
        this.unitEnemy = new UnitEnemy(this, this.player);

        this.playerSkill = new PlayerSkill(this, this.player, this.enemy, this.enemyHealth, this.unitEnemy, this.unitEnemySpawner);
        this.enemySkill = new EnemySkill(this, this.enemy, this.player, this.playerHealth, this.unit, this.unitSpawner, this.enemyHealth);

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        this.controller.unclickable(this.input.activePointer);

        if (this.playerHealth.playerHealth <= 0) {
            (this.player.player.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
            this.player.player.timeScale = 0.35;
            this.player.player.setAnimation(0, 'die', false, true);
            this.camera.zoomTo(1.5, 2400);
            this.time.addEvent({
                delay: 3500,
                callback: () => {
                    this.scene.pause('Game');
                    this.scene.launch('GameOver');
                },
                callbackScope: this
            });
        }

        if (this.enemyHealth.enemyHealth <= 0) {
            this.enemy.enemy.timeScale = 0.5;
            (this.enemy.enemy.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
            this.enemy.enemy.setAnimation(0, 'die', false, true);
            this.time.addEvent({
                delay: 1900,
                callback: () => {
                    this.scene.pause('Game');
                    this.scene.launch('GameWin');
                },
                callbackScope: this
            });
        }
    }
}

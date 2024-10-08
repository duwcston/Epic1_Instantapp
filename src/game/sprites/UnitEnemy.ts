import { UnitSpawner } from "../utils/UnitSpawner";
import { Player } from "./Player";
import { PlayerHealth } from "./PlayerHealth";
import { Unit } from "./Unit";
interface IUnitEnemy extends Phaser.Physics.Arcade.Sprite {
    unitEnemyHealth: number;
}

export class UnitEnemy {
    scene: Phaser.Scene;
    unitEnemy: Phaser.Physics.Arcade.Sprite;
    player: Player;
    private static _unitEnemy: UnitEnemy;
    public unitEnemyGroup: Phaser.Physics.Arcade.Group;
    protected unitEnemyMaxHealth: number = 30;
    protected unitEnemyHealth: number = this.unitEnemyMaxHealth;
    protected unitEnemyDamage: number = 10;
    protected unitEnemyDamageOverlay: Phaser.GameObjects.Text;

    static get unitEnemy() {
        return this._unitEnemy;
    }

    constructor(scene: Phaser.Scene, player: Player) {
        UnitEnemy._unitEnemy = this;

        this.scene = scene;
        this.unitEnemyGroup = this.scene.physics.add.group({
            maxSize: 10,
            runChildUpdate: true
        });
        this.player = player;

    }

    protected unitEnemyInteraction() {
        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                const units = this.unitEnemyGroup.getChildren();
                units.forEach((unitEnemy) => {
                    if ((unitEnemy as IUnitEnemy).unitEnemyHealth > 0) {
                        if (unitEnemy && this.player.player) {
                            this.scene.physics.add.overlap(unitEnemy, UnitSpawner.unitSpawner.unitGroup, () => {
                                this.attackUnit(unitEnemy);
                            });
                            const distance = Phaser.Math.Distance.Between((unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).x, (unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).y, this.player.player.x, this.player.player.y);
                            if (distance < 100) {
                                this.attackEnemy(unitEnemy);
                            }
                            else {
                                (unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).anims.play('walk', true);
                                (unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).setFlip((unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).x < this.player.player.x ? false : true, false);
                                this.followEnemy(unitEnemy, 100);
                            }
                        }
                        else {
                            (unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).anims.play('walk', true);
                            (unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).setFlip((unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).x < this.player.player.x ? false : true, false);
                            this.followEnemy(unitEnemy, 100);
                        }
                    }
                });
            },
            loop: true
        });
    }

    private attackEnemy(unitEnemy: Phaser.GameObjects.GameObject) {
        (unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).setVelocity(0);
        (unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).anims.play('attack', true);
        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.player.player) {
                    PlayerHealth.playerHealth.playerTakeDamage(this.unitEnemyDamage);
                    this.showDamageOverlay();
                }
            },
            loop: false
        });
    }

    private attackUnit(unitEnemy: Phaser.GameObjects.GameObject) {
        (unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).setVelocity(0);
        (unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).anims.play('attack', true);
        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                UnitSpawner.unitSpawner.takeDamage(this.unitEnemyDamage, Unit.unit as unknown as Phaser.Physics.Arcade.Sprite);
            },
            loop: false
        });
    }

    private followEnemy(unitEnemy: Phaser.GameObjects.GameObject, speed: number) {
        this.scene.physics.moveToObject(unitEnemy, this.player.player as unknown as Phaser.Physics.Arcade.Sprite, speed);
        (unitEnemy as unknown as Phaser.Physics.Arcade.Sprite).anims.play('walk');
    }

    private showDamageOverlay() {
        this.unitEnemyDamageOverlay = this.scene.add.text(this.player.player.x, this.player.player.y - 50, `${this.unitEnemyDamage}`, {
            fontSize: '24px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4,
        });

        this.scene.tweens.add({
            targets: this.unitEnemyDamageOverlay,
            y: this.player.player.y - 100,
            alpha: 0,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                this.unitEnemyDamageOverlay.destroy();
            }
        });
    }
}

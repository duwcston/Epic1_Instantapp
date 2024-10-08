export class Enemy {
    scene: Phaser.Scene;
    background: Phaser.GameObjects.Image;
    enemy: SpineGameObject;

    constructor(scene: Phaser.Scene, background: Phaser.GameObjects.Image) {
        this.scene = scene;
        this.background = background;
        this._createEnemyImage(this.scene.scale.width, this.scene.scale.height / 2 + 80);
    }

    private _createEnemyImage(x: number, y: number) {
        this.enemy = this.scene.add.spine(x, y, 'athena');
        this.scene.physics.add.existing(this.enemy as unknown as Phaser.Physics.Arcade.Image);
        this.enemy.addAnimation(0, 'idle', true, 0);
        this._flipSpine(true, 1);
        const body = this.enemy.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setGravityY(300);

        this.scene.physics.add.collider(this.enemy as unknown as Phaser.Physics.Arcade.Image, this.background, () => {});
    }

    private _flipSpine(flip: boolean, scale: number) {
        const body = this.enemy.body as Phaser.Physics.Arcade.Body;
        body.setSize(150, 150);
        this.enemy.scaleX = flip ? -scale : scale;

        if (flip) {
            body.setOffset(200, 50);
        } else {
            body.setOffset(50, 50);
        }
    }
}

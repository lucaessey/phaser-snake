import { Scene } from 'phaser';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        const walls = this.physics.add.staticGroup();

        walls.create(0, 0, null).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, 16).refreshBody();
        walls.create(0, this.cameras.main.height - 16, null).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, 16).refreshBody();
        walls.create(0, 0, null).setOrigin(0, 0).setDisplaySize(16, this.cameras.main.height).refreshBody();
        walls.create(this.cameras.main.width - 16, 0, null).setOrigin(0, 0).setDisplaySize(16, this.cameras.main.height).refreshBody();
    }
}

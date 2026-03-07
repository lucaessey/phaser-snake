import { Scene } from 'phaser';

export class SettingsScreen extends Scene
{
    constructor ()
    {
        super('SettingsScreen');
    }

    create ()
    {
        // Dark background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8).setOrigin(0, 0);

        const title = this.add.text(this.cameras.main.width / 2, 100, 'Settings', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Speed setting (1 to 20 tiles per second)
        let currentSpeed = parseInt(localStorage.getItem('snakeSpeed')) || 5;

        const speedLabel = this.add.text(this.cameras.main.width / 2, 250, 'Snake Speed (Tiles/sec)', {
            fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const speedValueText = this.add.text(this.cameras.main.width / 2, 320, currentSpeed.toString(), {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);

        const decreaseBtn = this.add.text(this.cameras.main.width / 2 - 100, 320, '<', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        const increaseBtn = this.add.text(this.cameras.main.width / 2 + 100, 320, '>', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        decreaseBtn.on('pointerdown', () => {
            if (currentSpeed > 1) {
                currentSpeed--;
                speedValueText.setText(currentSpeed.toString());
                localStorage.setItem('snakeSpeed', currentSpeed);
            }
        });

        increaseBtn.on('pointerdown', () => {
            if (currentSpeed < 20) {
                currentSpeed++;
                speedValueText.setText(currentSpeed.toString());
                localStorage.setItem('snakeSpeed', currentSpeed);
            }
        });

        // Food type setting (Apple, Banana, Eggplant, Jerry, or Sushi)
        let currentFood = localStorage.getItem('foodType') || 'apple';
        const foodOptions = ['apple', 'banana', 'eggplant', 'jerry', 'sushi'];

        const foodLabel = this.add.text(this.cameras.main.width / 2, 400, 'Food Type', {
            fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const foodValueText = this.add.text(this.cameras.main.width / 2, 450, currentFood.charAt(0).toUpperCase() + currentFood.slice(1), {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffff00',
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        foodValueText.on('pointerdown', () => {
            let currentIndex = foodOptions.indexOf(currentFood);
            currentIndex = (currentIndex + 1) % foodOptions.length;
            currentFood = foodOptions[currentIndex];
            foodValueText.setText(currentFood.charAt(0).toUpperCase() + currentFood.slice(1));
            localStorage.setItem('foodType', currentFood);
        });

        const backButton = this.add.text(this.cameras.main.width / 2, 550, 'Back', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('TitleScreen');
        });
    }
}

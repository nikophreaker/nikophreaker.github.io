import Phaser from "../lib/phaser.js";

export default class GameOver extends Phaser.Scene {
    constructor() {
        super('game-over')
    }

    create() {
        const width = this.scale.width
        const height = this.scale.height
        this.add.text(width * 0.5, height * 0.5, 'Game Over', {
                fontSize: 48
            })
            .setOrigin(0.5)

        this.add.text(width * 0.5, height * 0.6, '<Press to play again>', {
                fontSize: 12
            })
            .setOrigin(0.5)

        let scene = this;
        scene.input.on('pointerup', () => {
            this.scene.start('game')
        })

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('game')
        })
    }
}
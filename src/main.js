import Phaser from "./lib/phaser.js";
import Game from "./scenes/Game.js";
import GameOver from "./scenes/GameOver.js";

console.dir(Phaser);

export default new Phaser.Game({
    type: Phaser.AUTO,
    // width: 480,
    // height: 640,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [Game, GameOver],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y:200
            },
            debug: false
        }
    }
})
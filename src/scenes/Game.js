import Phaser from "../lib/phaser.js";
import Carrot from "../game/Carrot.js";

export default class Game extends Phaser.Scene {

    init() {
        this.carrotsCollected = 0
    }

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    platforms

    /** @type {Phaser.Physics.Arcade.Group} */
    carrots

    /** @type {Phaser.GameObjects.Text} */
    carrotsCollectedText

    /** @type {Phaser.GameObjects.Text} */
    nameText

    /**
     * @param {Phaser.Physics.Arcade.Sprite} player
     * @param {Carrot} carrot
     **/
    handleCollectCarrot(player, carrot) {
        // hide from display
        this.carrots.killAndHide(carrot)

        // disable from physics world
        this.physics.world.disableBody(carrot.body)

        /** 3. make this.carrotsCollected increase when overlap with carrot
         *     and score change in windows
         *  
         *     Your code below here
         */
        this.carrotsCollected++
        const value = `Carrots: ${this.carrotsCollected}`
        this.carrotsCollectedText.text = value
    }

    constructor() {
        super("game")
    }

    preload() {
        this.load.image('background', 'assets/bg_layer1.png')
        this.load.image('platform', 'assets/ground_grass.png')
        this.load.image('bunny-stand', 'assets/bunny1_stand.png')
        this.load.image('carrot', 'assets/carrot.png')
        this.load.image('bunny-jump', 'assets/bunny1_jump.png')
    }

    create() {
        this.add.image(window.innerWidth, window.innerHeight, 'background')
            .setScrollFactor(1, 0)
            .setPosition(240, 320)

        //create the group
        this.platforms = this.physics.add.staticGroup()

        //then create 5 platform
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(80, 400)
            const y = 150 * i

            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = this.platforms.create(x, y, 'platform')
            platform.scale = 0.5

            /** @type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body
            body.updateFromGameObject()
        }

        this.player = this.physics.add.sprite(240, 320, 'bunny-stand')
            .setScale(0.5)

        this.physics.add.collider(this.platforms, this.player)

        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false

        this.cameras.main.startFollow(this.player)

        this.cameras.main.setDeadzone(this.scale.width * 1.5)

        this.cursors = this.input.keyboard.createCursorKeys()

        const carrot = new Carrot(this, 240, 320, 'carrot')
        this.add.existing(carrot)

        this.carrots = this.physics.add.group({
            classType: Carrot
        })

        this.carrots.get(240, 320, 'carrot')

        this.physics.add.collider(this.platforms, this.carrots)
        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot,
            undefined,
            this
        )

        let player = this.player;
        if (typeof player !== "undefined") {
            window.addEventListener("deviceorientation", function (event) {
                var x = event.beta;
                var y = event.gamma;
                player.setVelocityX(y);
            }, true);
        }

        const style = {
            color: '#000',
            fontSIze: 24
        }
        this.carrotsCollectedText = this.add.text(window.innerWidth / 2, 10, 'Carrots: 0', style)
            .setScrollFactor(0)
            .setOrigin(0.5, 0)

        this.setNameText()

        /** 1. add object text below score like Name: -
         *  Your answer below here
         * */ 
        this.nameText = this.add.text(window.innerWidth / 2, 30, 'Name: -', style)
            .setScrollFactor(0)
            .setOrigin(0.5, 0)
    }

    setNameText(){
        /** 2. Make function to fetch api from https://my-json-server.typicode.com/typicode/demo/db
         *      and set text of nameText with response profile name
         * Your answer below here
         * */ 
        fetch('https://my-json-server.typicode.com/typicode/demo/db', {
            method: 'get',
            headers: {'Content-Type': 'application/json'}
        }).then( res => {
            res.json().then( res2 => {
                const value = `Name: ${res2.profile.name}` 
                this.nameText.text = value
            })
        }).catch( err => {
            console.log(err)
        });
    }

    update(t, dt) {
        this.platforms.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child
            const scrollY = this.cameras.main.scrollY
            if (platform.y >= scrollY + 700) {
                platform.y = scrollY - Phaser.Math.Between(50, 100)
                platform.body.updateFromGameObject()

                // create a carrot above the platform being reused
                this.addCarrotAbove(platform)
            }
        })

        this.platforms.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child
            const scrollY = this.cameras.main.scrollY
            if (platform.y >= scrollY + 700) {
                platform.y = scrollY - Phaser.Math.Between(50, 100)
                platform.body.updateFromGameObject()
            }
        });

        const touchingDown = this.player.body.touching.down

        if (touchingDown) {
            this.player.setVelocityY(-300)
            this.player.setTexture('bunny-jump')
        } else if (this.cursors.left.isDown && !touchingDown) {
            this.player.setVelocityX(-200)
        } else if (this.cursors.right.isDown && !touchingDown) {
            this.player.setVelocityX(200)
        } else {
            this.player.setVelocityX(0)
        }

        const vy = this.player.body.velocity.y
        if (vy > 0 && this.player.texture.key !== 'bunny-stand') {
            this.player.setTexture('bunny-stand')
        }
        this.horizontalWrap(this.player)

        const bottomPlatform = this.findBottomMostPlatform()
        if (this.player.y > bottomPlatform.y + 200) {
            this.scene.start('game-over')
            this.scene.stop('game')
        }
    }

    /**
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    horizontalWrap(sprite) {
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth = this.scale.width
        if (sprite.x < -halfWidth) {
            sprite.x = gameWidth + halfWidth
        } else if (sprite.x > gameWidth + halfWidth) {
            sprite.x = -halfWidth
        }
    }

    /**
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    addCarrotAbove(sprite) {
        const y = sprite.y - sprite.displayHeight

        /** @type {Phaser.Physics.Arcade.Sprite} */
        const carrot = this.carrots.get(sprite.x, y, 'carrot')

        carrot.setActive(true)
        carrot.setVisible(true)

        this.add.existing(carrot)

        // update the physics body size
        carrot.body.setSize(carrot.width, carrot.height)

        this.physics.world.enable(carrot)

        return carrot
    }

    findBottomMostPlatform() {
        const platforms = this.platforms.getChildren()
        let bottomPlatform = platforms[0]

        for (let i = 1; i < platforms.length; ++i) {
            const platform = platforms[i]

            // discard any platforms that are above current
            if (platform.y < bottomPlatform.y) {
                continue
            }

            bottomPlatform = platform
        }

        return bottomPlatform
    }

}
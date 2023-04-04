let config = {
    type: Phaser.AUTO,
    width: 420,
    height: 290,
    parent: "game-container",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};


let game = new Phaser.Game(config);

let obstaclePos = config.width + 20;
let obstacle;
let cactus;
let ground;
let river;
let clouds;
let score = 0;
let highScore = 0;
let scoreText;
let overlay;
let pauseText;
let fontLoaded = false;
let cloudsInfo = {};
let gameStarted = false;
let spaceKey;
let soundtrack;
let firstSpacePress = true;

function preload () {
    this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    this.load.audio('ost', 'assets/ost.mp3')
    this.load.audio('jump', 'assets/jump.wav');
    this.load.audio('score', 'assets/correct.wav');
    this.load.audio('gameover', 'assets/wrong.wav');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('sky', './assets/game/Background/background_0001.png');
    this.load.image('shallowWater', './assets/game/Tiles/tile_0053.png');
    this.load.image('water', './assets/game/Tiles/tile_0073.png');
    this.load.image('ground', './assets/game/Tiles/tile_0122.png');
    this.load.image('grass', './assets/game/Tiles/tile_0022.png');
    this.load.image('cactus', './/assets/game/Tiles/tile_0127.png');
    this.load.image('lcloud', './assets/game/Tiles/tile_0153.png');
    this.load.image('ccloud', './assets/game/Tiles/tile_0154.png');
    this.load.image('rcloud', './assets/game/Tiles/tile_0155.png');
}

function create () {
    loadAudios(this);
    loadFont(this);
    createBackgroud(this);
    ground = createGround(this);
    river = createRiver(this);
    createCactus(this);
    clouds = creatClouds(this);
    createScore(this);
    player = createPlayer(this);

    overlay = this.add.graphics(0, 0)
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, config.width, config.height);
    
    this.physics.add.collider(player, cactus, onColision, null, this); 
    this.physics.add.collider(player, ground);
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update () {
    if (spaceKey.isDown && !gameStarted) {
        gameStarted = true;
        firstSpacePress = true;
        soundtrack.play();
    };

    if (!gameStarted) return;

    playerControls(this);
    overlay.setVisible(false);
    pauseText.setVisible(false);
        
    moveObject(cactus);
    ground.getChildren().forEach((child) => moveObject(child));
    river.getChildren().forEach((child) => moveObject(child));

    clouds.forEach((c) => {
        c.getChildren().forEach((child) => {
            moveObjectAndRandom(child, -.2);
        });
    });
    
    updateScore();
}

function loadAudios(game) {
    game.sound.add('jump');
    game.sound.add('score');
    game.sound.add('gameover');
    soundtrack = game.sound.add('ost', { loop: true, volume: 0.5 });
}

function loadFont(game) {
    WebFont.load({
        google: {
            families: ["Press Start 2P"]
        },
        active: () => {
            fontLoaded = true;
            createScore(game);
                
        }

    });
}

function moveObject(obstacle, speed = -2) { 
    obstacle.x = obstacle.x + speed;
    if (obstacle.x < -24 ) {
        obstacle.x = obstaclePos;
    }
}

function moveObjectAndRandom(obstacle , speed = -2) {
    obstacle.x = obstacle.x + speed;
    let y;
    let x;
    if (obstacle.x < -24 ) {
        let info = cloudsInfo[obstacle.id];
        if (info && !obstacle.isFirst) {
            y = info.y;
            x = info.x;
        } else {
            y = getY() / 2;
            x = Phaser.Math.Between(obstaclePos, obstaclePos + 500);
            cloudsInfo[obstacle.id] = { x, y };
        }

        obstacle.x = x;
        obstacle.y = y;
    }
}

function createPlayer(game) {
    player = game.physics.add.sprite(100, config.height - 105, 'dude');
    player.setBounce(0);
    player.setCollideWorldBounds(true);
    animatePlayer(game, player);
    return player;
}

function animatePlayer(game, player) {
    game.anims.create({
        key: 'left',
        frames: game.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    game.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    game.anims.create({
        key: 'right',
        frames: game.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
}

function createBackgroud(game) {
    let graphics = game.add.graphics(0, 0);
    graphics.fillStyle(0xdff6f5, 1);
    graphics.fillRect(0, 0, config.width, config.height / 2);

    let graphics2 = game.add.graphics(0, config.height / 2);
    graphics2.fillStyle(0xffffff, 1);
    graphics2.fillRect(0, config.height / 2, config.width, config.height / 2);

    backgroundGroup = game.add.group();
    renderLoop((x, y) => backgroundGroup.create(x, y, 'sky'), config.height / 2);
}

function createRiver(game) {
    let platforms = game.physics.add.staticGroup();
    let deepWater = renderLoop((x, y) => platforms.create(x, y, 'water'), config.height - 9, 18);    
    let shallowWater = renderLoop((x, y) => platforms.create(x, y, 'shallowWater'), config.height - 18, 18);
    return platforms; 
}

function createGround(game) {
    ground = game.physics.add.staticGroup();
    let ref = config.height - 18;
    renderLoop((x, y) => ground.create(x, y, 'ground'), ref, 18);
    renderLoop((x, y) => ground.create(x, y, 'ground'), ref - 18, 18);
    renderLoop((x, y) => ground.create(x, y, 'ground'), ref - 36, 18);
    renderLoop((x, y) => ground.create(x, y, 'grass'), ref - 54, 18);

    return ground;
}

function createCactus(game) {
    let ref = config.height;
    cactus = game.physics.add.image(obstaclePos, ref - 99, 'cactus').setScale(2);
    cactus.body.allowGravity = false;
    cactus.setImmovable(true);
}

function setCloudInfo(c) {
    let id = Phaser.Math.Between(0, 1000000);
    c.forEach((child) => child.id = id);
    c[0].isFirst = true;
    return c;
}

function makeCloud(platforms, x, y) {
    let c = [
        platforms.create(x, y, 'lcloud'), 
        platforms.create(x + 18, y, 'ccloud'),
        platforms.create(x + 36, y, 'rcloud'),
    ];
    return setCloudInfo(c); 
}

function makeMediumCloud(platforms, x, y) {
    let c = [
        platforms.create(x, y, 'lcloud'),
        platforms.create(x + 18, y, 'ccloud'),
        platforms.create(x + 36, y, 'ccloud'),
        platforms.create(x + 54, y, 'rcloud'),
    ]
    return setCloudInfo(c); 
}

function makeLongCloud(platforms, x, y) {
    let c = [
        platforms.create(x, y, 'lcloud'),
        platforms.create(x + 18, y, 'ccloud'),
        platforms.create(x + 36, y, 'ccloud'),
        platforms.create(x + 54, y, 'ccloud'),
        platforms.create(x + 72, y, 'rcloud'),
    ];
    return setCloudInfo(c);
}

function creatClouds(game) {
    let clouds = game.physics.add.staticGroup();

    makeCloud(clouds, getX(), getY() / 2);
    makeCloud(clouds, getX(), getY() / 2);
    makeCloud(clouds, getX(), getY() / 2);


    let mediumClouds = game.physics.add.staticGroup();
    makeMediumCloud(mediumClouds, getX(), getY() / 2);
    makeMediumCloud(mediumClouds, getX(), getY() / 2);

    let longClouds = game.physics.add.staticGroup();
    makeLongCloud(longClouds, getX(), getY() / 2);
    makeLongCloud(longClouds, getX(), getY() / 2);

    return [clouds, mediumClouds, longClouds];
}

function generateObstacle(x, y) {
    if(!obstacle){
        obstacle =  platforms.create(x, y, 'ground').setScale(.2).refreshBody();
    }
    moveObject(obstacle);
}

function playerControls(game) {
    let cursor = game.input.keyboard.createCursorKeys();
    if (player.body) { 
        player.body.setGravityY(0);
        player.body.setDrag(0, 0);
    }
    if (player.anims) player.anims.play('right', !!player.body.touching.down);
    if (cursor.space.isDown && player.body.touching.down && !firstSpacePress) {
        player.setVelocityY(-300);
        game.sound.play('jump'); 
    }
    if (cursor.space.isUp) {
        firstSpacePress = false;
    }
}

function createScore(game) {
    score = 0;
    if (fontLoaded) {
        const style = {
            font: "10px 'Press Start 2P'",
            fill: "#000"
        };
        scoreText = game.add.text(config.width - 130 , 16, '', style);
        highScoreText = game.add.text(20, 16, 'high score: ' + highScore, style);
        pauseText = game.add.text(config.width / 5, config.height / 2, 'Pressione a tecla de espaço \n       para começar', {...style, fill: '#fff'});
    }
}

function updateScore() {
    score += 5;
    if (score % 5000 === 0) {
        game.sound.play('score');   
    }
    if (fontLoaded) {
        scoreText.setText('score: ' + score);
    }
}

function onColision(player, obstacle) {
    this.sound.pauseAll();
    this.sound.play('gameover');
    this.scene.restart();
    if (score > highScore) {
        highScore = score;
    }
    gameStarted = false;
}

// Helper functions
function renderLoop(fn, y, increment = 24) {
    let cloudPos = 0;
    let objs = [];
    while(cloudPos < config.width + 48) {
        objs.push(fn(cloudPos, y));
        cloudPos += increment;
    }
    return objs;
}

function getX() {
    return Phaser.Math.Between(0, config.width);
}

function getY() {
    return Phaser.Math.Between(0, config.height);
}
  
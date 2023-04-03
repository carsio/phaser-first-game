let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
let obstaclePos = 824;

let obstacle;
let cactus;
let ground;
let river;
let clouds;
let score = 0;
let highScore = 0;
let scoreText;
let fontLoaded = false;

let cloudsInfo = {};

function preload () {
    this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
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
    loadFont(this);
    createBackgroud(this);
    player = createPlayer(this);
    ground = createGround(this);
    river = createRiver(this);
    createCactus(this);
    clouds = creatClouds(this);
    createScore(this);
        
    this.physics.add.collider(player, cactus, onColision, null, this); 
    this.physics.add.collider(player, ground);
}

function update () {
    let cursor = this.input.keyboard.createCursorKeys();
    playerControls(cursor);
    moveObject(cactus);
    ground.getChildren().forEach((child) => moveObject(child));
    river.getChildren().forEach((child) => moveObject(child));

    clouds.forEach((c) => {
        let y = Phaser.Math.Between(0, 200);
        c.getChildren().forEach((child) => {
            moveObjectAndRandom(child, -.5);
        });
    });
    
    updateScore();
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

function moveObject(obstacle, speed = -3  ) { 
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
            console.log('first');
            y = Phaser.Math.Between(0, 250);
            x = Phaser.Math.Between(obstaclePos, obstaclePos + 500);
            cloudsInfo[obstacle.id] = { x, y };
            
        }

        obstacle.x = x;
        obstacle.y = y;
    }
}

function createPlayer(game) {
    player = game.physics.add.sprite(100, 300, 'dude');
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
    graphics.fillRect(0, 0, 800, 300);

    let graphics2 = game.add.graphics(0, 300);
    graphics2.fillStyle(0xffffff, 1);
    graphics2.fillRect(0, 300, 800, 300);

    backgroundGroup = game.add.group();
    renderLoop((x, y) => backgroundGroup.create(x, y, 'sky'), 300);
}

function createRiver(game) {
    let platforms = game.physics.add.staticGroup();
    let deepWater = renderLoop((x, y) => platforms.create(x, y, 'water'), 591, 18);    
    let shallowWater = renderLoop((x, y) => platforms.create(x, y, 'shallowWater'), 573, 18);
    return platforms; 
}

function createGround(game) {
    ground = game.physics.add.staticGroup();
    renderLoop((x, y) => ground.create(x, y, 'ground'), 558, 18);
    renderLoop((x, y) => ground.create(x, y, 'ground'), 540, 18);
    renderLoop((x, y) => ground.create(x, y, 'ground'), 522, 18);
    renderLoop((x, y) => ground.create(x, y, 'grass'), 504, 18);

    return ground;
}

function createCactus(game) {
    cactus = game.physics.add.image(504, 477, 'cactus').setScale(2);
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
    makeCloud(clouds, 500, 200);
    makeCloud(clouds, 700, 250);
    makeCloud(clouds, 400, 150);


    let mediumClouds = game.physics.add.staticGroup();
    makeMediumCloud(mediumClouds, 100, 100);
    makeMediumCloud(mediumClouds, 150, 200);

    let longClouds = game.physics.add.staticGroup();
    makeLongCloud(longClouds, 100, 100);
    makeLongCloud(longClouds, 150, 200);

    return [clouds, mediumClouds, longClouds];
}

function generateObstacle(x, y) {
    if(!obstacle){
        obstacle =  platforms.create(x, y, 'ground').setScale(.2).refreshBody();
    }
    moveObject(obstacle);
}

function playerControls(cursor) {
    if (player.body) { 
        player.body.setGravityY(0);
        player.body.setDrag(0, 0);
    }
    if (player.anims) player.anims.play('right', !!player.body.touching.down);
    if (cursor.space.isDown && player.body.touching.down) player.setVelocityY(-300); 
}

function createScore(game) {
    score = 0;
    if (fontLoaded) {
        const style = {
            font: "15px 'Press Start 2P'",
            fill: "#000"
        };
        scoreText = game.add.text(620, 16, '', style);
        highScoreText = game.add.text(20, 16, 'high score: ' + highScore, style);
    }
}

function updateScore() {
    score += 5;  
    if (fontLoaded) {
        scoreText.setText('score: ' + score);
    }
}

function onColision(player, obstacle) {
    this.scene.restart();
    if (score > highScore) {
        highScore = score;
    }
}

// Helper functions
function renderLoop(fn, y, increment = 24) {
    let cloudPos = 0;
    let objs = [];
    while(cloudPos < 848) {
        objs.push(fn(cloudPos, y));
        cloudPos += increment;
    }
    return objs;
}


  
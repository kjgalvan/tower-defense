function GameObj(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.frame = 0;
    this.sprites = {
        "roads": new SpriteObj(this.context,  "sprites/tileSheet.png", 2, 4),
        "slime": new SpriteObj(this.context, "sprites/SlimeIso.png", 4, 4),
    };
    this.map = new MapObj(new TileSetObj(this.sprites["roads"]));
    this.isometricSize = this.map.isometricSize;
    this.waves = [];
    this.init = function() {
        this.map.applyLevel({
            "mapArray": [
                [0, 5, 2, 2, 2, 6, 0],
                [0, 1, 0, 0, 0, 3, 6],
                [0, 1, 0, 0, 0, 0, 1],
                [2, 4, 0, 5, 6, 0, 1],
                [0, 0, 0, 1, 3, 2, 4],
                [0, 0, 0, 1, 0, 0, 0],
                [2, 2, 2, 4, 0, 0, 0]
            ],
            "startPoint": new PointObj(0, 6),
            "initialHeading": "E",
        });
        let wave = new WaveObj(this.sprites["slime"], 6, this.map.startPoint,
                               this.map.initialHeading, 32);
        this.waves.push(wave);
    };
    this.getNewCreepHeading = function(creep) {
        let gridPos = this.map.getGridPos(creep.point);
        return this.map.getNewHeading(gridPos, creep.heading);
    };
    this.update = function() {
        for (wave of this.waves) {
            wave.update(this.frame, this.isometricSize,
                        this.getNewCreepHeading.bind(this), this.map.directions);
        }
    };
    this.draw = function() {
        this.context.save();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.translate(this.canvas.width / 2, 0);
        this.map.draw();
        for (wave of this.waves)
            wave.draw();
        this.context.restore();
    };
    this.loop = function() {
        this.update();
        this.draw();
        ++this.frame;
    };
    return this;
}

function init() {
    let game = new GameObj(document.querySelector("CANVAS"));
    game.init();
    setInterval(game.loop.bind(game), 30);
}

function loadImage(Name) {
    let img = new Image();
    img.src = Name;
    return img;
}

// Object that holds a point and converts between Cartesian and Isometric
function PointObj(x, y, type="Cartesian") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.toCartesian = function() {
        return new PointObj((2*this.y + this.x) / 2, (2*this.y - this.x) / 2);
    };
    this.toIsometric = function() {
        return new PointObj(this.x - this.y, (this.x + this.y) / 2, "Isometric");
    };
    this.convert = function() {
        return this.type == "Cartesian" ? this.toIsometric() : this.toCartesian();
    };
    this.add = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(this.x + z, this.y + y, this.type);
    };
    this.multi = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(this.x * z, this.y * y, this.type);
    };
    this.div = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(this.x / z, this.y / y, this.type);
    };
    this.fdiv = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(
            Math.floor( this.x / z), Math.floor(this.y / y), this.type);
    };
    return this;
}

function SpriteObj(context, imgSheet, imgRows, imgCols) {
    this.context = context;
    this.img = loadImage(imgSheet);
    this.width = this.img.width / imgCols;
    this.height = this.img.height / imgRows;
    this.draw = function(col, row, x, y) {
        col = (col * this.width) % this.img.width;
        row = row * this.height;
        this.context.drawImage(this.img,
            col, row, this.width, this.height,  // Source
            x, y, this.width, this.height);  // Destination
    };
    return this;
}

function TileSetObj(sprite) {
    this.sprite = sprite;
    this.tiles = [
        {"x": 0, "y": 0, "getNewHeading": undefined},
        {"x": 2, "y": 0, "getNewHeading": (H) => { return H == "N" ? "N" : "S"; }},
        {"x": 3, "y": 0, "getNewHeading": (H) => { return H == "E" ? "E" : "W"; }},
        {"x": 0, "y": 1, "getNewHeading": (H) => { return H == "S" ? "E" : "N"; }},
        {"x": 1, "y": 1, "getNewHeading": (H) => { return H == "S" ? "W" : "N"; }},
        {"x": 2, "y": 1, "getNewHeading": (H) => { return H == "N" ? "E" : "S"; }},
        {"x": 3, "y": 1, "getNewHeading": (H) => { return H == "N" ? "W" : "S"; }},
        {"x": 1, "y": 0, "getNewHeading": undefined},
    ];
    this.getWidth = function() {
        return this.sprite.width;
    };
    this.getHeight = function() {
        return this.sprite.height;
    };
    this.draw = function(x, y, tileVal) {
        let tile = this.tiles[tileVal];
        this.sprite.draw(tile.x, tile.y, x, y);
    };
    this.movement = function(tileVal, heading) {
        return this.tiles[tileVal].getNewHeading(heading);
    };
    return this;
}

function MapObj(mapArray, tiles) {
    this.mapArray = mapArray;
    this.tiles = tiles;
    this.directions = {
        "N": (new PointObj(0, -1)).convert(),
        "S": (new PointObj(0, 1)).convert(),
        "E": (new PointObj(1, 0)).convert(),
        "W": (new PointObj(-1, 0)).convert(),
    };
    this.isometricSize = this.tiles.getWidth() / 2;
    this.getHeight = function() {
        return this.tiles.getHeight();
    };
    this.draw = function() {
        let rowAmount = mapArray.length, colAmount = mapArray[0].length;
        let iPoint, gridVal;
        for (x = 0; x < rowAmount; ++x) {
            for (y = 0; y < colAmount; ++y) {
                iPoint = (new PointObj(y, x)).convert().multi(this.isometricSize);
                gridVal = this.mapArray[x][y];
                this.tiles.draw(iPoint.x - this.isometricSize, iPoint.y, gridVal);
            }
        }
    };
    this.getGridPos = function(Point) {
        Point = Point.type == "Cartesian" ? Point : Point.convert();
        return Point.fdiv(this.isometricSize);
    };
    this.getNewHeading = function(gridPos, heading) {
        let gridVal = this.mapArray[gridPos.y][gridPos.x]
        return this.tiles.movement(gridVal, heading);
    };
    return this;
}

function CreepObj(sprite, point, heading) {
    this.sprite = sprite;
    this.point = point;
    this.heading = heading;
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.facing = 0, this.col = 0;
    this.changeFacing = { "N": 0, "S": 1, "E": 2, "W": 3, };
    this.setHeading = function(heading) {
        this.heading = heading;
        this.facing = this.changeFacing[heading];
    };
    this.move = function(heading) {
        this.point = this.point.add(heading.x, heading.y);
    };
    this.draw = function() {
        let drawPos = this.point.add(this.centerFeet.x, this.centerFeet.y);
        this.sprite.draw(this.col, this.facing, drawPos.x, drawPos.y);
    };
    this.nextCol = function() {
        ++this.col;
    };
}

function WaveObj(sprite, creepAmount, startingPoint, initialHeading) {
    this.sprite = sprite;
    this.creepAmount = creepAmount;
    this.point = startingPoint;
    this.initialHeading = initialHeading;
    this.creeps = [];
    this.cycle = 0
    this.createCreep = function() {
        this.creeps.push(new CreepObj(
            this.sprite, this.point, this.initialHeading));
        --this.creepAmount;
    };
    this.update = function(getNewHeading, directions) {
        if (this.cycle === 0 && this.creepAmount > 0)
            this.createCreep();
        for (creep of this.creeps) {
            if (this.cycle === 0) {
                creep.setHeading(getNewHeading(creep));
            }
            if (this.cycle % 5 === 0)
                creep.nextCol();
            creep.move(directions[creep.heading]);
        }
        if (this.cycle === 0) 
            this.cycle = 50;
        --this.cycle;
    };
    this.draw = function() {
        for (creep of this.creeps)
            creep.draw();
    };
}

function GameObj(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.sprites = {
        "roads": new SpriteObj(this.context,  "sprites/tileSheet.png", 2, 4),
        "slime": new SpriteObj(this.context, "sprites/SlimeIso.png", 4, 4),
    };
    this.mapArray = [
        [0, 5, 2, 2, 2, 6, 0],
        [0, 1, 0, 0, 0, 3, 6],
        [0, 1, 0, 0, 0, 0, 1],
        [2, 4, 0, 5, 6, 0, 1],
        [0, 0, 0, 1, 3, 2, 4],
        [0, 0, 0, 1, 0, 0, 0],
        [2, 2, 2, 4, 0, 0, 0]
    ];
    this.map = new MapObj(this.mapArray, new TileSetObj(this.sprites["roads"]));
    this.isometricSize = this.map.isometricSize;
    this.waves = [];
    this.gridToIso = function(gridPoint) {
        let iPoint = gridPoint.multi(this.isometricSize).convert();
        return iPoint.add(0, this.map.getHeight() / 2);
    };
    this.init = function() {
        let Start = this.gridToIso(new PointObj(0, 6));
        this.waves.push(new WaveObj(this.sprites["slime"], 6, Start, "E"));
    };
    this.getNewCreepHeading = function(creep) {
        let gridPos = this.map.getGridPos(creep.point);
        return this.map.getNewHeading(gridPos, creep.heading);
    };
    this.update = function() {
        for (wave of this.waves)
            wave.update(this.getNewCreepHeading.bind(this), this.map.directions);
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
    };
    return this;
}

function init() {
    let game = new GameObj(document.querySelector("CANVAS"));
    game.init();
    setInterval(game.loop.bind(game), 30);
}

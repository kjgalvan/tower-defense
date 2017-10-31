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

function TileObj(imgPath, getNewHeadingFunc) {
    this.img = loadImage(imgPath);
    this.getNewHeading = getNewHeadingFunc;
}

function MapObj(context, mapArray) {
    this.context = context;
    this.mapArray = mapArray;
    let Path = "roadTiles_v2/png/";
    this.tiles = [
        new TileObj(Path + "grass.png", undefined),
        new TileObj(Path + "roadNorth.png",
                    (H) => { return H == "E" ? "E" : "W" }),
        new TileObj(Path + "roadEast.png",
                    (H) => { return H == "N" ? "N" : "S"; }),
        new TileObj(Path + "roadCornerES.png",
                    (H) => { return H == "S" ? "E" : "N"; }),
        new TileObj(Path + "roadCornerNE.png",
                    (H) => { return H == "S" ? "W" : "N"; }),
        new TileObj(Path + "roadCornerWS.png",
                    (H) => { return H == "N" ? "E" : "S"; }),
        new TileObj(Path + "roadCornerNW.png",
                    (H) => { return H == "N" ? "W" : "S"; }),
    ];
    this.directions = {
        "N": (new PointObj(0, -1)).convert(),
        "S": (new PointObj(0, 1)).convert(),
        "E": (new PointObj(1, 0)).convert(),
        "W": (new PointObj(-1, 0)).convert(),
    };
    this.isometricSize = this.tiles[0].img.width / 2;
    this.draw = function() {
        let rowAmount = mapArray.length, colAmount = mapArray[0].length;
        let iPoint, gridVal;
        for (x = 0; x < rowAmount; ++x) {
            for (y = 0; y < colAmount; ++y) {
                iPoint = (new PointObj(y, x)).convert().multi(this.isometricSize);
                gridVal = this.mapArray[x][y];
                this.context.drawImage(this.tiles[gridVal].img,
                    iPoint.x - this.isometricSize, iPoint.y);
            }
        }
    };
    this.getGridPos = function(Point) {
        return Point.fdiv(this.isometricSize);
    };
    this.getNewHeading = function(gridPos, heading) {
        let gridVal = this.mapArray[gridPos.y][gridPos.x]
        return this.tiles[gridVal].getNewHeading(heading);
    };
    return this;
}

function SpriteObj(context, imgSheet, imgRows, imgCols) {
    this.context = context;
    this.img = loadImage(imgSheet);
    this.width = this.img.width / imgCols;
    this.height = this.img.height / imgRows;
    this.row = 0, this.col = 0;
    this.setRow = function(Row) {
        this.row = Row * this.height;
        if (this.row > this.img.height) throw "Out of sprite sheet bounds";
    };
    this.nextCol = function() {
        this.col = (this.col + this.width) % this.img.width;
    };
    this.draw = function(col, row, x, y) {
        col = (col * this.width) % this.img.width;
        row = row * this.height;
        this.context.drawImage(this.img,
            col, row, this.width, this.height,  // Source
            x, y, this.width, this.height);  // Destination
    };
    return this;
}

function CreepObj(sprite, point, heading) {
    this.sprite = sprite;
    this.point = point;
    this.heading = heading;
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.row = 0, this.col = 0;
    this.setHeading = function(heading) {
        this.heading = heading;
        switch (heading) {
            case "N": this.row = 0; break;
            case "S": this.row = 1; break;
            case "E": this.row = 2; break;
            case "W": this.row = 3; break;
        }
    };
    this.move = function(heading) {
        this.point = this.point.add(heading.x, heading.y);
    };
    this.draw = function() {
        let drawPos = this.point.add(this.centerFeet.x, this.centerFeet.y);
        this.sprite.draw(this.col, this.row, drawPos.x, drawPos.y);
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
    this.mapArray = [
        [0, 5, 1, 1, 1, 6, 0],
        [0, 2, 0, 0, 0, 3, 6],
        [0, 2, 0, 0, 0, 0, 2],
        [1, 4, 0, 5, 6, 0, 2],
        [0, 0, 0, 2, 3, 1, 4],
        [0, 0, 0, 2, 0, 0, 0],
        [1, 1, 1, 4, 0, 0, 0]
    ];
    this.map = new MapObj(this.context, this.mapArray);
    this.isometricSize = this.map.isometricSize;
    this.sprites = {
        "slime": new SpriteObj(this.context, "sprites/SlimeIso.png", 4, 4),
    };
    this.waves = [];
    this.gridToIso = function(gridPoint) {
        let iPoint = gridPoint.multi(this.isometricSize).convert();
        return iPoint.add(0, this.map.tiles[0].img.height / 2);
    };
    this.getGridPos = function(Point) {
        return Point.fdiv(this.isometricSize);
    };
    this.getNewCreepHeading = function(creep) {
        let gridPos = this.getGridPos(creep.point.convert());
        return this.map.getNewHeading(gridPos, creep.heading);
    };
    this.init = function() {
        this.waves.push(new WaveObj(
            this.sprites["slime"],
            6,
            this.gridToIso(new PointObj(0, 6)),
            "E",
            this.mapNav
        ));
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

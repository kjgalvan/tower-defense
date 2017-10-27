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

function MapObj(context, mapArray) {
    this.context = context;
    this.mapArray = mapArray;
    let basePath = "roadTiles_v2/png/";
    this.tiles = [
        loadImage(basePath + "grass.png"),
        loadImage(basePath + "roadNorth.png"),
        loadImage(basePath + "roadEast.png"),
        loadImage(basePath + "roadCornerES.png"),
        loadImage(basePath + "roadCornerNE.png"),
        loadImage(basePath + "roadCornerWS.png"),
        loadImage(basePath + "roadCornerNW.png"),
    ];
    this.isometricSize = this.tiles[0].width / 2;
    this.draw = function() {
        let rowAmount = mapArray.length, colAmount = mapArray[0].length;
        let iPoint;
        for (x = 0; x < rowAmount; ++x) {
            for (y = 0; y < colAmount; ++y) {
                iPoint = (new PointObj(y, x)).convert().multi(this.isometricSize);
                this.context.drawImage(this.tiles[this.mapArray[x][y]],
                    iPoint.x - this.isometricSize, iPoint.y);
            }
        }
    };
    return this;
}

function MapNavigationObj(mapArray, directions, isometricSize) {
    this.mapArray = mapArray;
    this.directions = directions;
    this.isometricSize = isometricSize;
    this.getGridPos = function(Point) {
        return Point.fdiv(this.isometricSize);
    };
    this.tileMovement = function(creep) {
        let gridPos = this.getGridPos(creep.point.convert());
        let gridVal = this.mapArray[gridPos.y][gridPos.x];
        switch (gridVal) {
            case 1: creep.heading = creep.heading == "E" ? "E" : "W"; break;
            case 2: creep.heading = creep.heading == "N" ? "N" : "S"; break;
            case 3: creep.heading = creep.heading == "S" ? "E" : "N"; break;
            case 4: creep.heading = creep.heading == "S" ? "W" : "N"; break;
            case 5: creep.heading = creep.heading == "N" ? "E" : "S"; break;
            case 6: creep.heading = creep.heading == "N" ? "W" : "S"; break;
        }
    };
}

function SpriteObj(imgSheet, rows, cols) {
    this.img = loadImage(imgSheet);
    this.width = this.img.width / cols;
    this.height = this.img.height / rows;
    return this;
}

function CreepObj(context, sprite, point, heading) {
    this.context = context;
    this.sprite = sprite;
    this.point = point;
    this.heading = heading;
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.move = function(heading) {
        this.point = this.point.add(heading.x, heading.y);
    };
    this.draw = function() {
        let drawPos = this.point.add(this.centerFeet.x, this.centerFeet.y);
        this.context.drawImage(this.sprite.img,
            0, 0, this.sprite.width, this.sprite.height,  // Source
            drawPos.x, drawPos.y, this.sprite.width, this.sprite.height);  // Destination
    };
}

function WaveObj(context, sprite, creepAmount, startingPoint, initialHeading, mapNav) {
    this.context = context;
    this.sprite = sprite;
    this.creepAmount = creepAmount;
    this.point = startingPoint;
    this.initialHeading = initialHeading;
    this.mapNav = mapNav;
    this.creeps = [];
    this.cycle = 0
    this.createCreep = function() {
        this.creeps.push(new CreepObj(
            this.context, this.sprite, this.point, this.initialHeading));
        --this.creepAmount;
    };
    this.update = function() {
        if (this.cycle === 0 && this.creepAmount > 0)
            this.createCreep();
        for (creep of this.creeps) {
            if (this.cycle === 0) {
                this.mapNav.tileMovement(creep);
            }
            creep.move(this.mapNav.directions[creep.heading]);
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

function TowerObj(context, sprite, point) {
    this.context = context;
    this.sprite = sprite;
    this.point = point;
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.draw = function() {
        let drawPos = this.point.add(this.centerFeet.x, this.centerFeet.y);
        this.context.drawImage(this.sprite.img,
            0, 0, this.sprite.width, this.sprite.height,  // Source
            drawPos.x, drawPos.y, this.sprite.width, this.sprite.height);  // Destination
    };
    this.upgrade = function() {
        this.sprite.setRow(1);
    };
}

function GameObj(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.directions = {
        "N": (new PointObj(0, -1)).convert(),
        "S": (new PointObj(0, 1)).convert(),
        "E": (new PointObj(1, 0)).convert(),
        "W": (new PointObj(-1, 0)).convert(),
        "NE": (new PointObj(1, -1)).convert(),
        "NW": (new PointObj(-1, -1)).convert(),
        "SE": (new PointObj(1, 1)).convert(),
        "SW": (new PointObj(-1, 1)).convert(),
    }
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
    this.mapNav = new MapNavigationObj(this.mapArray, this.directions, this.isometricSize);
    this.sprites = {
        "slime": new SpriteObj("sprites/Slime compact.png", 4, 4),
        "cannon": new SpriteObj("sprites/CannonMap.png", 3, 8),
    };
    this.waves = [], this.towers = [];
    this.gridToIso = function(gridPoint) {
        let iPoint = gridPoint.multi(this.isometricSize).convert();
        return iPoint.add(0, this.map.tiles[0].height / 2);
    };
    this.init = function() {
        this.waves.push(new WaveObj(
            this.context,
            this.sprites["slime"],
            6,
            this.gridToIso(new PointObj(0, 6)),
            "E",
            this.mapNav
        ));
        this.towers.push(new TowerObj(this.context, this.sprites["cannon"],
            this.gridToIso(new PointObj(0, 0))));
    };
    this.update = function() {
        for (wave of this.waves)
            wave.update();
    };
    this.draw = function() {
        this.context.save();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.translate(this.canvas.width / 2, 0);
        this.map.draw();
        for (wave of this.waves)
            wave.draw();
        for (tower of this.towers)
            tower.draw();
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

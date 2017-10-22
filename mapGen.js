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
        return new PointObj(this.x + z, this.y + (y ? y : z), this.type);
    };
    this.multi = function(z, y=undefined) {
        return new PointObj(this.x * z, this.y * (y ? y : z), this.type);
    };
    this.div = function(z, y=undefined) {
        return new PointObj(this.x / z, this.y / (y ? y : z), this.type);
    };
    this.fdiv = function(z, y=undefined) {
        return new PointObj(Math.floor(this.x / z),
                            Math.floor(this.y / (y ? y : z)), this.type);
    };
    this.mod = function(z, y=undefined) {
        return new PointObj(this.x % z, this.y % (y ? y : z), this.type);
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
    }
    return this;
}

function SpriteObj(context, imgSheet, rows, cols, point) {
    this.context = context;
    this.img = loadImage(imgSheet);
    this.width = this.img.width / cols;
    this.height = this.img.height / rows;
    this.point = point.add(-this.width / 2, -this.height);
    this.draw = function() {
        // image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
        this.context.drawImage(this.img,
            0, 0, this.width, this.height,  // Source
            this.point.x, this.point.y, this.width, this.height);  // Destination
    };
    this.move = function(heading) {
        this.point = this.point.add(heading.x, heading.y);
    };
    return this;
}

function GameObj(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.directions = {
        "north": (new PointObj(0, -1)).convert(),
        "south": (new PointObj(0, 1)).convert(),
        "east": (new PointObj(1, 0)).convert(),
        "west": (new PointObj(-1, 0)).convert(),
    };
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
    this.sprite = undefined;
    this.init = function() {
        let Point = (new PointObj(3, 0)).multi(this.isometricSize);
        let iPoint = Point.convert().add(0, this.map.tiles[0].height / 2);
        this.sprite = new SpriteObj(
            this.context, "sprites/Slime compact.png", 4, 4, iPoint);
    }
    this.draw = function() {
        this.context.save();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.translate(this.canvas.width / 2, 0);
        this.map.draw();
        this.sprite.draw();
        this.context.restore();
    };
    this.getGridPos = function(Point) {
        return Point.fdiv(this.isometricSize);
    };
    this.getTilePos = function(Point) {
        return Point.mod(this.isometricSize);
    };
    this.loop = function() {
        this.draw();
        this.sprite.move(this.directions["south"]);
        console.log("Grid", this.getGridPos(this.sprite.point.convert()));
        console.log("Tile", this.getTilePos(this.sprite.point.convert()));
    };
    return this;
}

function init() {
    let game = new GameObj(document.querySelector("CANVAS"));
    game.init();
    setInterval(game.loop.bind(game), 30);
}

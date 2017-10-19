function loadImage(Name) {
    const basePath = "roadTiles_v2/png/";
    let img = new Image();
    img.src = basePath + Name + ".png";
    return img;
}

// Object that holds a point and converts between Cartesian and Isometric
function PointObj(x, y, type="Cartesian") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.convert = function() {
        let Point;
        if (this.type == "Cartesian") {
            Point = new PointObj(
                this.y - this.x, (this.x + this.y) / 2, "Isometric");
        }
        else {
            Point = new PointObj(
                (2*this.y + this.x) / 2, (2*this.y - this.x) / 2, "Cartesian");
        }
        return Point;
    };
    return this;
}

function MapObj(canvas, context, mapArray) {
    this.canvas = canvas;
    this.context = context;
    this.mapArray = mapArray;
    this.isometricSize = 50;
    this.tiles = [
        loadImage("grass"),
        loadImage("roadNorth"),
        loadImage("roadEast"),
        loadImage("roadCornerES"),
        loadImage("roadCornerNE"),
        loadImage("roadCornerWS"),
        loadImage("roadCornerNW"),
    ];
    this.draw = function() {
        let rowAmount = mapArray.length, colAmount = mapArray[0].length;
        for (i = 0; i < rowAmount; ++i) {
            for (j = 0; j < colAmount; ++j) {
                iPoint = (new PointObj(i, j)).convert();
                this.context.drawImage(
                    this.tiles[this.mapArray[i][j]],
                    iPoint.x*this.isometricSize - this.isometricSize,
                    iPoint.y*this.isometricSize);
            }
        }
    }
    return this;
}

function SpriteObj(context, imgSheet, rows, cols, walkingOffset) {
    this.context = context;
    this.img = new Image();
    this.img.src = imgSheet;
    this.width = this.img.width / cols;
    this.height = this.img.height / rows;
    this.walkingOffset = walkingOffset;
    this.verticalOffset = 25;
    this.draw = function(x, y) {
        // image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
        this.context.drawImage(this.img,
            0, 0, this.width, this.height,  // Source
            x - this.width / 2, y + this.verticalOffset - this.height / 2 - this.walkingOffset, this.width, this.height);  // Destination
    }
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
    this.map = new MapObj(this.canvas, this.context, this.mapArray);
    this.sprite = new SpriteObj(this.context, "D:/CollegeWork/CS262_GameDesign/Project/sprites/Slime compact.png", 4, 4, 5);
    this.init = function() {
        this.context.translate(this.canvas.width / 2, 0);
        this.map.draw();
        let iPoint = (new PointObj(3, 0)).convert();
        this.sprite.draw(iPoint.x * 50, iPoint.y * 50);
    }
    return this;
}

function init() {
    let game = new GameObj(document.querySelector("CANVAS"));
    game.init();
}

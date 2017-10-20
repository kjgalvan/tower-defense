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
        return new PointObj(this.y - this.x, (this.x + this.y) / 2, "Isometric");
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
    return this;
}

function MapObj(canvas, context, mapArray) {
    this.canvas = canvas;
    this.context = context;
    this.mapArray = mapArray;
    this.isometricSize = 50;
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
    this.img = loadImage(imgSheet);
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
    this.sprite = new SpriteObj(this.context, "sprites/Slime compact.png", 4, 4, 5);
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

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
    this.iAdd = function(point) {
        this.x += point.x;
        this.y += point.y;
    },
    this.sub = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(this.x - z, this.y - y, this.type);
    };
    this.aSub = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(Math.abs(this.x - z), Math.abs(this.y - y), this.type);
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
    this.iDiv = function(int) {
        this.x=this.x / int;
        this.y=this.y / int;
    };
    this.distFrom = function(point) {
        let difference = this.aSub(point.x, point.y);
        return Math.sqrt((difference.x * difference.x) + (difference.y * difference.y));
    };
    this.angleBetween = function(point) {	  
        let degrees = Math.atan2(this.x - point.x, this.y - point.y) * 180 / Math.PI; 
        degrees = Math.abs(degrees);  
        return degrees;	
    }; 
    this.compAngle = function(angle) {
        let compAngle = 90;
        return compAngle - angle;
    };
    this.change = function(x,y) {
        this.x = x;
        this.y = y;
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

function MenuDisplayObj(sprite, origin, spacing) {
    this.sprite = sprite;
    this.origin = origin;
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.spacing = spacing === undefined ? new PointObj(0, 0) : spacing;
    this.draw = function(sheetX, sheetY, Point) {
        Point = this.origin.add(
            Point.x * (this.sprite.width + this.spacing.x),
            Point.y * (this.sprite.height + this.spacing.y));
        this.sprite.draw(sheetX, sheetY, Point.x, Point.y);
    };
    this.cellClicked = function(point) {
        let fromOrigin = point.add(-origin.x,-origin.y);
        return fromOrigin.fdiv(this.sprite.width + this.spacing.x,this.sprite.height + this.spacing.y);
    };
}

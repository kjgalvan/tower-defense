function TileSetObj(sprite) {
    this.sprite = sprite;
    this.tileMovement = [
        undefined,
        undefined,
        (H) => { return H == "N" ? "N" : "S"; },
        (H) => { return H == "E" ? "E" : "W"; },
        (H) => { return H == "S" ? "E" : "N"; },
        (H) => { return H == "S" ? "W" : "N"; },
        (H) => { return H == "N" ? "E" : "S"; },
        (H) => { return H == "N" ? "W" : "S"; },
    ];
    this.getWidth = function() {
        return this.sprite.width;
    };
    this.getHeight = function() {
        return this.sprite.height;
    };
    this.draw = function(x, y, tileVal) {
        this.sprite.draw(tileVal % 4, Math.floor(tileVal / 4), x, y);
    };
    this.movement = function(tileVal, heading) {
        return this.tileMovement[tileVal](heading);
    };
    return this;
}

function MapObj(tiles) {
    this.tiles = tiles;
    this.directions = {
        "N": (new PointObj(0, -1)).convert(),
        "S": (new PointObj(0, 1)).convert(),
        "E": (new PointObj(1, 0)).convert(),
        "W": (new PointObj(-1, 0)).convert(),
    };
    this.isometricSize = this.tiles.getWidth() / 2;
    this.mapArray = this.startPoint = this.initialHeading = undefined;
    this.gridToIso = function(gridPoint) {
        let iPoint = gridPoint.multi(this.isometricSize).convert();
        return iPoint.add(0, this.tiles.getHeight() / 2);
    };
    this.applyLevel = function(level) {
        this.mapArray = level.mapArray;
        this.startPoint = this.gridToIso(level.startPoint);
        this.initialHeading = level.initialHeading;
    };
    this.draw = function() {
        let rowAmount = this.mapArray.length, colAmount = this.mapArray[0].length;
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

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
        return gridPoint.multi(this.isometricSize).convert();
    };
    this.applyLevel = function(level) {
        this.mapArray = level.mapArray;
        this.startPoint = this.gridToIso(level.startPoint).add(0, this.tiles.getHeight() / 2);
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
    this.isMap = function(gridPoint) {
        try { return this.mapArray[gridPoint.y][gridPoint.x] != undefined; }
        catch (e) { return false; }
    };
    return this;
}

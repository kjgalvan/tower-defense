function GameObj(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.frame = 0;
    this.mousePos = new PointObj(-1, -1);
    this.clickedTower = undefined;
    this.sprites = {
        "towers": new SpriteObj(this.context, "sprites/Towers.png", 27, 8),
        "roads": new SpriteObj(this.context,  "sprites/tileSheet.png", 2, 4),
        "slime": new SpriteObj(this.context, "sprites/SlimeIso.png", 4, 4),
        "balls": new SpriteObj(this.context, "sprites/Energy Ball.png", 8, 12),
    };
    this.map = new MapObj(new TileSetObj(this.sprites["roads"]));
    this.towerMenu = new MenuDisplayObj(
        this.sprites["towers"], new PointObj(20, 380), new PointObj(30, 0));
    this.isometricSize = this.map.isometricSize;
    this.waves = [], this.towers = [];
    this.mouseToGrid = function() {
        let iMousePoint = new PointObj(this.mousePos.x - this.canvas.width / 2,
                                       this.mousePos.y, "isometric");
        return this.map.getGridPos(iMousePoint);
    };
    this.mouseMove = function(e) {
        let rect = canvas.getBoundingClientRect();
        this.mousePos.change(e.clientX - rect.x, e.clientY - rect.y);
    };
    this.getTowerAtPoint = function(point) {
        for (let tower of this.towers) {
            if (tower.point.equals(point.x, point.y))
                return tower;
        }
        return undefined;
    };
    this.mouseDown = function() {
        let clicked = this.towerMenu.cellClicked(this.mousePos);
        let mouseGridPos = this.mouseToGrid();
        if (clicked.cell.y === 0 && clicked.cell.x >= 0 && clicked.cell.x < 9)
        {
            this.clickedTower = new TowerObj(
                this.sprites["towers"], clicked.innerPos, clicked.cell.x * 3,
                false, this.sprites.balls);
        }
        else if (this.map.isMap(mouseGridPos) &&
                 this.map.getGridVal(mouseGridPos) === 0)
        {
            let tileCenter = this.map.gridToTileCenter(mouseGridPos);
            let tower = this.getTowerAtPoint(tileCenter);
            if (tower)
                tower.upgrade();
        }
    };
    this.mouseUp = function() {
        let mouseGridPos = this.mouseToGrid();
        if (this.clickedTower !== undefined && this.map.isMap(mouseGridPos) &&
            this.map.getGridVal(mouseGridPos) === 0)
        {
            let tileCenter = this.map.gridToTileCenter(mouseGridPos);
            let tower = this.getTowerAtPoint(tileCenter);
            if (!tower) {
                this.clickedTower.setPoint(tileCenter);
                this.clickedTower.isEmitterOn = true;
                this.towers.push(this.clickedTower);
            }
        }
        this.clickedTower = undefined;
    };
    this.highlightTile = function(gPoint) {
        let iPoint = this.map.gridToIso(gPoint);
        this.context.strokeStyle = "silver";
        this.context.fillStyle = "rgba(255, 255, 255, 0.20)";
        this.context.beginPath();
        this.context.moveTo(iPoint.x, iPoint.y);
        this.context.lineTo(iPoint.x + 50, iPoint.y + 25);
        this.context.lineTo(iPoint.x, iPoint.y + 50);
        this.context.lineTo(iPoint.x - 50, iPoint.y + 25);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
    };
    this.init = function() {
        this.map.applyLevel({
            "mapArray": [
                [0, 6, 3, 3, 3, 7, 0],
                [0, 2, 0, 0, 0, 4, 7],
                [0, 2, 0, 0, 0, 0, 2],
                [3, 5, 0, 6, 7, 0, 2],
                [0, 0, 0, 2, 4, 3, 5],
                [0, 0, 0, 2, 0, 0, 0],
                [3, 3, 3, 5, 0, 0, 0]
            ],
            "startPoint": new PointObj(0, 6),
            "initialHeading": "E",
        });
        let wave = new WaveObj(this.sprites["slime"], 6, this.map.startPoint,
                               this.map.initialHeading);
        this.waves.push(wave);
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
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
        for(tower of this.towers) {
            for(wave of this.waves) {
                for(creep of wave.creeps) {
                    if(tower.point.distFrom(creep.point) < 100) {
                        tower.setTarget(creep.point);
                        tower.emitter.update(tower.point.getVector(creep.point));
                        break;
                    }
                }
            }
        }
    };
    this.draw = function() {
        this.context.save();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < 9; ++i)
            this.towerMenu.draw(6, i*3, new PointObj(i, 0));
        this.context.translate(this.canvas.width / 2, 0);
        this.map.draw();
        if (this.map.isMap(this.mouseToGrid()))
            this.highlightTile(this.mouseToGrid());
        for (wave of this.waves)
            wave.draw();
        for (tower of this.towers)
            tower.draw();
        this.context.restore();
        if (this.clickedTower !== undefined) {
            this.clickedTower.draw(this.mousePos);
        }
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

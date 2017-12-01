function GameObj(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.frame = 0;
    this.mousePos = new PointObj(-1, -1);
    //this.towerOffset = new PointObj(-1,-1);
    this.clickedTower = undefined;
    this.sprites = {
        "towers": new SpriteObj(this.context, "sprites/Towers.png", 27, 8),
        "roads": new SpriteObj(this.context,  "sprites/tileSheet.png", 2, 4),
        "slime": new SpriteObj(this.context, "sprites/SlimeIso.png", 4, 4),
        "balls": new SpriteObj(this.context, "sprites/Energy Ball.png", 8, 12),
    };
    this.clickedTowerObj = new TowerObj(this.sprites["towers"], this.mousePos, 0, false, this.sprites.balls);
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
    this.mouseDown = function() {
        let cell = this.towerMenu.cellClicked(this.mousePos);
        if (cell.y === 0 && cell.x >= 0 && cell.x <= 8) {
            this.clickedTower = cell;
            this.clickedTowerObj.changeTower(this.clickedTower.x*3);
            this.towerOffset = this.towerMenu.origin.add(
                this.clickedTower.x * (this.towerMenu.sprite.width + this.towerMenu.spacing.x),
                this.clickedTower.y * (this.towerMenu.sprite.height + this.towerMenu.spacing.y));
            this.towerOffset = this.towerOffset.add(-this.mousePos.x,-this.mousePos.y);
        }
    };
    this.mouseUp = function() {
        if (this.clickedTower !== undefined && this.map.isMap(this.mouseToGrid()) && (this.map.getGridVal(this.mouseToGrid()) === 0)) {
            towerCheck = false;
            for (tower of this.towers) {
                if ((this.map.getGridPos(tower.point).x === this.mouseToGrid().x) && (this.map.getGridPos(tower.point).y === this.mouseToGrid().y))
                    towerCheck = true;
            }
            if (towerCheck === false) 
                this.towers.push(new TowerObj(this.sprites["towers"], this.map.gridToIso(this.mouseToGrid()).add(0, this.map.getTilesHeight() / 2),
                                    this.clickedTower.x*3, true, this.sprites.balls));
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
        if (this.clickedTower !== undefined)
            this.clickedTowerObj.move(this.mousePos);
        for(tower of this.towers) {
            for(wave of this.waves) {
                for(creep of wave.creeps) {
                    if(tower.point.distFrom(creep.point) < 100) {
                        //console.log(tower.point.getVector(creep.point));
                        tower.emitter.update(tower.point.getVector(creep.point));
                        //tower.emitter.update(new PointObj(20,20));
                        //console.log(tower.point);
                        //console.log(tower.point.angleBetween(creep.point));
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
        if (this.clickedTower !== undefined)
            this.clickedTowerObj.draw();
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

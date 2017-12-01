function TowerObj(sprite, point, level, emitter, partSprite) {
    this.sprite = sprite;
    this.point = point;
    this.emitter = new Emitter(this.point,new PointObj(2,2),100,1,partSprite);
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.level = level;
    this.col = 6;
    this.isEmitterOn = emitter;
    this.draw = function() {
        let drawPos = this.point.add(this.centerFeet.x, this.centerFeet.y);
        this.sprite.draw(this.col, this.level, drawPos.x, drawPos.y);
        if (this.isEmitterOn)
            this.emitter.draw();
    };
    this.upgrade = function() {
        this.level = (this.level + 1) % 3;
    };
    this.changeTower = function(level) {
        this.level = level;
    };
    this.move = function(point) {
        this.point = point;
    };
}


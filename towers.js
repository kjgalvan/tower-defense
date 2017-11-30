function TowerObj(sprite, point, level) {
    this.sprite = sprite;
    this.point = point;
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.level = level;
    this.col = 6;
    this.draw = function(point) {
        let drawPos = ((point === undefined)
            ? this.point.add(this.centerFeet.x, this.centerFeet.y)
            : this.point.add(point.x, point.y));
        this.sprite.draw(this.col, this.level, drawPos.x, drawPos.y);
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


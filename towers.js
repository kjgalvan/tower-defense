function TowerObj(context, sprite, point) {
    this.context = context;
    this.sprite = sprite;
    this.point = point;
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.level = this.col = 0;
    this.draw = function() {
        let drawPos = this.point.add(this.centerFeet.x, this.centerFeet.y);
        this.sprite.draw(this.col, this.level, drawPos.x, drawPos.y);
    };
    this.upgrade = function() {
        this.level = (this.level + 1) % 3;
    };
}

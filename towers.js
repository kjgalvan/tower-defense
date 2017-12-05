function TowerObj(sprite, point, type, emitterOn, partSprite) {
    this.sprite = sprite;
    this.point = point;
    this.emitter = new Emitter(this.point,new PointObj(0,0),300,1,partSprite);
    this.centerFeet = new PointObj(this.sprite.width / 2, this.sprite.height);
    this.type = type;
    this.level = 0;
    this.col = 6;
    this.isEmitterOn = emitterOn;
    this.draw = function(point) {
        let drawPos = ((point === undefined)
            ? this.point.sub(this.centerFeet.x, this.centerFeet.y)
            : this.point.add(point.x, point.y));
        this.sprite.draw(
            this.col, this.type + this.level, drawPos.x, drawPos.y);
        if (this.isEmitterOn)
            this.emitter.draw();
    };
    this.upgrade = function() {
        this.level += this.level < 2 ? 1 : 0;
    };
    this.setPoint = function(point) {
        this.point = point;
        this.emitter.location = point;
    };
    this.setTarget = function(point) {
        const span = 360 / 8, degreeOffset = span / 2;
        let result = Math.atan2(this.point.x - point.x, this.point.y - point.y) * 180 / Math.PI;
        let zeroDegreeIsUp = (result < 0 ? 360 + result : result) % 360;
        let angle = (zeroDegreeIsUp + 90) % 360;
        // Mirror so 0 degrees is on the left increasing clockwise
        let mirrorAngle = (angle > 180 ? 180 - angle + 360 : 180 - angle);
        this.col = Math.floor((mirrorAngle + degreeOffset) % 360 / span);
    };
}


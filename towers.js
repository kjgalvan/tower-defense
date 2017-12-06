function TowerObj(sprite, point, type, variations, emitterOn, partSprite) {
    this.sprite = sprite;
    this.point = point;
    this.type = type;
    this.variations = variations.slice(type, type + 3);
    this.isEmitterOn = emitterOn;
    this.emitter = new Emitter(this.point, new PointObj(0, 0), 80,
        this.variations[0].pAmount, partSprite);
    this.centerFeet = new PointObj(this.sprite.width / 2, this.sprite.height);
    this.level = 0;
    this.damage = this.variations[this.level].damage;
    this.pSize = this.variations[this.level].pSize;
    this.range = this.variations[this.level].range;
    this.reload = this.currentReload = this.variations[this.level].reload;
    this.speed = this.variations[this.level].speed;
    this.col = 6;
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
        this.damage = this.variations[this.level].damage;
        this.pSize = this.variations[this.level].pSize;
        this.range = this.variations[this.level].range;
        this.reload = this.variations[this.level].reload;
        this.speed = this.variations[this.level].speed;
    };
    this.setPoint = function(point) {
        this.point = point;
        this.emitter.location = point;
    };
    this.setTarget = function(point) {
        this.target = point;
        const span = 360 / 8, degreeOffset = span / 2;
        let result = Math.atan2(this.point.x - point.x, this.point.y - point.y) * 180 / Math.PI;
        let zeroDegreeIsUp = (result < 0 ? 360 + result : result) % 360;
        let angle = (zeroDegreeIsUp + 90) % 360;
        // Mirror so 0 degrees is on the left increasing clockwise
        let mirrorAngle = (angle > 180 ? 180 - angle + 360 : 180 - angle);
        this.col = Math.floor((mirrorAngle + degreeOffset) % 360 / span);
    };
}


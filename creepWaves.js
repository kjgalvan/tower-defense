function CreepObj(sprite, point, heading) {
    this.sprite = sprite;
    this.point = point;
    this.heading = heading;
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.facing = 0, this.col = 0;
    this.changeFacing = { "N": 0, "S": 1, "E": 2, "W": 3 };
    this.setHeading = function(heading) {
        this.heading = heading;
        this.facing = this.changeFacing[heading];
    };
    this.move = function(heading) {
        this.point = this.point.add(heading.x, heading.y);
    };
    this.draw = function() {
        let drawPos = this.point.add(this.centerFeet.x, this.centerFeet.y);
        this.sprite.draw(this.col, this.facing, drawPos.x, drawPos.y);
    };
    this.nextCol = function() {
        ++this.col;
    };
}

function WaveObj(sprite, creationAmount, startingPoint, initialHeading) {
    this.sprite = sprite;
    this.creationAmount = creationAmount;
    this.point = startingPoint;
    this.initialHeading = initialHeading;
    this.creeps = [];
    this.createCreep = function() {
        this.creeps.push(new CreepObj(
            this.sprite, this.point, this.initialHeading));
        --this.creationAmount;
    };
    this.update = function(frame, isometricSize, getNewHeading, directions) {
        if (this.creationAmount > 0 && frame % isometricSize == 0 )
            this.createCreep();
        for (creep of this.creeps) {
            if (frame % 5 == 0)
                creep.nextCol();
            if (frame % isometricSize == 0)
                creep.setHeading(getNewHeading(creep));
            creep.move(directions[creep.heading]);
        }
    };
    this.draw = function() {
        for (creep of this.creeps)
            creep.draw();
    };
}

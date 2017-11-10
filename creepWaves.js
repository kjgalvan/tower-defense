function CreepObj(sprite, point, heading, health) {
    this.sprite = sprite;
    this.point = point;
    this.heading = heading;
    this.health = health;
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.facing = 0, this.col = 0;
    this.changeFacing = { "N": 0, "S": 1, "E": 2, "W": 3, };
    this.setHeading = function(heading) {
        this.heading = heading;
        this.facing = this.changeFacing[heading];
    };
    this.move = function(heading) {
        this.point = this.point.add(heading.x, heading.y);
    };
    this.drawHealth = function(context, initHealth) {
        context.lineWidth = 2;
        context.strokeStyle = "Black";
        //context.strokeStyle = "rgb(40, 48, 68)"; // Gunmetal
        // context.fillStyle = "rgb(234, 82, 111)";  // Dark Pink
        context.fillStyle = "rgb(195, 49, 73)";  // Dingy Dungeon
        // context.fillStyle = "rgb(254, 93, 38)";  // Giants Orange
        // context.fillStyle = "rgb(200, 70, 48)";  // Persian Red
        // Current sprite SlimeIso too much padding
        context.strokeRect(
            this.point.x - this.sprite.width / 4 -1 , this.point.y + 8 - 1,
            23 + 2, 5 + 2);
        context.fillRect(
            this.point.x - this.sprite.width / 4, this.point.y + 8,
            this.health / initHealth * 23, 5);
    };
    this.draw = function() {
        let drawPos = this.point.add(this.centerFeet.x, this.centerFeet.y);
        this.sprite.draw(this.col, this.facing, drawPos.x, drawPos.y);
    };
    this.nextCol = function() {
        ++this.col;
    };
}

function WaveObj(sprite, creationAmount, startingPoint, initialHeading, initHealth) {
    this.sprite = sprite;
    this.creationAmount = creationAmount;
    this.point = startingPoint;
    this.initialHeading = initialHeading;
    this.initHealth = initHealth;
    this.creeps = [];
    this.createCreep = function() {
        this.creeps.push(new CreepObj(
            this.sprite, this.point, this.initialHeading, this.initHealth));
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
    this.draw = function(context) {
        for (creep of this.creeps)
            creep.drawHealth(context, this.initHealth);
        for (creep of this.creeps)
            creep.draw();
    };
}

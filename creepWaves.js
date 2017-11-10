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
        var gradient = context.createLinearGradient(
            this.point.x + this.centerFeet.x, 0,
            this.point.x - this.centerFeet.x, 0);
        gradient.addColorStop(0,"red");
        gradient.addColorStop(0.5,"yellow");
        gradient.addColorStop(1,"green");
        context.fillStyle = gradient;
        let pathLeft = this.point.x + this.centerFeet.x;
        let pathTop = this.point.y + 8;
        let percent = this.health / initHealth;
        context.beginPath();
        context.moveTo(pathLeft + 2.5, pathTop)
        context.lineTo(pathLeft + percent * this.sprite.width - 2.5, pathTop)
        context.arc(pathLeft + percent * this.sprite.width - 2.5, pathTop + 2.5, 2.5,
                    1.5*Math.PI, 0.5*Math.PI);
        context.lineTo(pathLeft + 2.5, pathTop + 5);
        context.arc(pathLeft + 2.5, pathTop + 2.5, 2.5,
                    0.5*Math.PI, 1.5*Math.PI);
        context.stroke();
        context.fill();
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
        let creepCopy = this.creeps.slice();
        for (let i = 0; i < creepCopy.length; ++i) {
            let creep = creepCopy[i];
            if (creep.health <= 0) {
                this.creeps.splice(i, 1);
                continue;
            }
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

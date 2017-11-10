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
    this.drawPill = function(context, point, length, radius, percent, fill) {
        const arcTop = 1.5*Math.PI, arcBot = 0.5*Math.PI;
        const Left = point.x + this.centerFeet.x, Top = point.y + 5;
        context.beginPath();
        context.moveTo(Left + radius, Top)
        context.arc(Left + percent * length - radius, Top + radius, radius,
                    arcTop, arcBot);
        context.arc(Left + radius, Top + radius, radius, arcBot, arcTop);
        context.strokeStyle = "Black";
        context.fillStyle = fill;
        context.stroke();
        context.fill();
    };
    this.drawHealth = function(context, initHealth) {
        var gradient = context.createLinearGradient(
            this.point.x + this.centerFeet.x, 0,
            this.point.x - this.centerFeet.x, 0);
        gradient.addColorStop(0,"red");
        gradient.addColorStop(0.5,"yellow");
        gradient.addColorStop(1,"green");
        this.drawPill(context, this.point, this.sprite.width, 2.5,
                      this.health / initHealth, gradient);
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
        for (let i = 0; i < this.creeps.length; ++i) {
            let creep = this.creeps[i];
            if (creep.health <= 0) {
                // Remove creep and prevent skipping the next creep
                this.creeps.splice(i--, 1);
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

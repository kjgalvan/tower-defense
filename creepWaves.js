function CreepObj(sprite, point, heading, health, wavePos, creationFrame) {
    this.sprite = sprite;
    this.point = point;
    this.heading = heading;
    this.health = health;
    this.wavePos = wavePos;
    this.creationFrame = creationFrame;
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.col = 0;
    this.changeFacing = { "N": 0, "S": 1, "E": 2, "W": 3, };
    this.facing = this.changeFacing[this.heading];
    this.setHeading = function(heading) {
        this.heading = heading;
        this.facing = this.changeFacing[heading];
    };
    this.move = function(heading) {
        this.point = this.point.add(heading.x, heading.y);
    };
    this.drawPillShape = function(context, point, length, radius, percent, fill) {
        const arcTop = 1.5*Math.PI, arcBot = 0.5*Math.PI;
        context.beginPath();
        context.moveTo(point.x + radius, point.y)
        context.arc(point.x + percent * length - radius, point.y + radius,
                    radius, arcTop, arcBot);
        context.arc(point.x + radius, point.y + radius, radius, arcBot, arcTop);
        context.strokeStyle = "Black";
        context.fillStyle = fill;
        context.stroke();
        context.fill();
    };
    this.drawHealth = function(context, initHealth) {
        let healthBarPoint = new PointObj(
            this.point.x - this.sprite.width / 2, this.point.y + 5);
        let gradient = context.createLinearGradient(
            healthBarPoint.x, 0, healthBarPoint.x + this.sprite.width, 0);
        gradient.addColorStop(0,"red");
        gradient.addColorStop(0.5,"yellow");
        gradient.addColorStop(1,"green");
        this.drawPillShape(context, healthBarPoint, this.sprite.width, 2.5,
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

function WaveObj(sprite, creationAmount, startingPoint, initHeading,
                 spacing, initHealth)
{
    this.sprite = sprite;
    this.creationAmount = creationAmount;
    this.point = startingPoint;
    this.initHeading = initHeading;
    this.spacing = spacing;
    this.initHealth = initHealth;
    this.created = 0;
    this.creeps = [];
    this.createCreep = function(frame) {
        this.creeps.push(new CreepObj(
            this.sprite, this.point, this.initHeading, this.initHealth,
            this.created++, frame));
    };
    this.update = function(frame, isometricSize, getNewHeading, directions) {
        if (this.created < this.creationAmount && frame % this.spacing == 0)
            this.createCreep(frame);
        for (let i = 0; i < this.creeps.length; ++i) {
            let creep = this.creeps[i];
            if (creep.health <= 0) {
                // Remove creep and prevent skipping the next creep
                this.creeps.splice(i--, 1);
                continue;
            }
            if (frame % 5 == 0)
                creep.nextCol();
            if ((frame - creep.creationFrame) % isometricSize == 0)
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

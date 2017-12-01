function Particle(location,direction,lifespan,partSprite) {
    this.sprite = partSprite;
    this.location = location;
    this.direction = direction;
    this.lifespan = lifespan;

    this.renew = function(direction,location,lifespan) {
        this.direction = direction;
        this.location = location;
        this.lifespan=lifespan;
    };
    this.update = function() {  
        this.location.iAdd(this.direction);
        this.lifespan-=2.0;
    };
    this.draw = function() {
        console.log();
        this.sprite.draw(1, 1 , this.location.x - (this.sprite.width/2), this.location.y - (this.sprite.height/2)); 
    };
    this.isDead = function() {
    if(this.lifespan<0.0)
        return true;
    else
        return false;
    };
};

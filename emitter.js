function Emitter(point,direction,lifespan,numberofparticles,partSprite) {
    this.particleCount = numberofparticles;
    this.particles = new Array(); 
    this.location = point; //PointObj for drawPos
    this.direction = direction; //PointObj for initial direction
    this.lifespan = lifespan;
    
    this.renew = function(direction,location,lifespan) {
        this.location = location;
        this.direction = direction;
        this.lifespan = lifespan;  
    };
    this.update = function(direction) {
        this.direction = direction;
        for(var i=0;i<this.particleCount;i++) {
            this.particles[i].update(this.direction);
        }
    };
    this.draw = function() {  
        for(var i=0;i<this.particleCount;i++) {
            this.particles[i].update(this.direction);
            if(!this.particles[i].isDead())
                this.particles[i].draw();
        } 
        this.addparticle(3);
    };
    this.addparticle = function(count) {
        for (var i = 0; i < count; i++) {
            for (var j = 0; j < this.particles.length; j++) {
                if (this.particles[j].isDead()) {
                    this.particles[j].renew(this.direction,new PointObj(this.location.x,this.location.y),this.lifespan);             
                    break;
                }
            }
        }
    };
    this.isDead = function() {
        if(this.lifespan<0.0)
            return true;
        else
            return false;
    };
    this.poolMemory = function() {
        for(var i=0;i<this.particleCount;i++)
            this.particles[i] = new Particle(new PointObj(this.location.x,this.location.y),this.direction,-1,partSprite);
    };
    this.poolMemory(); 
};


function Emitter(point,direction,lifespan,numberofparticles,partSprite) {
    this.particleCount = numberofparticles;
    this.particles = new Array(); 
    this.location = point; //PointObj for drawPos
    this.direction = direction; //PointObj for initial direction
    this.lifespan = lifespan;
    this.mySound = new Sound("Sound/NFF-laser-gun-03.wav");
    
    this.renew = function(direction,location,lifespan) {
        this.location = location;
        this.direction = direction;
        this.lifespan = lifespan;
    };
    this.update = function(direction) {
        for(var i=0;i<this.particleCount;i++) {
            this.particles[i].update();
        }
    };
    this.draw = function() {  
        for(var i=0;i<this.particleCount;i++) {
            if(!this.particles[i].isDead())
                this.particles[i].draw();
        } 
    };
    this.addparticle = function() {
        for (var i = 0; i < this.particleCount; i++) {
            if (this.particles[i].isDead()) {
                this.mySound.play();
                this.particles[i].renew(this.direction,new PointObj(this.location.x,this.location.y),this.lifespan);             
                break;
            }
        }
    };
    this.isDead = function() {
        if(this.lifespan<0.0)
            return true;
        else
            return false;
    };
    this.getLiveParticles = function*() {
        for (var i = 0; i < this.particles.length; i++) {
            if (!this.particles[i].isDead()) {
                yield this.particles[i];
            }
        }
    };
    this.poolMemory = function() {
        for(var i=0;i<this.particleCount;i++)
            this.particles[i] = new Particle(new PointObj(this.location.x,this.location.y),this.direction,-1,partSprite);
    };
    this.poolMemory(); 
};


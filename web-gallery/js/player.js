Player.SPEED = 2; //Squares per second

function Player(id, x, y, z, rot, name, look)
{
  this.id = id;
  this.ready = false;
  this.elapsedTime = 0;
  this.walkFrame = 0;
  this.updateParams(x, y, z, rot, name, look);
  this.sprites = new Sprites();
}

Player.prototype.prepare = function() {
  return new Promise(function (resolve, reject) {

    var p = this.loadSprites();

    Promise.all(p).then(function (loaded) {
      console.log("Sprites loaded (" + this.name + ")");
      this.ready = true;
      resolve();
    }.bind(this),

    function (error) {
      console.log("Error loading sprites: " + error);
      reject("Error loading sprites: " + error);
    }.bind(this));

  }.bind(this));
};

Player.prototype.loadSprites = function() {
  return [
    this.sprites.loadAllSimpleAvatar("simple", this.look),
    this.sprites.loadAllWalkingAvatar("walking", this.look)
  ];
};

Player.prototype.isWalking = function() {
  return (this.x != this.targetX || this.y != this.targetY);
};

Player.prototype.currentSprite = function() {
  if (this.isWalking()) {
    return this.sprites.getImage('walking_' + this.rot + "_" + this.walkFrame);
  }
  return this.sprites.getImage('simple_' + this.rot);
};

Player.prototype.currentSilhouette = function() {
  if (this.isWalking()) {
    return this.sprites.getSilhouette('walking_' + this.rot + "_" + this.walkFrame);
  }
  return this.sprites.getSilhouette('simple_' + this.rot);
};

Player.prototype.nextWalkFrame = function() {
  this.walkFrame++;
  if (this.walkFrame >= 4) {
    this.walkFrame = 0;
  }
}

Player.prototype.tick = function(delta) {
  if (this.isWalking()) {
    this.elapsedTime += delta;
    if (this.elapsedTime >= 100) {
      this.nextWalkFrame();
      this.elapsedTime = 0;
    }
    this.move(delta);
  }
}

Player.prototype.setMovement = function(x, y, rot) {
  this.targetX = x;
  this.targetY = y;
  this.rot = rot;
};

Player.prototype.updateParams = function(x, y, z, rot, name, look) {
  this.x = x;
  this.y = y;
  this.targetX = x;
  this.targetY = y;
  this.z = z;
  this.rot = rot;
  this.name = name;
  this.look = look;
};

Player.prototype.move = function(delta) {
  delta = delta / 1000;
  if (this.targetX > this.x)
  {
    this.x += Player.SPEED * delta;
    if (this.x > this.targetX)
    {
      this.x = this.targetX;
    }
  }
  else if (this.targetX < this.x)
  {
    this.x += -Player.SPEED * delta;
    if (this.x < this.targetX)
    {
      this.x = this.targetX;
    }
  }

  if (this.targetY > this.y)
  {
    this.y += Player.SPEED * delta;
    if (this.y > this.targetY)
    {
      this.y = this.targetY;
    }
  }
  else if (this.targetY < this.y)
  {
    this.y -= Player.SPEED * delta;
    if (this.y < this.targetY)
    {
      this.y = this.targetY;
    }
  }
};

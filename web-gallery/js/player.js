Player.SPEED = 2; //Squares per second

function Player(id, x, y, z, rot, name, look)
{
  this.id = id;
  this.ready = false;
  this.walkFrame = 0;
  this.walkFrameCounter = 0;
  this.waveFrame = 0;
  this.waveFrameCounter = 0;
  this.waveCounter = 0;
  this.showSignCounter = 0;
  this.updateParams(x, y, z, rot, name, look);
  this.sprites = new Sprites();
  this.showSign(10);
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
    this.sprites.loadAllWalkingAvatar("walking", this.look),
    this.sprites.loadAllWavingAvatar("waving", this.look),
    this.sprites.loadHeadAvatar("head", this.look)
  ];
};

Player.prototype.isWalking = function() {
  return (this.x != this.targetX || this.y != this.targetY);
};

Player.prototype.isWaving = function() {
  return this.waveCounter > 0;
};

Player.prototype.currentSprite = function() {
  if (this.isWalking()) {
    return this.sprites.getImage('walking_' + this.rot + "_" + this.walkFrame);
  } else if (this.isWaving()) {
    return this.sprites.getImage('waving_' + this.rot + "_" + this.waveFrame);
  }
  return this.sprites.getImage('simple_' + this.rot);
};

Player.prototype.headSprite = function() {
  return this.sprites.getImage('head');
};

Player.prototype.currentSilhouette = function() {
  if (this.isWalking()) {
    return this.sprites.getSilhouette('walking_' + this.rot + "_" + this.walkFrame);
  } else if (this.isWaving()) {
    return this.sprites.getSilhouette('waving_' + this.rot + "_" + this.waveFrame);
  }
  return this.sprites.getSilhouette('simple_' + this.rot);
};

Player.prototype.nextWalkFrame = function() {
  this.walkFrame++;
  if (this.walkFrame >= 4) {
    this.walkFrame = 0;
  }
};

Player.prototype.nextWaveFrame = function() {
  this.waveFrame++;
  if (this.waveFrame >= 2) {
    this.waveFrame = 0;
  }
};

Player.prototype.tick = function(delta) {
  if (this.isWalking()) {
    this.walkFrameCounter += delta;
    if (this.walkFrameCounter >= 100) {
      this.nextWalkFrame();
      this.walkFrameCounter = 0;
    }
    this.move(delta);
  }
  if (this.showSignCounter > 0) {
    this.showSignCounter -= delta;
  }
  if (this.waveCounter > 0) {
    this.waveFrameCounter += delta;
    if (this.waveFrameCounter >= 100) {
      this.nextWaveFrame();
      this.waveFrameCounter = 0;
    }
    this.waveCounter -= delta;
  }
};

Player.prototype.showSign = function(seconds) {
  this.showSignCounter = seconds * 1000;
};

Player.prototype.shouldShowSign = function() {
  return this.showSignCounter > 0;
};

Player.prototype.wave = function(seconds) {
  this.waveCounter = seconds * 1000;
};

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

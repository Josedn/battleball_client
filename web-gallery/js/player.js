Player.SPEED = 2; //Squares per second

function Player(id, x, y, z, rot, name, look)
{
  this.id = id;
  this.ready = false;
  this.waveCounter = 0;
  this.speakCounter = 0;
  this.blinkCounter = 0;
  this.genericFrame = 0;
  this.genericFrameCounter = 0;
  this.showSignCounter = 0;
  this.updateParams(x, y, z, rot, name, look);
  this.sprites = new Sprites();
  this.statusses = {};
  this.showSign(10);
}

Player.prototype.prepare = function(avatarImager) {
  return new Promise((resolve, reject) => {
    var p = this.loadSprites(avatarImager);
    Promise.all(p).then(function (loaded) {
      updateStatus("Player loaded (" + this.id + ")");
      this.ready = true;
      resolve();
    }.bind(this),
    function (error) {
      updateStatus("Error loading sprites: " + error);
      //reject("Error loading sprites: " + error);
      console.log(error.stack);
      resolve("Error loading sprites: " + error);
    }.bind(this))
  });
};

Player.prototype.loadSprites = function(avatarImager) {
  return [
    this.sprites.loadAllGenericAvatar(this.look, avatarImager),
    this.sprites.loadHeadAvatar('head', this.look)
  ];
};

Player.prototype.isSitting = function() {
  if (this.statusses.sit != null) {
    return true;
  }
  return false;
};

Player.prototype.isWalking = function() {
  //return (this.x != this.targetX || this.y != this.targetY);
  if (this.statusses.mv != null) {
    return true;
  }
  return false;
};

Player.prototype.isWaving = function() {
  return this.waveCounter > 0;
};

Player.prototype.isSpeaking = function() {
  return this.speakCounter > 0;
};

Player.prototype.getCurrentAvatarSpriteKey = function() {
  let action = ["std"];
  let gesture = "std";
  let frame = 0;
  if (this.isSitting()) {
    action = ["sit"];
  }
  if (this.isWaving()) {
    action = ["wav"];
    frame = this.genericFrame % 2;
  }
  if (this.isSpeaking()) {
    gesture = "spk";
    frame = this.genericFrame % 2;
  }
  if (this.isWalking()) {
    action = ["wlk"];
    frame = this.genericFrame;
  }
  if (this.isWalking() && this.isWaving()) {
    action = ["wlk", "wav"];
    frame = this.genericFrame;
  }
  if (this.isSitting() && this.isWaving()) {
    action = ["sit", "wav"];
    frame = this.genericFrame % 2;
  }
  if (!this.isWalking() && !this.isWaving() && this.blinkCounter > 3800) {
    gesture = "eyb";
    frame = 0;
  }
  return this.sprites.getAvatarSpriteKey(this.rot, this.rot, action, gesture, frame);
};
Player.prototype.currentSprite = function() {
  return this.sprites.getImage(this.getCurrentAvatarSpriteKey());
};

Player.prototype.headSprite = function() {
  return this.sprites.getImage('head');
};

Player.prototype.currentSilhouette = function() {
  return this.sprites.getSilhouette(this.getCurrentAvatarSpriteKey());
};

Player.prototype.nextGenericFrame = function() {
  this.genericFrame++;
  if (this.genericFrame >= 4) {
    this.genericFrame = 0;
  }
};

Player.prototype.tick = function(delta) {
  this.genericFrameCounter += delta;
  if (this.genericFrameCounter >= 100) {
    this.nextGenericFrame();
    this.genericFrameCounter = 0;
  }
  if (this.isWalking()) {
    this.move(delta);
  }
  if (this.showSignCounter > 0) {
    this.showSignCounter -= delta;
  }
  if (this.waveCounter > 0) {
    this.waveCounter -= delta;
  }
  if (this.speakCounter > 0) {
    this.speakCounter -= delta;
  }
  if (this.blinkCounter > 0) {
    this.blinkCounter -= delta;
  } else {
    this.blinkCounter = 4000;
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

Player.prototype.speak = function(seconds) {
  this.speakCounter = seconds * 1000;
}

Player.prototype.setMovement = function(x, y, z) {
  this.targetX = x;
  this.targetY = y;
  this.targetZ = z;
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

Player.prototype.updateStatus = function(x, y, z, rot, statusses) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.rot = rot;
  this.statusses = statusses;
  if (this.statusses.mv != null) {
    var coords = this.statusses.mv.split(',');
    this.setMovement(parseInt(coords[0]), parseInt(coords[1]), parseFloat(coords[2]));
  }
  if (this.statusses.sit != null) {
    var tempZ = parseFloat(this.statusses.sit);
    this.z = tempZ;
  }
};

Player.prototype.move = function(delta) {
  delta = delta / 1000;
  if (this.targetX > this.x) {
    this.x += Player.SPEED * delta;
    if (this.x > this.targetX) {
      this.x = this.targetX;
    }
  }
  else if (this.targetX < this.x) {
    this.x += -Player.SPEED * delta;
    if (this.x < this.targetX) {
      this.x = this.targetX;
    }
  }

  if (this.targetY > this.y) {
    this.y += Player.SPEED * delta;
    if (this.y > this.targetY) {
      this.y = this.targetY;
    }
  }
  else if (this.targetY < this.y) {
    this.y -= Player.SPEED * delta;
    if (this.y < this.targetY) {
      this.y = this.targetY;
    }
  }

  if (this.targetZ > this.z) {
    this.z += Player.SPEED * delta;
    if (this.z > this.targetZ) {
      this.z = this.targetZ;
    }
  }
  else if (this.targetZ < this.z) {
    this.z -= Player.SPEED * delta;
    if (this.z < this.targetZ) {
      this.z = this.targetZ;
    }
  }
};

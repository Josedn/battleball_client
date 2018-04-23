Furni.DRAWING_OFFSET_X = -32;
Furni.DRAWING_OFFSET_Y = -16;
Furni.FURNIDATA_URL = "./furnidata.json";
Furni.ROOMITEM = 0;
Furni.WALLITEM = 1;
Furni.FRAME_SPEED = 80;

function Furni(type, id, x, y, z, rot, baseId, state) {
  this.type = type;
  this.id = id;
  this.x = x;
  this.y = y;
  this.z = z;
  this.rot = rot;
  this.state = state;
  this.nextState = -1;
  this.genericFrame = 0;
  this.genericFrameCounter = 0;
  this.baseId = baseId;
  this.ready = false;
  this.sprites = new Sprites();
}

Furni.prototype.loadSprites = function(furnitureImager) {
  let allSpritesPromise = null;
  if (this.type == Furni.ROOMITEM) {
    allSpritesPromise = furnitureImager.generateRoomItem(this.baseId, 64);
  } else {
    allSpritesPromise = furnitureImager.generateWallItem(this.baseId, 64);
  }
  allSpritesPromise.then((base) => {
    this.baseItem = base;
    for (spriteId in this.baseItem.sprites) {
      this.sprites.loadLocalImage(spriteId, this.baseItem.sprites[spriteId].sprite);
    }
  });
  return [allSpritesPromise];
};

Furni.prototype.prepare = function(furnitureImager) {
  return new Promise((resolve, reject) => {

    var p = this.loadSprites(furnitureImager);

    Promise.all(p).then(function (loaded) {
      updateStatus("Sprites loaded (" + this.baseItem.itemName + " furniId:" + this.id + ")");
      this.ready = true;
      resolve();
    }.bind(this),

    function (error) {
      updateStatus("Error loading sprites: " + error);
      //reject("Error loading sprites: " + error);
      resolve("Error loading sprites: " + error);
    }.bind(this))
  });
};

Furni.prototype.updateParams = function(x, y, z, baseId) {
  this.x = x;
  this.y = y;
  this.z = z;
};

Furni.prototype.setState = function(state) {
  if (this.baseItem.states[state].transition != null) {
    this.state = this.baseItem.states[state].transition;
    this.nextState = state;
    this.genericFrame = 0;
  } else {
    this.setActualState(state);
  }
};

Furni.prototype.setActualState = function(state) {
  this.state = state;
  this.nextState = -1;
  this.genericFrame = 0;
};

Furni.prototype.nextGenericFrame = function() {
  this.genericFrame++;
  if (this.genericFrame >= this.baseItem.states[this.state].count) {
    this.genericFrame = 0;
    if (this.nextState != -1) {
      this.setActualState(this.nextState);
    }
  }
};

Furni.prototype.tick = function(delta) {
  this.genericFrameCounter += delta;
  if (this.genericFrameCounter >= Furni.FRAME_SPEED) {
    this.nextGenericFrame();
    this.genericFrameCounter = 0;
  }
};

Furni.prototype.getCurrentBaseSprite = function() {
  return this.baseItem.sprites[this.getCurrentFurniSpriteKey()];
};

Furni.prototype.getCurrentFurniSpriteKey = function() {
  return this.sprites.getFurnitureSpriteKey(this.baseItem.itemId, this.rot, this.state, this.genericFrame);
};

Furni.prototype.currentSprite = function() {
  return this.sprites.getImage(this.getCurrentFurniSpriteKey());
};

Furni.prototype.currentSpriteAdd = function() {
  return this.sprites.getImage(this.getCurrentFurniSpriteKey() + "_add");
};

Furni.prototype.currentSilhouette = function() {
  return this.sprites.getSilhouette(this.getCurrentFurniSpriteKey());
};

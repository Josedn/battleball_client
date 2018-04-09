Furni.DRAWING_OFFSET = -100;
Furni.INTERNAL_DRAWING_OFFSET_X = -132;
Furni.INTERNAL_DRAWING_OFFSET_Y = -116;
Furni.FURNIDATA_URL = "./furnidata.json";

function Furni(id, x, y, z, rot, baseId) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.z = z;
  this.rot = rot;
  this.state = 1;
  this.genericFrame = 0;
  this.genericFrameCounter = 0;
  this.baseId = baseId;
  this.ready = false;
  this.sprites = new Sprites();
}

Furni.prototype.loadSprites = function(furnitureImager) {
  let allSpritesPromise = furnitureImager.generateAll(this.baseId, 64);
  allSpritesPromise.then((base) => {
    this.baseItem = base;
    for (spriteId in this.baseItem.sprites) {
      this.sprites.loadLocalImage(spriteId, this.baseItem.sprites[spriteId]);
    }
  });
  return [allSpritesPromise];
};

Furni.prototype.prepare = function(furnitureImager) {
  return new Promise(function (resolve, reject) {

    var p = this.loadSprites(furnitureImager);

    Promise.all(p).then(function (loaded) {
      updateStatus("Sprites loaded (" + this.baseItem.itemName + " furniId:" + this.id + ")");
      this.ready = true;
      resolve();
    }.bind(this),

    function (error) {
      updateStatus("Error loading sprites: " + error);
      reject("Error loading sprites: " + error);
    }.bind(this))
  }.bind(this));
};

Furni.prototype.updateParams = function(x, y, z, base) {
  this.x = x;
  this.y = y;
  this.z = z;
};

Furni.prototype.nextGenericFrame = function() {
  this.genericFrame++;
  if (this.genericFrame >= this.baseItem.states[this.state]) {
    this.genericFrame = 0;
  }
};

Furni.prototype.tick = function(delta) {
  this.genericFrameCounter += delta;
  if (this.genericFrameCounter >= 100) {
    this.nextGenericFrame();
    this.genericFrameCounter = 0;
  }
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

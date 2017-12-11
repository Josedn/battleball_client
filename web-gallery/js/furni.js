Furni.DRAWING_OFFSET = -100;
Furni.INTERNAL_DRAWING_OFFSET_X = -132;
Furni.INTERNAL_DRAWING_OFFSET_Y = -116;
Furni.FURNIDATA_URL = "./furnidata.json";

function Furni(id, x, y, z, rot, base) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.z = z;
  this.rot = rot;
  this.base = base;
  this.ready = false;
  this.sprites = new Sprites();
}

Furni.prototype.loadSprites = function() {
  var spritesToLoad = [];
  Object.keys(this.base.assets).forEach(key => {
    spritesToLoad.push(this.sprites.loadFurniAsset(this.base.assetName, key));
  });
  return spritesToLoad;
};

Furni.prototype.prepare = function() {
  return new Promise(function (resolve, reject) {

    var p = this.loadSprites();

    Promise.all(p).then(function (loaded) {
      updateStatus("Sprites loaded (" + this.base.assetName + " furniId:" + this.id + ")");
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
  if (base != this.base) {
    this.base = base;
    this.prepare();
  }
};

Furni.prototype.tick = function(delta) {

};

Furni.prototype.currentSprite = function() {
  var tempCanvas = document.createElement('canvas');
  var tempCtx = tempCanvas.getContext('2d');
  var x = -Furni.INTERNAL_DRAWING_OFFSET_X;
  var y = -Furni.INTERNAL_DRAWING_OFFSET_Y;

  Object.keys(this.base.assets).forEach(key => {
    var asset = this.base.assets[key];
    if (asset.alpha != null) {
      tempCtx.save();
      tempCtx.globalAlpha = asset.alpha;
    }
    tempCtx.drawImage(this.sprites.getImage(key), x - asset.x, y - asset.y);
    if (asset.alpha != null) {
      tempCtx.restore();
    }
  });
  return tempCanvas;
};

Furni.prototype.currentSilhouette = function() {
  var tempCanvas = document.createElement('canvas');
  var tempCtx = tempCanvas.getContext('2d');
  var x = -Furni.INTERNAL_DRAWING_OFFSET_X;
  var y = -Furni.INTERNAL_DRAWING_OFFSET_Y;

  Object.keys(this.base.assets).forEach(key => {
    tempCtx.drawImage(this.sprites.getSilhouette(key), x - this.base.assets[key].x, y - this.base.assets[key].y);
  });
  return tempCanvas;
};

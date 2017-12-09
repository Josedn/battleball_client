function Furni(id, x, y, z) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.z = z;
  this.ready = false;
  this.sprites = new Sprites();
}

Furni.prototype.loadSprites = function() {
  return [
    this.sprites.loadImage("simple", Sprites.LOCAL_RESOURCES_URL + 'area_safe.gif')
  ];
};

Furni.prototype.prepare = function() {
  return new Promise(function (resolve, reject) {

    var p = this.loadSprites();

    Promise.all(p).then(function (loaded) {
      console.log("Sprites loaded (furniId:" + this.id + ")");
      this.ready = true;
      resolve();
    }.bind(this),

    function (error) {
      console.log("Error loading sprites: " + error);
      reject("Error loading sprites: " + error);
    }.bind(this));

  }.bind(this));
};

Furni.prototype.currentSprite = function() {
  return this.sprites.getImage("simple");
};

Furni.prototype.currentSilhouette = function() {
  return this.sprites.getSilhouette("simple");
};

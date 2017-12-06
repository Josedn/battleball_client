function Player(id, x, y, z, rot, name, look)
{
  this.id = id;
  this.x = x;
  this.y = y;
  this.z = z;
  this.rot = rot;
  this.name = name;
  this.look = look;
  this.targetX = x;
  this.targetY = y;
  this.ready = false;
  this.sprites = new Sprites();
}

Player.prototype.prepare = function() {
  return new Promise(function (resolve, reject) {

    var p = this.loadSprites();

    Promise.all(p).then(function (loaded) {
      console.log("Sprites loaded");
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
    this.sprites.loadSimpleAvatar('simple_0', this.look, 0),
    this.sprites.loadSimpleAvatar('simple_1', this.look, 1),
    this.sprites.loadSimpleAvatar('simple_2', this.look, 2),
    this.sprites.loadSimpleAvatar('simple_3', this.look, 3),
    this.sprites.loadSimpleAvatar('simple_4', this.look, 4),
    this.sprites.loadSimpleAvatar('simple_5', this.look, 5),
    this.sprites.loadSimpleAvatar('simple_6', this.look, 6),
    this.sprites.loadSimpleAvatar('simple_7', this.look, 7)
  ];
};

Player.prototype.currentSprite = function() {
  return this.sprites.getImage('simple_' + this.rot);
};

Player.prototype.draw = function(finalX, finalY) {


};

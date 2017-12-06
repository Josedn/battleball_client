Room.TILE_H = 32;
Room.TILE_W = 64;

function Camera(room) {
  this.room = room;
  this.reset();
}

Camera.prototype.reset = function() {
  this.width = this.room.ctx.canvas.clientWidth;
  this.height = this.room.ctx.canvas.clientHeight;
  this.x = (this.width - Room.TILE_W) / 2;
  this.y = (this.height - Room.TILE_H) / 4;
}

function Room(cols, rows, heightmap, ctx) {
    this.cols = cols;
    this.rows = rows;
    this.heightmap = heightmap;
    this.ctx = ctx;
    this.ready = false;
    this.sprites = new Sprites();
    this.camera = new Camera(this);
}

Room.prototype.prepareRoom = function() {
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
}

Room.prototype.loadSprites = function() {
  return [
    this.sprites.loadImage('room_tile', Sprites.LOCAL_RESOURCES_URL + 'room_tile.png'),
    this.sprites.loadImage('empty_tile', Sprites.LOCAL_RESOURCES_URL + 'empty_tile.png'),
    this.sprites.loadImage('shadow_tile', Sprites.LOCAL_RESOURCES_URL + 'shadow_tile.png'),
    this.sprites.loadImage('selected_tile', Sprites.LOCAL_RESOURCES_URL + 'selected_tile.png'),
  ];
};

Room.prototype.drawFloor = function() {

};

Room.prototype.draw = function() {
  this.drawFloor();
};

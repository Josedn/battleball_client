Room.TILE_H = 32;
Room.TILE_W = 64;

function Camera(room) {
  this.room = room;
  this.reset();
}

Camera.prototype.reset = function() {
  this.width = this.room.game.canvas.width;
  this.height = this.room.game.canvas.height;
  this.x = (this.width - Room.TILE_W) / 2;
  this.y = (this.height - (Room.TILE_H * this.room.rows)) / 2;
};

function Room(cols, rows, heightmap, game) {
    this.cols = cols;
    this.rows = rows;
    this.heightmap = heightmap;
    this.game = game;
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
};

Room.prototype.onResize = function() {
  this.camera.reset();
};

Room.prototype.loadSprites = function() {
  return [
    this.sprites.loadImage('room_tile', Sprites.LOCAL_RESOURCES_URL + 'room_tile.png'),
    this.sprites.loadImage('shadow_tile', Sprites.LOCAL_RESOURCES_URL + 'shadow_tile.png'),
    this.sprites.loadImage('selected_tile', Sprites.LOCAL_RESOURCES_URL + 'selected_tile.png'),
  ];
};

Room.prototype.drawFloor = function() {
  var ctx = this.game.ctx;

  // mapX and mapY are offsets to make sure we can position the map as we want.
  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  // loop through our map and draw out the image represented by the number.
  for (var i = 0; i < this.cols; i++) {
    for (var j = 0; j < this.rows; j++) {
      var tile = this.heightmap[i][j];
      // Draw the represented image number, at the desired X & Y coordinates followed by the graphic width and height.
      if (tile == 1) {
        ctx.drawImage(this.sprites.getImage('room_tile'), (i - j) * Room.TILE_H + offsetX, (i + j) * Room.TILE_H / 2 + offsetY);

      }
    }
  }

};

Room.prototype.draw = function() {
  this.drawFloor();
};
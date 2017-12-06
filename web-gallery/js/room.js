Room.TILE_H = 32;
Room.TILE_W = 64;

function Camera(room) {
  this.room = room;
  this.reset();
}

Camera.prototype.reset = function() {
  this.width = this.room.game.canvas.width;
  this.height = this.room.game.canvas.height;
  this.x = (this.width - (Room.TILE_H * (this.room.cols - this.room.rows + 2))) / 2;
  this.y = (this.height - (Room.TILE_H * this.room.cols)) / 2;
};

function Room(cols, rows, doorX, doorY, heightmap, game) {
  this.cols = cols;
  this.rows = rows;
  this.heightmap = heightmap;
  this.doorX = doorX;
  this.doorY = doorY;
  this.game = game;
  this.ready = false;
  this.selectedScreenX = 0;
  this.selectedScreenY = 0;
  this.players = {};
  this.sprites = new Sprites();
  this.camera = new Camera(this);
  this.player = new Player(0, 4, 4, 0, 4, "Jose", "hd-190-10.lg-3023-1408.ch-215-91.hr-893-45");
  this.player.prepare();
}

Room.prototype.getPlayer = function(id) {
  return (id in this.players) ? this.players[id] : null;
};

Room.prototype.addPlayer = function(id, x, y, rot, name, look) {
  if (!(id in this.players)) {
    var p = new Player(id, x, y, rot, name, look);
  }
};

Room.prototype.removePlayer = function(id) {
  if (id in this.players) {
    this.players[id] = null;
  }
};

Room.prototype.prepare = function() {
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

Room.prototype.isValidTile = function(x, y) {
  return (x >= 0 && x < this.cols && y >= 0 && y < this.rows && this.heightmap[x][y] != 0);
};

Room.prototype.onResize = function() {
  this.camera.reset();
};

Room.prototype.loadSprites = function() {
  return [
    this.sprites.loadImage('room_tile', Sprites.LOCAL_RESOURCES_URL + 'room_tile.png'),
    this.sprites.loadImage('shadow_tile', Sprites.LOCAL_RESOURCES_URL + 'shadow_tile.png'),
    this.sprites.loadImage('selected_tile', Sprites.LOCAL_RESOURCES_URL + 'selected_tile.png'),
    this.sprites.loadImage('room_wall_l', Sprites.LOCAL_RESOURCES_URL + 'room_wall_l.png'),
    this.sprites.loadImage('room_wall_r', Sprites.LOCAL_RESOURCES_URL + 'room_wall_r.png'),
    this.sprites.loadImage('room_door_extended', Sprites.LOCAL_RESOURCES_URL + 'room_door_extended.png'),
    this.sprites.loadImage('ghost0', Sprites.LOCAL_RESOURCES_URL + 'ghost0.png'),
    this.sprites.loadImage('ghost1', Sprites.LOCAL_RESOURCES_URL + 'ghost1.png'),
    this.sprites.loadImage('ghost2', Sprites.LOCAL_RESOURCES_URL + 'ghost2.png'),
    this.sprites.loadImage('ghost3', Sprites.LOCAL_RESOURCES_URL + 'ghost3.png'),
    this.sprites.loadImage('ghost4', Sprites.LOCAL_RESOURCES_URL + 'ghost4.png'),
    this.sprites.loadImage('ghost5', Sprites.LOCAL_RESOURCES_URL + 'ghost5.png'),
    this.sprites.loadImage('ghost6', Sprites.LOCAL_RESOURCES_URL + 'ghost6.png'),
    this.sprites.loadImage('ghost7', Sprites.LOCAL_RESOURCES_URL + 'ghost7.png')
  ];
};

Room.prototype.drawWall = function() {
  var ctx = this.game.ctx;

  // mapX and mapY are offsets to make sure we can position the map as we want.
  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  for (var i = 0; i < this.rows; i++) {
    if (i + 1 == this.doorY) {
      ctx.drawImage(this.sprites.getImage('room_door_extended'), (1 - i) * (Room.TILE_W / 2) + offsetX - 40, (i + 1) * (Room.TILE_H / 2) + offsetY - 119);
    }
    else if (i != this.doorY) {
      ctx.drawImage(this.sprites.getImage('room_wall_l'), (1 - i) * (Room.TILE_W / 2) + offsetX - 8, (i + 1) * (Room.TILE_H / 2) + offsetY - 119);
    }
  }

  for (var i = 1; i < this.cols; i++) {
    ctx.drawImage(this.sprites.getImage('room_wall_r'), (i - 1) * (Room.TILE_W / 2) + offsetX + 64, (i + 1) * (Room.TILE_H / 2) + offsetY - 135);
  }
}

Room.prototype.drawFloor = function() {
  var ctx = this.game.ctx;

  // mapX and mapY are offsets to make sure we can position the map as we want.
  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  // loop through our map and draw out the image represented by the number.
  for (var i = 1; i < this.cols; i++) {
    for (var j = 0; j < this.rows; j++) {
      var tile = this.heightmap[i][j];
      // Draw the represented image number, at the desired X & Y coordinates followed by the graphic width and height.
      if (tile > 0) {
        ctx.drawImage(this.sprites.getImage('room_tile'), (i - j) * (Room.TILE_W / 2) + offsetX, (i + j) * (Room.TILE_H / 2) + offsetY - ((tile - 1) * Room.TILE_H));
      }
    }
  }
};

Room.prototype.drawDoorFloor = function() {
  var ctx = this.game.ctx;

  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  ctx.drawImage(this.sprites.getImage('room_tile'), (this.doorX - this.doorY) * (Room.TILE_W / 2) + offsetX, (this.doorX + this.doorY) * (Room.TILE_H / 2) + offsetY);
};

Room.prototype.drawSelectedTile = function() {
  var ctx = this.game.ctx;

  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  var xminusy = (this.selectedScreenX - 32 - offsetX) / Room.TILE_H;
  var xplusy =  (this.selectedScreenY - offsetY) * 2 / Room.TILE_H;

  var x = Math.floor((xminusy + xplusy) / 2);
  var y = Math.floor((xplusy - xminusy) / 2);

  if (this.isValidTile(x, y)) {
    ctx.drawImage(this.sprites.getImage('selected_tile'), (x - y) * (Room.TILE_W / 2) + offsetX, (x + y) * (Room.TILE_H / 2) + offsetY);
  }
};

Room.prototype.drawPlayers = function() {
  var ctx = this.game.ctx;

  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  var mapPositionX = (this.player.x - this.player.y) * Room.TILE_H + offsetX;
  var mapPositionY = (this.player.x + this.player.y) * Room.TILE_H / 2 + offsetY;

  ctx.drawImage(this.sprites.getImage('shadow_tile'), mapPositionX, mapPositionY - ((this.heightmap[this.player.x][this.player.y] - 1) * Room.TILE_H));
  if (this.player.ready) {
    ctx.drawImage(this.player.currentSprite(), mapPositionX, mapPositionY - 85 - (this.player.z * Room.TILE_H));
  } else {
    ctx.drawImage(this.sprites.getImage('ghost' + this.player.rot), mapPositionX + 17, mapPositionY - 58 - (this.player.z * Room.TILE_H));
  }
};

Room.prototype.draw = function() {
  this.drawDoorFloor();
  this.drawWall();
  this.drawFloor();
  this.drawSelectedTile();
  this.drawPlayers();
};

Room.prototype.tick = function(delta) {
  this.player.tick(delta);
};

Room.prototype.onMouseMove = function(x, y, isDrag) {
  if (isDrag) //Move camera
  {
    var diffX = this.selectedScreenX - x;
    var diffY = this.selectedScreenY - y;
    this.camera.x -= diffX;
    this.camera.y -= diffY;
  }

  this.selectedScreenX = x;
  this.selectedScreenY = y;
};

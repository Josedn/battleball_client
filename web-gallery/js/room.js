Room.TILE_H = 32;
Room.TILE_W = 64;

Room.FONT = "400 10pt Ubuntu";
Room.FONT_BOLD = "700 10pt Ubuntu";

DrawableSprite.PRIORITY_DOOR_FLOOR = 1;
DrawableSprite.PRIORITY_DOOR_FLOOR_SELECT = 2;
DrawableSprite.PRIORITY_DOOR_FLOOR_PLAYER_SHADOW = 3;
DrawableSprite.PRIORITY_DOOR_FLOOR_PLAYER = 4;
DrawableSprite.PRIORITY_DOOR_WALL = 5;
DrawableSprite.PRIORITY_WALL = 6;
DrawableSprite.PRIORITY_FLOOR = 7;
DrawableSprite.PRIORITY_PLAYER_SHADOW = 8;
DrawableSprite.PRIORITY_FLOOR_SELECT = 9;
DrawableSprite.PRIORITY_PLAYER = 10;
DrawableSprite.PRIORITY_SIGN = 11;
DrawableSprite.PRIORITY_CHAT = 12;

Chat.SPEED = 92; //Pixels per seconds
Chat.ROLL_PERIOD = 5000; // ms

function Chat(player, text, x) {
  this.player = player;
  this.text = text;
  this.x = x;
  this.deltaY = 0;
  this.targetY = 0;
}

Chat.prototype.move = function(delta) {
  delta = delta / 1000;
  if (this.targetY < this.deltaY)
  {
    this.deltaY -= Chat.SPEED * delta;
    if (this.deltaY < this.targetY)
    {
      this.deltaY = this.targetY;
    }
  }
}

function DrawableSprite(sprite, selectableSprite, screenX, screenY, priority) {
  this.sprite = sprite;
  this.selectableSprite = selectableSprite;
  this.screenX = screenX;
  this.screenY = screenY;
  this.priority = priority;
}

DrawableSprite.prototype.getScreenX = function() {
  return this.screenX;
};

DrawableSprite.prototype.getScreenY = function() {
  return this.screenY;
};

DrawableSprite.prototype.getComparableItem = function() {
  return this.screenY;
};

function IsometricDrawableSprite(sprite, selectableSprite, mapX, mapY, mapZ, offsetX, offsetY, priority) {
  DrawableSprite.call(this, sprite, selectableSprite, 0, 0, priority);
  this.mapX = mapX;
  this.mapY = mapY;
  this.mapZ = mapZ;
  this.offsetX = offsetX;
  this.offsetY = offsetY;
}

IsometricDrawableSprite.prototype.getScreenX = function() {
  return (this.mapX - this.mapY) * (Room.TILE_W / 2) + this.offsetX;
};

IsometricDrawableSprite.prototype.getScreenY = function() {
  return (this.mapX + this.mapY) * (Room.TILE_H / 2) + this.offsetY - (this.mapZ * Room.TILE_H);
};

IsometricDrawableSprite.prototype.getComparableItem = function() {
  return (this.mapX + this.mapY) * (Room.TILE_H / 2);
};

function Camera(room) {
  this.room = room;
  this.reset();
}

Camera.prototype.reset = function() {
  this.width = this.room.game.canvas.width;
  this.height = this.room.game.canvas.height;
  this.x = Math.round((this.width - (Room.TILE_H * (this.room.cols - this.room.rows + 3))) / 2);
  this.y = Math.round((this.height - ((this.room.cols + this.room.rows) * Room.TILE_H / 2) + 114) / 2);
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
  this.chats = [];
  this.selectableSprites = {};
  this.sprites = new Sprites();
  this.camera = new Camera(this);
  this.chatUpdateCounter = 0;
  this.chatTimerCounter = 0;
  this.furni = new Furni(1, 4, 4, 0);
  this.furni.prepare();
  this.drawQueue = new PriorityQueue({
    comparator: function(a, b) {
      if (a.priority != b.priority) {
        return a.priority - b.priority;
      }
      return a.getComparableItem() - b.getComparableItem();
    }.bind(this)
  });
}

Room.prototype.getPlayer = function(id) {
  return (id in this.players) ? this.players[id] : null;
};

Room.prototype.getPlayerFromSelectId = function(id) {
  return (id in this.selectableSprites) ? this.selectableSprites[id] : null;
};

Room.prototype.setPlayer = function(id, x, y, z, rot, name, look) {
  var player = this.getPlayer(id);
  if (player == null) {
    var p = new Player(id, x, y, z, rot, name, look);
    p.prepare();
    this.players[id] = p;
    this.selectableSprites[p.sprites.colorId] = p;
  } else {
    player.updateParams(x, y, z, rot, name, look);
  }
};

Room.prototype.removePlayer = function(id) {
  if (id in this.players) {
    if (this.players[id].sprites.colorId in this.selectableSprites) {
      delete(this.selectableSprites[this.players[id].sprites.colorId]);
    }
    delete(this.players[id]);
  }
};

Room.prototype.movePlayer = function(userId, x, y, rot) {
  var player = this.getPlayer(userId);
  if (player != null) {
    player.setMovement(x, y, rot);
  }
};

Room.prototype.prepare = function() {
  return new Promise(function (resolve, reject) {

    var p = this.loadSprites();

    Promise.all(p).then(function (loaded) {
      updateStatus("Sprites loaded (Room)");
      this.ready = true;
      resolve();
    }.bind(this),

    function (error) {
      updateStatus("Error loading sprites: " + error);
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
    this.sprites.loadImage('ghost7', Sprites.LOCAL_RESOURCES_URL + 'ghost7.png'),
    this.sprites.loadImage('sign_left', Sprites.LOCAL_RESOURCES_URL + 'sign_left.png'),
    this.sprites.loadImage('sign_right', Sprites.LOCAL_RESOURCES_URL + 'sign_right.png'),
    this.sprites.loadImage('sign_center', Sprites.LOCAL_RESOURCES_URL + 'sign_center.png'),
    this.sprites.loadImage('sign_bite', Sprites.LOCAL_RESOURCES_URL + 'sign_bite.png'),
    this.sprites.loadImage('chat_left', Sprites.LOCAL_RESOURCES_URL + 'chat_left.png'),
    this.sprites.loadImage('chat_right', Sprites.LOCAL_RESOURCES_URL + 'chat_right.png'),
    this.sprites.loadImage('chat_arrow', Sprites.LOCAL_RESOURCES_URL + 'chat_arrow.png'),
    this.sprites.loadImage('chat_bite', Sprites.LOCAL_RESOURCES_URL + 'chat_bite.png')
  ];
};

Room.prototype.addChat = function(userId, text) {
  var player = this.getPlayer(userId);
  if (player != null) {
    var mapPositionX = Math.round((player.x - player.y) * Room.TILE_H) + 22;
    if (this.chatTimerCounter < Chat.ROLL_PERIOD) {
      this.rollChats();
    }
    this.chats.push(new Chat(player, text, mapPositionX));
    this.chatTimerCounter = 0;
    this.chatUpdateCounter = 0;
  }
};

Room.prototype.addWave = function(userId, text) {
  var player = this.getPlayer(userId);
  if (player != null) {
    player.wave(3);
  }
};

Room.prototype.drawWall = function() {
  for (var i = 0; i < this.rows; i++) {
    if (i + 1 == this.doorY) {
      this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('room_door_extended'), null, 1, i, 0, -40, -119, DrawableSprite.PRIORITY_WALL));
    }
    else if (i != this.doorY && i + 1) {
      this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('room_wall_l'), null, 1, i, 0, -8, -119, DrawableSprite.PRIORITY_WALL));
    }
  }
  for (var i = 1; i < this.cols; i++) {
    this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('room_wall_r'), null, i, 1, 0, 64, -135, DrawableSprite.PRIORITY_WALL));
  }
};

Room.prototype.drawFloor = function() {
  // loop through our map and draw out the image represented by the number.
  for (var i = 0; i < this.cols; i++) {
    for (var j = 0; j < this.rows; j++) {
      var tile = this.heightmap[i][j];
      // Draw the represented image number, at the desired X & Y coordinates followed by the graphic width and height.
      if (tile > 0) {
        var prio = ((this.doorX == i && this.doorY == j) ? DrawableSprite.PRIORITY_DOOR_FLOOR : DrawableSprite.PRIORITY_FLOOR);
        this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('room_tile'), null, i, j, tile - 1, 0, 0, prio));
      }
    }
  }
};

Room.prototype.drawSelectedTile = function() {
  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  var xminusy = (this.selectedScreenX - 32 - offsetX) / Room.TILE_H;
  var xplusy =  (this.selectedScreenY - offsetY) * 2 / Room.TILE_H;

  var tileX = Math.floor((xminusy + xplusy) / 2);
  var tileY = Math.floor((xplusy - xminusy) / 2);

  if (this.isValidTile(tileX, tileY)) {
    var prio = ((this.doorX == tileX && this.doorY == tileY) ? DrawableSprite.PRIORITY_DOOR_FLOOR_SELECT : DrawableSprite.PRIORITY_FLOOR_SELECT);
    this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('selected_tile'), null, tileX, tileY, this.heightmap[tileX][tileY] - 1, 0, -3, prio));
  }
};

Room.prototype.drawPlayers = function () {
  Object.keys(this.players).forEach(key => {
    if (this.players[key] != null) {
      this.drawPlayer(this.players[key]);
    }
  });
};

Room.prototype.drawPlayer = function(player) {
  var prio = DrawableSprite.PRIORITY_PLAYER;
  var shadowPrio = DrawableSprite.PRIORITY_PLAYER_SHADOW;

  if (Math.round(player.x) == this.doorX && Math.round(player.y) == this.doorY) {
    prio = DrawableSprite.PRIORITY_DOOR_FLOOR_PLAYER;
    shadowPrio = DrawableSprite.PRIORITY_DOOR_FLOOR_PLAYER_SHADOW;
  }

  this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('shadow_tile'), null, player.x, player.y, this.heightmap[Math.floor(player.x)][Math.floor(player.y)] - 1, 0, 0, shadowPrio));
  if (player.ready) {
    var offsetX = (player.rot == 6 || player.rot == 5 || player.rot == 4) ? 3 : 0;
    this.drawQueue.queue(new IsometricDrawableSprite(player.currentSprite(), player.currentSilhouette(), player.x, player.y, player.z, offsetX, -85, prio));
  } else {
    this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('ghost' + player.rot), null, player.x, player.y, player.z, 17, -58, prio));
  }
  if (player.shouldShowSign()) {
    this.drawSign(player);
  }
};

Room.prototype.drawFurni = function() {
  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  if (this.furni.ready) {
    this.drawQueue.queue(new IsometricDrawableSprite(this.furni.currentSprite(), null, this.furni.x, this.furni.y, this.furni.z, 4, -41, DrawableSprite.PRIORITY_PLAYER));
  }
};

Room.prototype.drawChat = function(chat) {
  var tempCanvas = document.createElement('canvas');
  var tempCtx = tempCanvas.getContext('2d');

  tempCtx.font = Room.FONT_BOLD;
  tempCtx.textBaseline = "top";
  tempCtx.fillStyle = "black";

  var username = chat.player.name;
  var text = chat.text;

  var usernameWidth = Math.round(tempCtx.measureText(username + ": ").width);
  tempCtx.font = Room.FONT;
  var textWidth = Math.round(tempCtx.measureText(text).width);

  var currentWidth = 0;
  var centeredX = chat.x - Math.floor((usernameWidth + textWidth + 41) / 2);

  tempCtx.drawImage(this.sprites.getImage('chat_left'), currentWidth, 0);
  currentWidth += 31;

  for (var i = 0; i < usernameWidth + textWidth; i++) {
    tempCtx.drawImage(this.sprites.getImage('chat_bite'), currentWidth++, 0);
  }

  tempCtx.drawImage(this.sprites.getImage('chat_right'), currentWidth, 0);

  tempCtx.font = Room.FONT_BOLD;
  tempCtx.fillText(username + ": ", 31, 5);

  tempCtx.font = Room.FONT;
  tempCtx.fillText(text, 31 + usernameWidth, 5);

  if (chat.player.headSprite() != null) {
    tempCtx.drawImage(chat.player.headSprite(), 1, -3);
  }

  var screenY = Math.round(chat.deltaY - (this.camera.height / 8));

  this.drawQueue.queue(new DrawableSprite(tempCanvas, null, centeredX, screenY, DrawableSprite.PRIORITY_CHAT));
  var arrowPositionX = (chat.player.x - chat.player.y) * Room.TILE_H + 27;
  var lefterBound = centeredX + 4;
  var righterBound = lefterBound + currentWidth - 8;
  arrowPositionX = Math.round(Math.max(lefterBound, Math.min(righterBound, arrowPositionX)));
  this.drawQueue.queue(new DrawableSprite(this.sprites.getImage('chat_arrow'), null, arrowPositionX, screenY + 23, DrawableSprite.PRIORITY_CHAT));
};

Room.prototype.drawSign = function(player) {
  var tempCanvas = document.createElement('canvas');
  var tempCtx = tempCanvas.getContext('2d');

  tempCtx.font = Room.FONT;
  tempCtx.textBaseline = "top";
  tempCtx.fillStyle = "white";

  var textWidth = Math.round(tempCtx.measureText(player.name).width) - 13;
  var currentWidth = 0;

  tempCtx.drawImage(this.sprites.getImage('sign_left'), currentWidth, 0);
  currentWidth += 20;

  for (var i = 0; i < textWidth / 2; i++) {
    tempCtx.drawImage(this.sprites.getImage('sign_bite'), currentWidth++, 0);
  }

  tempCtx.drawImage(this.sprites.getImage('sign_center'), currentWidth, 0);
  currentWidth += 13;

  for (var i = 0; i < textWidth / 2; i++) {
    tempCtx.drawImage(this.sprites.getImage('sign_bite'), currentWidth++, 0);
  }

  tempCtx.drawImage(this.sprites.getImage('sign_right'), currentWidth, 0);

  tempCtx.fillText(player.name, 20, 6);

  var centeredX = Math.floor((Math.max(textWidth, 0) + 40) / 2);

  this.drawQueue.queue(new IsometricDrawableSprite(tempCanvas, null, player.x, player.y, 0, 22 - centeredX, -107, DrawableSprite.PRIORITY_SIGN));
};

Room.prototype.tickSelectedUserSign = function() {
  var selectedPlayer = this.trySelectPlayer(this.selectedScreenX, this.selectedScreenY);
  if (selectedPlayer != null ) {
    selectedPlayer.showSign(0.2);
  }
};

Room.prototype.rollChats = function() {
  this.chats.forEach(chat => {
    chat.targetY = chat.deltaY - 23;
  });
  this.chatUpdateCounter = 0;
};

Room.prototype.tickChats = function(delta) {
  this.chatUpdateCounter += delta;
  this.chatTimerCounter += delta;
  if (this.chatUpdateCounter > Chat.ROLL_PERIOD) {
    this.rollChats();
    this.chatUpdateCounter = 0;
  }
  this.chats.forEach(chat => {
    chat.move(delta);
  });
};

Room.prototype.drawChats = function() {
  this.chats.forEach(chat => {
    this.drawChat(chat);
  });
};

Room.prototype.draw = function() {
  this.drawWall();
  this.drawFloor();
  this.drawPlayers();
  this.drawFurni();
  this.drawSelectedTile();
  this.drawChats();

  var ctx = this.game.ctx;
  var auxCtx = this.game.auxCtx;
  while (this.drawQueue.length > 0) {
    var drawable = this.drawQueue.dequeue();
    ctx.drawImage(drawable.sprite, drawable.getScreenX() + this.camera.x, drawable.getScreenY() + this.camera.y);
    if (drawable.selectableSprite != null) {
      auxCtx.drawImage(drawable.selectableSprite, drawable.getScreenX() + this.camera.x, drawable.getScreenY() + this.camera.y);
    }
  }
};

Room.prototype.tickPlayers = function(delta) {
  Object.keys(this.players).forEach(key => {
    if (this.players[key] != null) {
      this.players[key].tick(delta);
    }
  });
};

Room.prototype.tick = function(delta) {
  this.tickPlayers(delta);
  this.tickChats(delta);
  this.tickSelectedUserSign();
};

Room.prototype.onSelectPlayer = function(player) {
  this.game.communication.requestLookAt(player.id);
  player.showSign(5);
};

Room.prototype.trySelectPlayer = function(x, y) {
  var p = this.game.auxCtx.getImageData(x, y, 1, 1).data;
  var selectedPlayer = this.getPlayerFromSelectId(Sprites.rgb2int(p[0], p[1], p[2]));
  if (selectedPlayer != null) {
    return selectedPlayer;
  }
  return null;
};

Room.prototype.onMouseClick = function(x, y) {
  var selectedPlayer = this.trySelectPlayer(x, y);
  if (selectedPlayer != null ) {
    this.onSelectPlayer(selectedPlayer);
  } else {
    var offsetX = this.camera.x;
    var offsetY = this.camera.y;

    var xminusy = (x - 32 - offsetX) / Room.TILE_H;
    var xplusy =  (y - offsetY) * 2 / Room.TILE_H;

    var tileX = Math.floor((xminusy + xplusy) / 2);
    var tileY = Math.floor((xplusy - xminusy) / 2);

    if (this.isValidTile(tileX, tileY)) {
      this.game.communication.requestMovement(tileX, tileY);
    }
  }
};

Room.prototype.onMouseDoubleClick = function(x, y) {
  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  var xminusy = (x - 32 - offsetX) / Room.TILE_H;
  var xplusy =  (y - offsetY) * 2 / Room.TILE_H;

  var tileX = Math.floor((xminusy + xplusy) / 2);
  var tileY = Math.floor((xplusy - xminusy) / 2);

  if (!this.isValidTile(tileX, tileY)) {
    this.camera.reset();
  }
};

Room.prototype.onMouseMove = function(x, y, isDrag) {
  if (isDrag) //Move camera
  {
    var diffX = Math.round(this.selectedScreenX - x);
    var diffY = Math.round(this.selectedScreenY - y);
    this.camera.x -= diffX;
    this.camera.y -= diffY;
  }

  this.selectedScreenX = Math.round(x);
  this.selectedScreenY = Math.round(y);
};

Room.prototype.onTouchStart = function(x, y) {
  this.onMouseMove(x, y, false);
};

Room.prototype.onTouchMove = function(x, y) {
  this.onMouseMove(x, y, true);
};

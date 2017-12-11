Communication.OUTGOING_LOGIN = 1;
Communication.OUTGOING_REQUEST_MAP = 2;
Communication.OUTGOING_REQUEST_MOVEMENT = 7;
Communication.OUTGOING_REQUEST_CHAT = 9;
Communication.OUTGOING_REQUEST_LOOK_AT = 12;
Communication.OUTGOING_REQUEST_WAVE = 13;
Communication.OUTGOING_REQUEST_ROOM_DATA = 15;

Communication.INCOMING_LOGIN_OK = 3;
Communication.INCOMING_MAP_DATA = 4;
Communication.INCOMING_PLAYERS_DATA = 6;
Communication.INCOMING_PLAYER_MOVEMENT = 8;
Communication.INCOMING_CHAT = 10;
Communication.INCOMING_PLAYER_REMOVE = 11;
Communication.INCOMING_PLAYER_WAVE = 14;
Communication.INCOMING_FURNI_DATA = 16;
Communication.INCOMING_FURNI_REMOVE = 17;

function Communication(game) {
  this.game = game;
}

Communication.prototype.doLogin = function(username, look) {
  var message = new ClientMessage(Communication.OUTGOING_LOGIN);
  message.appendString(username);
  message.appendString(look);
  this.game.connection.sendMessage(message);
};

Communication.prototype.requestMap = function() {
  this.game.connection.sendMessage(new ClientMessage(Communication.OUTGOING_REQUEST_MAP));
};

Communication.prototype.requestRoomData = function() {
  this.game.connection.sendMessage(new ClientMessage(Communication.OUTGOING_REQUEST_ROOM_DATA));
};

Communication.prototype.requestMovement = function(x, y) {
  var message = new ClientMessage(Communication.OUTGOING_REQUEST_MOVEMENT);
  message.appendInt(x);
  message.appendInt(y);
  this.game.connection.sendMessage(message);
};

Communication.prototype.requestChat = function(chat) {
  if (chat.length > 0) {
    var message = new ClientMessage(Communication.OUTGOING_REQUEST_CHAT);
    message.appendString(chat);
    this.game.connection.sendMessage(message);
  }
};

Communication.prototype.requestLookAt = function(userId) {
  var message = new ClientMessage(Communication.OUTGOING_REQUEST_LOOK_AT);
  message.appendInt(userId);
  this.game.connection.sendMessage(message);
};

Communication.prototype.requestWave = function() {
  var message = new ClientMessage(Communication.OUTGOING_REQUEST_WAVE);
  this.game.connection.sendMessage(message);
};

Communication.prototype.handleMessage = function(data) {
  var request = new ServerMessage(data);
  switch (request.id)
  {
    case Communication.INCOMING_LOGIN_OK:
      this.handleLoggedIn(request);
      break;
    case Communication.INCOMING_MAP_DATA:
      this.handleMap(request);
      break;
    case Communication.INCOMING_PLAYERS_DATA:
      this.handlePlayers(request);
      break;
    case Communication.INCOMING_PLAYER_MOVEMENT:
      this.handleMovement(request);
      break;
    case Communication.INCOMING_PLAYER_REMOVE:
      this.handleRemovePlayer(request);
      break;
    case Communication.INCOMING_CHAT:
      this.handleChat(request);
      break;
    case Communication.INCOMING_PLAYER_WAVE:
      this.handleWave(request);
      break;
    case Communication.INCOMING_FURNI_DATA:
      this.handleFurni(request);
      break;
    case Communication.INCOMING_FURNI_REMOVE:
      this.handleRemoveFurni(request);
      break;
  }
};

Communication.prototype.handleLoggedIn = function(request) {
  this.game.onLoggedIn();
};

Communication.prototype.handleMap = function(request) {
  updateStatus("Received map");
  var cols = request.popInt();
  var rows = request.popInt();
  var doorX = request.popInt();
  var doorY = request.popInt();

  var heightmap = [];
  for (var i = 0; i < cols; i++) {
    heightmap.push([]);
    for (var j = 0; j < rows; j++) {
      heightmap[i].push(request.popInt());
    }
  }

  this.game.setMap(cols, rows, doorX, doorY, heightmap);
};

Communication.prototype.handlePlayers = function(request) {
  var count = request.popInt();
  updateStatus("Received (" + count + ") players");

  for (var i = 0; i < count; i++) {
    var id = request.popInt();
    var x = request.popInt();
    var y  = request.popInt();
    var z  = parseFloat(request.popString());
    var rot = request.popInt();
    var name = request.popString();
    var look = request.popString();

    if (this.game.currentRoom != null) {
      this.game.currentRoom.setPlayer(id, x, y, z, rot, name, look);
    }
  }
};

Communication.prototype.handleFurni = function(request) {
  var count = request.popInt();
  updateStatus("Received (" + count + ") furniture");
  for (var i = 0; i < count; i++) {
    var id = request.popInt();
    var x = request.popInt();
    var y  = request.popInt();
    var z  = parseFloat(request.popString());
    var rot = request.popInt();
    var baseId = request.popInt();

    if (this.game.currentRoom != null) {
      this.game.currentRoom.setFurni(id, x, y, z, rot, baseId);
    }
  }
};

Communication.prototype.handleMovement = function(request) {
  var userId = request.popInt();
  var x = request.popInt();
  var y = request.popInt();
  var rot = request.popInt();
  if (this.game.currentRoom != null) {
    this.game.currentRoom.movePlayer(userId, x, y, rot);
  }
};

Communication.prototype.handleRemovePlayer = function(request) {
  var userId = request.popInt();
  if (this.game.currentRoom != null) {
    this.game.currentRoom.removePlayer(userId);
  }
};

Communication.prototype.handleRemoveFurni = function(request) {
  var furniId = request.popInt();
  if (this.game.currentRoom != null) {
    this.game.currentRoom.removeFurni(userId);
  }
};

Communication.prototype.handleChat = function(request) {
  var userId = request.popInt();
  var text = request.popString();
  if (this.game.currentRoom != null) {
    this.game.currentRoom.addChat(userId, text);
  }
};

Communication.prototype.handleWave = function(request) {
  var userId = request.popInt();
  if (this.game.currentRoom != null) {
    this.game.currentRoom.addWave(userId);
  }
};

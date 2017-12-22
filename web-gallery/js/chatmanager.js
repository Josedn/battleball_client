Chat.SPEED = 92; //Pixels per seconds
Chat.ROLL_PERIOD = 5000; // ms

function Chat(manager, player, text, x) {
  this.manager = manager;
  this.player = player;
  this.text = text;
  this.x = x;
  this.deltaY = 0;
  this.targetY = 0;
  this.prepareSprite();
}

Chat.prototype.move = function(delta) {
  delta = delta / 1000;
  if (this.targetY < this.deltaY) {
    this.deltaY -= Chat.SPEED * delta;
    if (this.deltaY < this.targetY) {
      this.deltaY = this.targetY;
    }
  }
};

Chat.prototype.prepareSprite = function() {
  var tempCanvas = document.createElement('canvas');
  var tempCtx = tempCanvas.getContext('2d');

  tempCtx.font = Game.FONT_BOLD;
  tempCtx.textBaseline = "top";
  tempCtx.fillStyle = "black";

  var username = this.player.name;
  var text = this.text;

  var usernameWidth = Math.round(tempCtx.measureText(username + ": ").width);
  tempCtx.font = Game.FONT;
  var textWidth = Math.round(tempCtx.measureText(text).width);

  tempCanvas.width = usernameWidth + textWidth + 31 + 10;
  tempCanvas.height = 24;
  tempCtx.textBaseline = "top";

  var currentWidth = 0;

  tempCtx.drawImage(this.manager.sprites.getImage('chat_left'), currentWidth, 0);
  currentWidth += 31;

  for (var i = 0; i < usernameWidth + textWidth; i++) {
    tempCtx.drawImage(this.manager.sprites.getImage('chat_bite'), currentWidth++, 0);
  }

  tempCtx.drawImage(this.manager.sprites.getImage('chat_right'), currentWidth, 0);
  currentWidth += 10;

  tempCtx.font = Game.FONT_BOLD;
  tempCtx.fillText(username + ": ", 31, 5);

  tempCtx.font = Game.FONT;
  tempCtx.fillText(text, 31 + usernameWidth, 5);

  if (this.player.headSprite() != null) {
    tempCtx.drawImage(this.player.headSprite(), 1, -3);
  }
  this.sprite = tempCanvas;
  return tempCanvas;
}

function ChatManager(room) {
  this.room = room;
  this.chats = [];
  this.sprites = new Sprites();
  this.chatRollerCounter = 0;
  this.needsRoll = false;
}

ChatManager.prototype.addChat = function(player, text) {
  var mapPositionX = Math.round((player.x - player.y) * Game.TILE_H) + 22;
  if (this.needsRoll) {
    this.rollChats(1);
  }
  this.chats.push(new Chat(this, player, text, mapPositionX));
  this.needsRoll = true;
};

ChatManager.prototype.loadSprites = function() {
  return [
    this.sprites.loadImage('chat_left', Sprites.LOCAL_RESOURCES_URL + 'chat_left.png'),
    this.sprites.loadImage('chat_right', Sprites.LOCAL_RESOURCES_URL + 'chat_right.png'),
    this.sprites.loadImage('chat_arrow', Sprites.LOCAL_RESOURCES_URL + 'chat_arrow.png'),
    this.sprites.loadImage('chat_bite', Sprites.LOCAL_RESOURCES_URL + 'chat_bite.png')
  ];
};

ChatManager.prototype.rollChats = function(amount) {
  this.chats.forEach(chat => {
    chat.targetY -= (23 * amount);
  });
  this.chatRollerCounter = 0;
  this.needsRoll = false;
};

ChatManager.prototype.tick = function(delta) {
  this.chatRollerCounter += delta;
  if (this.chatRollerCounter > Chat.ROLL_PERIOD) {
    this.rollChats(Math.round(this.chatRollerCounter / Chat.ROLL_PERIOD));
    this.chatRollerCounter = 0;
  }
  this.chats.forEach(chat => {
    chat.move(delta);
  });
};

ChatManager.prototype.getDrawableSprites = function() {
  var sprites = [];
  this.chats.forEach(chat => {
    var centeredScreenX = chat.x - Math.floor(chat.sprite.width / 2);
    var screenY = Math.round(chat.deltaY - (this.room.camera.height / 8));
    sprites.push(new DrawableSprite(chat.sprite, null, centeredScreenX, screenY, DrawableSprite.PRIORITY_CHAT));

    var arrowPositionX = (chat.player.x - chat.player.y) * Game.TILE_H + 27;
    var lefterBound = centeredScreenX + 4;
    var righterBound = lefterBound + chat.sprite.width - 18;
    arrowPositionX = Math.round(Math.max(lefterBound, Math.min(righterBound, arrowPositionX)));
    sprites.push(new DrawableSprite(this.sprites.getImage('chat_arrow'), null, arrowPositionX, screenY + 23, DrawableSprite.PRIORITY_CHAT));
  });
  return sprites;
};

function Connection(messageHandler) {
  this.connected = false;
  var wsImpl = window.WebSocket || window.MozWebSocket;
  // create a new websocket and connect
  this.ws = new wsImpl('ws://beta.habboinn.com:8181/');

  // when data is comming from the server, this metod is called
  this.ws.onmessage = function (evt) {
      messageHandler.handleMessage(evt.data);
  }.bind(this);
  // when the connection is established, this method is called
  this.ws.onopen = function () {
    this.connected = true;
    messageHandler.handleOpenConnection();
  }.bind(this);
  // when the connection is closed, this method is called
  this.ws.onclose = function () {
    this.connected = false;
    messageHandler.handleClosedConnection();
  }.bind(this);
  //when Error
  this.ws.onerror = function () {
    this.connected = false;
    messageHandler.handleConnectionError();
  }.bind(this);
}

Connection.prototype.sendMessage = function(message) {
  if (this.isConnected()) {
    this.ws.send(message.body);
  } else {
    updateStatus("Can't send, socket is no connected");
  }
};

Connection.prototype.isConnected = function() {
  return this.connected;
};

function ServerMessage(data) {
  this.pointer = 0;
  this.id = -1;
  this.body = data;
  this.tokens = data.split('|');
  this.id = this.popInt();
}

ServerMessage.prototype.popToken = function() {
  if (this.tokens.length > this.pointer) {
    return this.tokens[this.pointer++];
  }
  return null;
};

ServerMessage.prototype.popInt = function() {
  return parseInt(this.popToken());
};

ServerMessage.prototype.popString = function() {
  var tickets = this.popInt();
  var str = this.popToken();
  for (var i = 0; i < tickets; i++) {
    str += '|' + this.popToken();
  }
  return str;
};

function ClientMessage(id) {
  this.body = id + "";
}

ClientMessage.prototype.appendToken = function(token) {
  this.body += '|' + token;
};

ClientMessage.prototype.appendInt = function(i) {
  this.appendToken(i + "");
};

ClientMessage.prototype.appendString = function(str) {
  var tickets = 0;
  for (var i = 0; i < str.length; i++) {
    if (str.charAt(i) == '|') {
      tickets++;
    }
  }
  this.appendInt(tickets);
  this.appendToken(str);
};

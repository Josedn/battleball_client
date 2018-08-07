var Game = {};

function updateStatus(status) {
  var stat_div = document.getElementById("status");
  stat_div.innerHTML = status;
  console.log(status);
}

function updateFps(fps) {
  var stat_div = document.getElementById("fps_status");
  stat_div.innerHTML = fps + " fps";
}

function onLogin() {
  var username = document.getElementById("input_username").value;

  var looks = document.getElementsByName('look');
  var look;
  for (var i = 0; i < looks.length; i++) {
    if (looks[i].checked) {
      look = looks[i].value;
    }
  }
  Game.queueLogin(username, look);
}

function onWave() {
  Game.requestWave();
}

function onChatSubmit() {
  var chat_text = document.getElementById("input_chat").value;
  document.getElementById("input_chat").value = "";
  Game.requestChat(chat_text);
}

function showBox() {
  var main_wrapper = document.getElementById("main_wrapper");
  main_wrapper.style.display = 'block';
}

function closeBox() {
  var main_wrapper = document.getElementById("main_wrapper");
  main_wrapper.style.display = 'none';
}

Game.TILE_H = 32;
Game.TILE_W = 64;

Game.FONT = "400 10pt Ubuntu";
Game.FONT_BOLD = "700 10pt Ubuntu";

Game.bindActions = function() {
  var chat_form = document.getElementById("chat_form");
  chat_form.onsubmit = () => { onChatSubmit(); return false; };
  var wave_submit = document.getElementById("wave_submit");
  wave_submit.onclick = () => { onWave(); return false; };
  var login_form = document.getElementById("login_form");
  login_form.onsubmit = () => { onLogin(); return false; };
};

Game.appendPlayer = function(look, direction, checked) {
  const players_container = document.getElementById('players');
  const player_container = document.createElement('div');
  const player_img = document.createElement('img');
  const player_input = document.createElement('input');

  player_container.style = "display:inline-block;padding: 10px;";

  player_input.type = "radio";
  player_input.name="look";
  player_input.value = look;
  if (checked) {
    player_input.checked = "checked";
  }

  player_container.appendChild(player_img);
  player_container.appendChild(document.createElement('br'));
  player_container.appendChild(player_input);

  players_container.appendChild(player_container);

  this.avatarImager.generate(new AvatarImage(look, direction, direction, "wlk", "std", 2, false, "n")).then((img) => {
    player_img.src = img.src;
  });
};

Game.appendPlayers = function() {
  const selectedId = Math.floor((Math.random() * 5) + 1);
  let selectId = 0;
  this.appendPlayer("hd-190-10.lg-3023-1408.ch-215-91.hr-893-45", 2, selectId++ == selectedId);
  this.appendPlayer("hr-828-1407.sh-3089-110.ha-1013-110.ch-3323-110-92.lg-3058-82.hd-180-10", 2, selectId++ == selectedId);
  this.appendPlayer("ch-3050-104-62.ea-987462904-62.sh-305-1185.lg-275-1193.hd-185-1.hr-828-1034", 2, true);
  this.appendPlayer("sh-725-68.he-3258-1410-92.hr-3012-45.ch-665-110.lg-3006-110-110.hd-600-28", 4, selectId++ == selectedId);
  this.appendPlayer("ha-1003-85.ch-665-92.lg-3328-1338-1338.hd-3105-10.sh-3035-64.hr-3012-1394.ea-3169-110.cc-3008-110-110", 4, selectId++ == selectedId);
  this.appendPlayer("ca-1811-62.lg-3018-81.hr-836-45.ch-669-1193.hd-600-10", 4, selectId++ == selectedId);
};

Game.turnJoinButton = function() {
  var login_button = document.getElementById("login_button");
  login_button.value = "Join";
};

Game.run = function(canvas) {
  updateStatus("Loading...");

  this.canvas = canvas;
  this.ctx = this.canvas.getContext('2d');

  this.auxCanvas = document.createElement('canvas');
  this.auxCanvas.style.display = 'none';
  this.auxCtx = this.auxCanvas.getContext('2d');

  this._previousElapsed = 0;
  this.queuedLogin = false;
  this.isConnecting = true;
  this.onResize();

  this.bindActions();

  this.prepareImagers().then(() => {
    this.appendPlayers();
    this.turnJoinButton();
    this.tryConnect();
    window.requestAnimationFrame(this.tick);
  });
}.bind(Game);

Game.prepareImagers = function() {
  this.avatarImager = new AvatarImager();
  this.furnitureImager = new FurnitureImager();
  return Promise.all([this.avatarImager.initialize(), this.furnitureImager.initialize()]);
};

Game.tryConnect = function() {
  this.isConnecting = true;
  this.connection = new Connection(this);
  updateStatus("Connecting to server...");
}.bind(Game);

Game.draw = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.auxCtx.clearRect(0, 0, this.auxCanvas.width, this.auxCanvas.height);

  if (this.currentRoom != null && this.currentRoom.ready) {
    this.currentRoom.draw();
  }
}.bind(Game);

Game.tick = function(elapsed) {
  var delta = (elapsed - this._previousElapsed);
  //delta = Math.min(delta, 0.25); // maximum delta of 250 ms
  this._previousElapsed = elapsed;

  if (this.currentRoom != null && this.currentRoom.ready) {
    this.currentRoom.tick(delta);
  }
  updateFps(Math.round(1000 / delta));
  this.draw();
  window.requestAnimationFrame(this.tick);
}.bind(Game);

Game.queueLogin = function(username, look) {
  this.username = username;
  this.look = look;

  if (this.communication != null) {
    this.doLogin(username, look);
  } else {
    this.queuedLogin = true;
    if (!this.isConnecting) {
      this.tryConnect();
    }
  }
};

Game.requestChat = function(chat) {
  if (this.currentRoom != null && this.currentRoom.ready) {
    this.communication.requestChat(chat);
  }
};

Game.requestWave = function() {
  if (this.currentRoom != null && this.currentRoom.ready) {
    this.communication.requestWave();
  }
};

Game.doLogin = function(username, look) {
  if (this.communication != null) {
    this.communication.doLogin(username, look);
  }
};

Game.onLoggedIn = function() {
  updateStatus("Logged in!");
  closeBox();
  this.communication.requestMap();
};

Game.setMap = function(cols, rows, doorX, doorY, heightmap) {
  this.currentRoom = new Room(cols, rows, doorX, doorY, heightmap, this);
  this.currentRoom.prepare().then(function () {
    updateStatus("Room loaded");
    this.communication.requestRoomData();
  }.bind(Game)).catch(function (err) {
    updateStatus("Fail: " + err);
  });
}.bind(Game);

Game.handleConnectionError = function() {
  updateStatus("Connection fail");
  updateStatus("Can't connect to server :'(");
  showBox();
};

Game.handleOpenConnection = function() {
  updateStatus("Connection is open");
  updateStatus("Connected to server!");
  this.communication = new Communication(this);
  if (this.queuedLogin) {
    this.doLogin(this.username, this.look);
  }
  this.queuedLogin = false;
};

Game.handleMessage = function(data) {
  this.communication.handleMessage(data);
};

Game.handleClosedConnection = function() {
  this.currentRoom = null;
  this.communication = null;
  this.isConnecting = false;
  updateStatus("Connection is closed");
  updateStatus("Lost connection!");
  showBox();
};

Game.onMouseMove = function(x, y, isDrag) {
  if (this.currentRoom != null && this.currentRoom.ready) {
    this.currentRoom.onMouseMove(x, y, isDrag);
  }
}.bind(Game);

Game.onTouchStart = function(x, y) {
  if (this.currentRoom != null && this.currentRoom.ready) {
    this.currentRoom.onTouchStart(x, y);
  }
}.bind(Game);

Game.onTouchMove = function(x, y) {
  if (this.currentRoom != null && this.currentRoom.ready) {
    this.currentRoom.onTouchMove(x, y);
  }
}.bind(Game);

Game.onMouseClick = function(x, y) {
  if (this.currentRoom != null && this.currentRoom.ready) {
    this.currentRoom.onMouseClick(x, y);
  }
}.bind(Game);

Game.onMouseDoubleClick = function(x, y) {
  if (this.currentRoom != null && this.currentRoom.ready) {
    this.currentRoom.onMouseDoubleClick(x, y);
  }
}.bind(Game);

Game.onResize = function() {
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;

  this.auxCanvas.width = window.innerWidth;
  this.auxCanvas.height = window.innerHeight;
  if (this.currentRoom != null) {
    this.currentRoom.onResize();
  }
}.bind(Game);

window.onload = function () {
  var canvas = document.querySelector('canvas');
  Game.run(canvas);

  var isDrag = false;
  canvas.addEventListener('mousemove', function(evt) {
    var rect = canvas.getBoundingClientRect();
    var x = evt.clientX - rect.left;
    var y = evt.clientY - rect.top;
    Game.onMouseMove(x, y, isDrag);
  }, false);
  canvas.addEventListener('click', function(evt) {
    var rect = canvas.getBoundingClientRect();
    var x = evt.clientX - rect.left;
    var y = evt.clientY - rect.top;
    Game.onMouseClick(x, y);
  }, false);

  canvas.addEventListener('dblclick', function(evt) {
    var rect = canvas.getBoundingClientRect();
    var x = evt.clientX - rect.left;
    var y = evt.clientY - rect.top;
    Game.onMouseDoubleClick(x, y);
  }, false);

  window.addEventListener('keydown', function(evt) {
    if (Game.currentRoom != null) {
      document.getElementById("input_chat").focus();
    }
  });

  window.addEventListener('touchstart', function(evt) {
    var rect = canvas.getBoundingClientRect();
    if (evt.touches.length == 1) {
      var x = evt.touches[0].clientX - rect.left;
      var y = evt.touches[0].clientY - rect.top;
      Game.onTouchStart(x, y, true);
    }
  });

  window.addEventListener('touchmove', function(evt) {
    var rect = canvas.getBoundingClientRect();
    if (evt.touches.length == 1) {
      var x = evt.touches[0].clientX - rect.left;
      var y = evt.touches[0].clientY - rect.top;
      Game.onTouchMove(x, y, true);
    }
  });

  canvas.addEventListener('mousedown', function(evt) {
    isDrag = true;
  }, false);

  canvas.addEventListener('mouseup', function(evt) {
    isDrag = false;
  }, false);

  window.addEventListener('resize', function(evt) {
    Game.onResize();
  }, false);
};

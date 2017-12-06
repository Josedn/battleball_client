var Game = {};

Game.run = function(canvas) {
  this.canvas = canvas;
  this.ctx = this.canvas.getContext('2d');
  this._previousElapsed = 0;

  this.onResize();
  window.requestAnimationFrame(this.tick);
}.bind(Game);

Game.draw = function() {
  this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  if (this.currentRoom != null && this.currentRoom.ready) {
    this.currentRoom.draw();
  }
}.bind(Game);

Game.tick = function(elapsed) {
  window.requestAnimationFrame(this.tick);
  var delta = (elapsed - this._previousElapsed) / 1000.0;
  delta = Math.min(delta, 0.25); // maximum delta of 250 ms
  this._previousElapsed = elapsed;

  if (this.currentRoom != null && this.currentRoom.ready) {
    this.currentRoom.tick(delta);
  }

  this.draw();
}.bind(Game);

Game.setMap = function() {
  var matrix = [[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
  this.currentRoom = new Room(9, 13, matrix, this);

  this.currentRoom.prepareRoom().then(function () {
    console.log("ok");
  }).catch(function (err) {
    console.log("Fail: " + err);
  });

}.bind(Game);

Game.onMouseMove = function(x, y, isDrag) {
  if (this.currentRoom != null && this.currentRoom.ready) {
    this.currentRoom.onMouseMove(x, y, isDrag);
  }
}.bind(Game);

Game.onMouseClick = function(x, y) {

}.bind(Game);

Game.onResize = function() {
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
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

    canvas.addEventListener('mousedown', function(evt) {
      isDrag = true;
    }, false);

    canvas.addEventListener('mouseup', function(evt) {
      isDrag = false;
    }, false);

    window.addEventListener('resize', function(evt) {
      Game.onResize();
    }, false);

    //Debug
    Game.setMap();
};

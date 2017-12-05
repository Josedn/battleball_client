function Camera(room) {
  this.room = room;
}

function Room(cols, rows, heightmap) {
    this.cols = cols;
    this.rows = rows;
    this.heightmap = heightmap;
    this.sprites = new Sprites();
}

Room.prototype.drawFloor = function() {

};

Room.prototype.draw = function() {
  this.drawFloor();
};

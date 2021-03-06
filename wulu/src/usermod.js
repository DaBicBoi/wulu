import User from './user';

export default usermod;

/**
 * Modifies user's functionality to
 * enable custom symbols, hiding, and seen
 */

function usermod() {
  if (!Users.User.prototype.originalJoinRoom) {
    Users.User.prototype.originalJoinRoom = Users.User.prototype.joinRoom;
  }

  if (!Users.User.prototype.originalOnDisconnect) {
    Users.User.prototype.originalOnDisconnect = Users.User.prototype.onDisconnect;
  }

  // Custom symbol and hiding
  Users.User.prototype.getIdentity = function(roomid) {
    if (this.locked) {
      return '‽' + this.name;
    }
    if (roomid) {
      if (this.mutedRooms[roomid]) {
        return '!' + this.name;
      }
      var room = Rooms.rooms[roomid];
      if (room && room.auth) {
        if (room.auth[this.userid]) {
          return room.auth[this.userid] + this.name;
        }
        if (room.isPrivate === true) return ' ' + this.name;
      }
    }
    if (this.hiding) {
      return ' ' + this.name;
    }
    if (this.customSymbol) {
      return this.customSymbol + this.name;
    }
    return this.group + this.name;
  };

  // Permanent custom symbols
  Users.User.prototype.joinRoom = function(room, connection) {
    if (room !== 'global') return this.originalJoinRoom(room, connection);
    let self = this;
    // Add delay because when user first join, they don't have there username yet.
    setTimeout(function() {
      User.findOne({name: self.userid}, function(err, userModel) {
        if (err) return;
        if (userModel && userModel.symbol) {
          self.customSymbol = userModel.symbol;
          self.updateIdentity();
          self.hasPermaCustomSymbol = true;
        }
      });
    }, 1000 * 10);
    return this.originalJoinRoom(room, connection);
  };

  // Seen
  Users.User.prototype.onDisconnect = function(connection) {
    let self = this;
    User.findOne({ name: this.userid }, function(err, user) {
      if (err) return;
      if (!user) {
        user = new User({
          name: self.userid,
          seen: Date.now()
        });
        return user.save();
      }
      user.seen = Date.now();
      user.save();
    });
    this.originalOnDisconnect(connection);
  };
}

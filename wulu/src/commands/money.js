import is from 'is_js';
import Economy from '../economy';

export default money;

let currency_name = Economy.currency_name;

/**
 * Handle money commands from Economy.
 */

function money() {
  let commands = {
    atm: 'wallet',
    purse: 'wallet',
    wallet(target, room) {
      if (!this.canBroadcast()) return;
      let targetUser = this.targetUserOrSelf(target);
      let currency = currency_name;
      Economy.get(targetUser.name.toLowerCase(), function(amount) {
        if (amount >= 2) currency += 's';
        this.sendReplyBox(`${targetUser.name} has ${amount} ${currency}.`);
        room.update();
      }.bind(this));
    },

    'generatemoney': 'givemoney',
    givemoney(target, room, user) {
      if (!user.can('givemoney')) return;
      if (!target || target.indexOf(',') < 0) return this.parse('/help givemoney');

      let parts = target.split(',');
      this.splitTarget(parts[0]);
      let amount = Number(parts[1].trim());
      let currency = currency_name;

      if (!this.targetUser) return this.sendReply(`User ${this.targetUsername} not found.`);
      if (is.not.number(amount)) return this.sendReply('Must be a number.');
      if (is.decimal(amount)) return this.sendReply('Cannot contain a decimal.');
      if (amount < 1) return this.sendReply(`You can't give less than one ${currency}.`);
      if (amount >= 2) currency += 's';

      Economy.give(this.targetUsername.toLowerCase(), amount, function(total) {
        let cash = total >= 2 ? currency_name + 's' : currency_name;
        this.sendReply(`${this.targetUsername} was given ${amount} ${currency}. This user now has ${total} ${cash}.`);
        Users.get(this.targetUsername).send(`${user.name} has given you ${amount} ${currency}. You now have ${total} ${cash}.`);
      }.bind(this));
    },

    takemoney(target, room, user) {
      if (!user.can('takemoney')) return;
      if (!target || target.indexOf(',') < 0) return this.parse('/help takemoney');

      let parts = target.split(',');
      this.splitTarget(parts[0]);
      let amount = Number(parts[1].trim());
      let currency = currency_name;

      if (!this.targetUser) return this.sendReply(`User ${this.targetUsername} not found.`);
      if (is.not.number(amount)) return this.sendReply('Must be a number.');
      if (is.decimal(amount)) return this.sendReply('Cannot contain a decimal.');
      if (amount < 1) return this.sendReply(`You can't give less than one ${currency}.`);
      if (amount >= 2) currency += 's';

      Economy.take(this.targetUsername.toLowerCase(), amount, function(total) {
        let cash = total >= 2 ? currency_name + 's' : currency_name;
        this.sendReply(`${this.targetUsername} was losted ${amount} ${currency}. This user now has ${total} ${cash}.`);
        Users.get(this.targetUsername).send(`${user.name} has taken ${amount} ${currency} from you. You now have ${total} ${cash}.`);
      }.bind(this));
    },

    transfer: 'transfermoney',
    transfermoney(target, room, user) {
      if (!target || target.indexOf(',') < 0) return this.parse('/help takemoney');

      let parts = target.split(',');
      this.splitTarget(parts[0]);
      let amount = Number(parts[1].trim());
      let currency = currency_name;
      let targetName = this.targetUsername;

      if (!this.targetUser) return this.sendReply(`User ${targetName} not found.`);
      if (is.not.number(amount)) return this.sendReply('Must be a number.');
      if (is.decimal(amount)) return this.sendReply('Cannot contain a decimal.');
      if (amount < 1) return this.sendReply(`You can't give less than one ${currency}.`);
      if (amount >= 2) currency += 's';

      let self = this;
      Economy.get(user.name.toLowerCase(), function(userAmount) {
        if (amount > userAmount) return self.sendReply('You cannot transfer more money than what you have.');
        Economy.give(targetName.toLowerCase(), amount, function(targetTotal) {
          Economy.take(user.name.toLowerCase(), amount, function(userTotal) {
            let targetCash = targetTotal >= 2 ? currency_name + 's' : currency_name;
            let userCash = userTotal >= 2 ? currency_name + 's' : currency_name;
            self.sendReply(`You have successfully transferred ${amount} ${currency} to ${targetName}. You now have ${userTotal} ${userCash}.`);
            self.sendReply(`${user.name} has transferred ${amount} ${currency} to you. You now have ${targetTotal} ${targetCash}.`);
          });
        });
      });
    }
  };

  Object.merge(CommandParser.commands, commands);
}

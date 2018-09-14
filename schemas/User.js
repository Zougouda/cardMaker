const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
	userID: Number,
	favoriteCards: [{ type: Schema.Types.ObjectId, ref: 'MagicCard' }]
});

module.exports = User;

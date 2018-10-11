const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MagicCard = new Schema({
	userID: Number,
	wholeCardImgSrc: String,
	created: {type: Date, default: Date.now, index: true}, // adding an index on this field to prevent Overflow sort error

	cardPattern: {type: String, default: 'magic'},
	illustration: String,
	title: String,
	description: String,
	manaCost: String,
	type: String,
	rarity: String,
	author: String,
	power: String,
	toughness: String,

	premium: Boolean,

	/* HS specific */
	class: String,

	/* Gwent specific */
	faction: String,
	row: String,
	borderType: String,
});

module.exports = MagicCard;

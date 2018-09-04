const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MagicCard = new Schema({
	userID: Number,
	wholeCardImgSrc: String,

	illustration: String,
	title: String,
	description: String,
	manaCost: String,
	type: String,
	rarity: String,
	author: String,
	power: String,
	toughness: String,
});

module.exports = MagicCard;

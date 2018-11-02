const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MagicCard = new Schema({
	userID: Number,
	wholeCardImgSrc: String,
	//extension: {type: String, default: '.png'},
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

	/* Yu-gi-oh specific */
	template: String,
	attribute: String,
	level: Number,

	/* double Magic cards specific */
	//wholeCardImgSrc2: String,
	//extension2: {type: String, default: '.png'},
	illustration2: String,
	title2: String,
	description2: String,
	manaCost2: String,
	type2: String,
	power2: String,
	toughness2: String,
	
});

module.exports = MagicCard;

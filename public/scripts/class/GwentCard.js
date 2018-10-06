class GwentCard extends GenericCard
{
	beforeInit()
	{
		super.beforeInit();
	}

	setAttributes()
	{
		var self = this;
		this.attributes = 
		{
			illustration: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.uploader'),
				onchange: function(val)
				{
					this.cardObject.setCropperSrc( window.URL.createObjectURL(this.inputDOM.files[0]) );
				},
				ondraw: function()
				{
					// TODO
				},
			}),
			faction: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-class-selector'), // TODO
				ondraw: function(){}
			}),
			frameType: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-class-selector'), // TODO
				ondraw: function(){}
			}),
			rarity: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-rarity-selector'),
				boundingBox: {
					top: 306,
					left: 204,
					width: 22,
					height: 22
				},
				ondraw: function()
				{
					//this.rarityIconSrc = '/images/icons_hearthstone/rarities/';
					//this.rarityIconSrc += 'gem_' + this.value + '.png';
					//this.rarityIcon = new Image();
					//this.rarityIcon.src = this.rarityIconSrc;
					//
					//var x = this.boundingBox.left, y = this.boundingBox.top;
					//if(!this.cardObject.isACreature())
					//{
					//	x -= 6;
					//	y -= 6;
					//}
					//
					//this.rarityIcon.onload = ()=>
					//{
					//	this.cardObject.ctx.drawImage(
					//		this.rarityIcon, 
					//		x, 
					//		y,
					//		this.boundingBox.width, 
					//		this.boundingBox.height
					//	);
					//};
				}
			}),
			premium: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-premium'),
				boundingBox: {
					left: 112,
					top: -28 + HearthstoneCard.aditionalHeight,
					width: 234 * 1.2,
					height: 174 * 1.2
				},
				onready: function()
				{
					this.value = this.inputDOM.checked; // checkbox specific
				},
				onchange: function()
				{
					this.value = this.inputDOM.checked; // checkbox specific
					this.cardObject.update();
				},
				ondraw: function()
				{
					//var premiumImg = new Image();
					//premiumImg.onload = ()=>
					//{
					//	this.cardObject.ctx.drawImage(
					//		premiumImg,
					//		this.boundingBox.left, this.boundingBox.top,
					//		this.boundingBox.width, this.boundingBox.height
					//	);
					//};
					//premiumImg.src = '/images/icons_hearthstone/card_minion_legendary_dragon_bracket.png';
				}
			}),
		};
	}

	getCardFrameSrc()
	{
	}
}

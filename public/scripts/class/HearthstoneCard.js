class HearthstoneCard extends GenericCard
{
	init()
	{
		super.init();

		this.cardWidth = 270, this.cardheight = 383;
		this.defaultFont = 'Trajan';

		this.setAttributes();
		this.attributes['illustration'].value = this.uploadedImage.src;
		if(GenericCard.lastCropperSrc)
			this.setCropperSrc(GenericCard.lastCropperSrc);
		this.update();
	}

	setAttributes()
	{
		var self = this;
		this.attributes = {
			illustration: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.uploader'),
				boundingBox: {
					left: 0,
					top: 0,
					width: 270,
					height: 220
				},
				onchange: function(val)
				{
					this.cardObject.setCropperSrc( window.URL.createObjectURL(this.inputDOM.files[0]) );
				},
				onready: ()=>
				{
					/* Add illustration by url from input text  */
					['change', 'keyup'].forEach((action)=>
					{
						document.querySelector('input.uploader-by-url').addEventListener(action, (e)=>
						{
							this.setCropperSrc( e.target.value, true );
						});
					});
				},
				ondraw: function()
				{
					var actualDraw = (ctx, source)=>
					{
						ctx.save();
						ctx.beginPath();
						ctx.ellipse(136, 130, 75, 100, 0, 0, 2 * Math.PI); // static ellipse containing the illustration
						ctx.clip();

						//ctx.clearRect(this.boundingBox.left, this.boundingBox.top, this.boundingBox.width, this.boundingBox.height); // clear card's caption
						//ctx.fillStyle = '#FFFFFF';
						//ctx.fillRect(this.boundingBox.left, this.boundingBox.top, this.boundingBox.width, this.boundingBox.height);
						ctx.save();
						ctx.globalCompositeOperation = 'destination-over'; // draw image below the frame
						ctx.drawImage(source, this.boundingBox.left-1, this.boundingBox.top, this.boundingBox.width+1, this.boundingBox.height); // TODO fix these offset/width values
						ctx.restore();

						ctx.restore();

					};

					this.cardObject.ctx.clearRect(0, 0, this.cardObject.cardWidth, this.cardObject.cardheight); // clear the whole card

					this.cardObject.ctx.drawImage(
						this.cardObject.cardFrameImg, 0, 0, 
						this.cardObject.cardWidth, 
						this.cardObject.cardheight
					); // draw frame

					if(this.cardObject.cropper)
					{
						actualDraw(this.cardObject.ctx, this.cardObject.cropper.getCroppedCanvas() );
					}
					else if(this.value)
					{
						this.cardObject.uploadedImage.src = this.value;
						this.cardObject.uploadedImage.onload = ()=>
						{
							actualDraw(this.cardObject.ctx, this.cardObject.uploadedImage);
						};
					}
					//else
					//{
					//	this.cardObject.ctx.drawImage(
					//		this.cardObject.cardFrameImg, 0, 0, 
					//		this.cardObject.cardWidth, 
					//		this.cardObject.cardheight
					//	); // draw frame
					//}
				}
			}),
			title: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-title'),
				boundingBox: {
					left: 36,
					top: 220,
					width: 200,
					height: 10
				},
				ondraw: function()
				{
					var ctx = this.cardObject.ctx;
					ctx.save();
					ctx.fillStyle = 'white';
					ctx.strokeStyle = 'black';
					ctx.lineWidth = 3;
					ctx.font = 'bold 24px '+this.cardObject.defaultFont;
					ctx.textAlign = 'center';
					ctx.strokeText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top); // write centered text
					ctx.fillText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top);
					ctx.restore();
				}
			}),
			description: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-description'),
				boundingBox: {
					left: 50,
					top: 270,
					width: 180,
					height: 120
				},
				ondraw: function()
				{
					var ctx = this.cardObject.ctx;
					var descFontSize = 20;
					ctx.font = descFontSize+'px '+this.cardObject.defaultFont;
					ctx.fillStyle = 'white';
					ctx.strokeStyle = 'black';
					this.cardObject.wrapText(
						this.cardObject.ctx, 
						this.value, 
						this.boundingBox.left, 
						this.boundingBox.top, 
						this.boundingBox.width, 
						descFontSize
					);
				}
			}),
			manaCost: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-mana-cost'),
				boundingBox: {
					top: 76,
					left: 15,
					width: 44
				},
				ondraw: function()
				{
					var ctx = this.cardObject.ctx;
					ctx.save();
					ctx.fillStyle = 'white';
					ctx.strokeStyle = 'black';
					ctx.lineWidth = 4;
					ctx.textAlign = 'center';
					ctx.font = 'bold 48px '+this.cardObject.defaultFont;
					ctx.strokeText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top); // write centered text
					ctx.fillText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top);
					ctx.restore();
				}
			}),
			type: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-type'),
				boundingBox: {
					top: 336,
					left: 40
				},
				ondraw: function()
				{
					// TODO
				}
			}),
			class: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-class-selector'),
				ondraw: function()
				{}
			}),
			rarity: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-rarity-selector'),
				boundingBox: {
					top: 318,
					left: 340,
					width: 22,
					height: 22
				},
				ondraw: function()
				{
					this.rarityIconSrc = '/images/icons/rarities/default/';
					this.rarityIconSrc += 'm-' + this.value + '.png';
					this.rarityIcon = new Image();
					this.rarityIcon.src = this.rarityIconSrc;
					
					this.rarityIcon.onload = ()=>
					{
						// TODO
						//this.cardObject.ctx.drawImage(
						//	this.rarityIcon, 
						//	this.boundingBox.left, 
						//	this.boundingBox.top,
						//	this.boundingBox.width, 
						//	this.boundingBox.height
						//);
					};
				}
			}),
			author: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-author'),
				boundingBox: {
					top: 522,
					left: 32
				},
				onready: function()
				{
					/* retrieve user's name from localstorage */
					var userName = localStorage.getItem('userName');
					if(userName)
					{
						this.value = userName;
						this.inputDOM.value = this.value;
					}
				},
				onchange: function()
				{
					this.cardObject.update();
					localStorage.setItem('userName', this.value); // Store username into localStorage
				},
				ondraw: function()
				{
					// TODO
				}
			}),
			power: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-power'),
				boundingBox: {
					top: 362,
					left: 25,
					width: 36,
				},
				ondraw: function()
				{
					var ctx = this.cardObject.ctx;
					ctx.save();
					ctx.fillStyle = 'white';
					ctx.strokeStyle = 'black';
					ctx.lineWidth = 4;
					ctx.textAlign = 'center';
					ctx.font = 'bold 36px '+this.cardObject.defaultFont;
					ctx.strokeText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top); // write centered text
					ctx.fillText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top);
					ctx.restore();
				}
			}),
			toughness: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-toughness'),
				boundingBox: {
					top: 362,
					left: 215,
					width: 36,
				},
				ondraw: function()
				{
					var ctx = this.cardObject.ctx;
					ctx.save();
					ctx.fillStyle = 'white';
					ctx.strokeStyle = 'black';
					ctx.lineWidth = 4;
					ctx.textAlign = 'center';
					ctx.font = 'bold 36px '+this.cardObject.defaultFont;
					ctx.strokeText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top); // write centered text
					ctx.fillText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top);
					ctx.restore();
				}
			}),
		};
	}

	getCardFrameSrc()
	{
		var folder = '/images/frames_hearthstone/';
		var file = 'card_'
		if(this.attributes.toughness.value)
			file += 'minion_';
		else
			file += 'spell_';
		file += this.attributes.class.value;
		file += '.png';

		var src = folder + file;
		return src;
		//return '/images/frames_hearthstone/neutral_monster.png'
	}

	exportJson()
	{
		var json = super.exportJson();
		json.cardPattern = 'hearthstone';
		console.log(json);
		return json;
	}
}
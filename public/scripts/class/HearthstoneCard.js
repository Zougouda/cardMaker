class HearthstoneCard extends GenericCard
{
	init()
	{
		super.init();

		//this.cardWidth = 270, this.cardheight = 383;
		this.cardWidth = 400, this.cardheight = 543;
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
					width: this.cardWidth,
					height: 320
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
						if(this.cardObject.isACreature()) // is a creature
						{
							ctx.beginPath();
							ctx.ellipse(this.cardObject.cardWidth*52/100, 160, 110, 150, 0, 0, 2 * Math.PI); // static ellipse containing the illustration
							ctx.strokeStyle = 'red'; ctx.lineWidth = 4;
							if(this.debug)
								ctx.stroke();
							ctx.clip();
						}
						else // is a spell
						{
							ctx.beginPath();
							ctx.rect(50, 50, 320, 220); // static reactangle containing the illustration
							ctx.strokeStyle = 'red'; ctx.lineWidth = 4;
							if(this.debug)
								ctx.stroke();
							ctx.clip();
						}

						ctx.globalCompositeOperation = 'destination-over'; // draw image below the frame
						ctx.drawImage(source, this.boundingBox.left-1, this.boundingBox.top, this.boundingBox.width+1, this.boundingBox.height); // TODO fix these offset/width values
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
				}
			}),
			title: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-title'),
				boundingBox: {
					left: 62,
					top: 295,
					width: this.cardWidth - 54 - 36,
					height: 10
				},
				ondraw: function()
				{
					var ctx = this.cardObject.ctx;
					ctx.save();
					ctx.fillStyle = 'white';
					ctx.strokeStyle = 'black';
					ctx.lineWidth = 3;
					ctx.font = 'bold 28px '+this.cardObject.defaultFont;
					ctx.textAlign = 'center';

					if(this.cardObject.isACreature())
					{
						ctx.translate(this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top);
						ctx.rotate(-4 * Math.PI/180);
						ctx.strokeText(this.value, 0, 0); // write centered text
						ctx.fillText(this.value, 0, 0);
					}
					else
					{
						ctx.strokeText(this.value, this.boundingBox.left + this.boundingBox.width/2 - 15, this.boundingBox.top - 12); // write centered text
						ctx.fillText(this.value, this.boundingBox.left + this.boundingBox.width/2 - 15, this.boundingBox.top - 12); // write centered text
					}
					ctx.restore();
				}
			}),
			description: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-description'),
				boundingBox: {
					left: 78,
					top: 360,
					width: 260,
					height: 90
				},
				ondraw: function()
				{
					var ctx = this.cardObject.ctx;
					var descFontSize = 20;
					ctx.font = descFontSize+'px '+this.cardObject.defaultFont;
					ctx.fillStyle = 'black';
					ctx.lineWidth = 0;
					//ctx.textAlign = 'center';

					var x = this.boundingBox.left,
						y = this.boundingBox.top,
						width = this.boundingBox.width;
					if(!this.cardObject.isACreature())
					{
						x += 15;
						y += 25;
						width -= 20;
					}

					this.cardObject.wrapText(
						this.cardObject.ctx, 
						this.value, 
						x, 
						y, 
						width, 
						descFontSize
					);
				}
			}),
			manaCost: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-mana-cost'),
				boundingBox: {
					top: 72,
					left: 42,
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
					ctx.font = 'bold 72px '+this.cardObject.defaultFont;
					ctx.strokeText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top); // write centered text
					ctx.fillText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top);
					ctx.restore();
				}
			}),
			type: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-type'),
				boundingBox: {
					top: 467,
					left: 132,
					width: 156,
					height: 36
				},
				ondraw: function()
				{
					if(!this.value)
						return;

					var typeFrameSrc = '/images/icons_hearthstone/card_race.png';
					var typeFrameImg = new Image();
					typeFrameImg.onload = ()=>
					{
						var ctx = this.cardObject.ctx;
						ctx.drawImage( 
							typeFrameImg, 
							this.boundingBox.left, this.boundingBox.top,
							this.boundingBox.width, this.boundingBox.height
						);
						ctx.save();
						ctx.textAlign = 'center';
						ctx.fillStyle = 'white';
						ctx.strokeStyle = 'black';
						ctx.lineWidth = 3;
						ctx.font = 'bold 18px '+this.cardObject.defaultFont;
						ctx.strokeText(
							this.value,
							this.boundingBox.left + this.boundingBox.width/2,
							this.boundingBox.top + 26
						);
						ctx.fillText(
							this.value,
							this.boundingBox.left + this.boundingBox.width/2,
							this.boundingBox.top + 26
						);
						ctx.restore();
					};
					typeFrameImg.src = typeFrameSrc;
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
					top: 500,
					left: 48,
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
					ctx.font = 'bold 54px '+this.cardObject.defaultFont;
					ctx.strokeText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top); // write centered text
					ctx.fillText(this.value, this.boundingBox.left + this.boundingBox.width/2, this.boundingBox.top);
					ctx.restore();
				}
			}),
			toughness: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-toughness'),
				boundingBox: {
					top: 500,
					left: 336,
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
					ctx.font = 'bold 54px '+this.cardObject.defaultFont;
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
		if(this.isACreature())
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

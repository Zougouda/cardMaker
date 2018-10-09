class GwentCard extends GenericCard
{
	beforeInit()
	{
		super.beforeInit();
		this.cardWidth = 400;
		this.cardheight = 528;
	}

	setAttributes()
	{
		var self = this;
		this.attributes = 
		{
			illustration: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.uploader'),
				boundingBox: {
					left: this.cardWidth - 340,
					top: this.cardheight - 475,
					width : 340,
					height: 475,
				},
				onchange: function(val)
				{
					this.cardObject.setCropperSrc( window.URL.createObjectURL(this.inputDOM.files[0]) );
				},
				ondraw: function()
				{
					var ctx = this.cardObject.ctx;

					var actualDraw = (ctx, source) =>
					{
						ctx.save();
						ctx.globalCompositeOperation = 'destination-over'; // draw image below the frame
						ctx.rect(
							this.boundingBox.left-1 + 5, this.boundingBox.top +5, 
							this.boundingBox.width -10, this.boundingBox.height -10 
						);
						ctx.clip();
						ctx.drawImage(source, this.boundingBox.left-1, this.boundingBox.top, this.boundingBox.width+1, this.boundingBox.height); // TODO fix these offset/width values
						ctx.restore();
					};

					this.cardObject.ctx.clearRect(0, 0, this.cardObject.cardWidth, this.cardObject.cardheight); // clear the whole card
					
					var factionBorderSrc = this.cardObject.getFactionFrameSrc();
					var factionBorderImg = new Image();
					factionBorderImg.onload = ()=>
					{
						ctx.drawImage(
							factionBorderImg,
							this.boundingBox.left + 10 , this.boundingBox.top + 12 ,
							319, 
							454
						); // draw faction frame

						ctx.drawImage(
							this.cardObject.cardFrameImg,
							this.boundingBox.left, this.boundingBox.top,
							this.boundingBox.width, this.boundingBox.height
						); // draw border (bronze, silver or gold)

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

						/* title */
						var titleAttr = this.cardObject.attributes.title;
						if(titleAttr.value)
						{
							ctx.save();
							ctx.fillStyle = 'black';
							ctx.globalAlpha = 0.75;
							ctx.fillRect(
								titleAttr.boundingBox.left,
								titleAttr.boundingBox.top,
								titleAttr.boundingBox.width,
								titleAttr.boundingBox.height
							);
							ctx.restore();

							/* draw icon before the title */
							var factionIconImg = new Image();
							factionIconImg.onload = ()=>
							{
								ctx.drawImage(
									factionIconImg,
									titleAttr.boundingBox.left,
									titleAttr.boundingBox.top,
									30,
									30
								);
							};
							factionIconImg.src = this.cardObject.getFactionIconSrc();

							ctx.save();
							var fontSize = 32,
								titleFits = false, 
								offsetLeft = 32, 
								offsetTop = 0;
							while(!titleFits) // change text font based on his measured width
							{
								ctx.font = `bold ${fontSize}px ${this.cardObject.defaultFont}`;
								var titleWidth = ctx.measureText(titleAttr.value).width;
								if(titleWidth + offsetLeft <= titleAttr.boundingBox.width)
									titleFits = true;
								else
									fontSize--;
							}
							ctx.fillStyle = 'white';
							ctx.textBaseline = 'top'; 

							offsetTop = (titleAttr.boundingBox.height - fontSize)/2; // text vertically centered
							ctx.fillText(
								titleAttr.value, 
								titleAttr.boundingBox.left + offsetLeft,
								titleAttr.boundingBox.top + offsetTop
							);
							ctx.restore();
						}

						/* Description */
						var descAttr = this.cardObject.attributes.description;
						if(descAttr.value)
						{
							ctx.save();
							ctx.fillStyle = 'black';
							ctx.globalAlpha = 0.75;
							ctx.fillRect(
								descAttr.boundingBox.left,
								descAttr.boundingBox.top,
								descAttr.boundingBox.width,
								descAttr.boundingBox.height
							);
							ctx.restore();

							ctx.save();
							ctx.fillStyle = 'white';
							ctx.textBaseline = 'top'; 
							var descFontSize = 16;
							ctx.font = `bold ${descFontSize}px ${this.cardObject.defaultFont}`;
							this.cardObject.wrapText(
								ctx, 
								descAttr.value, 
								descAttr.boundingBox.left, 
								descAttr.boundingBox.top, 
								descAttr.boundingBox.width, 
								descFontSize
							);
							ctx.restore();
						}

						/* Rarity */
						var rarityAttr = this.cardObject.attributes.rarity;
						var rarityImg = new Image();
						rarityImg.onload = ()=>
						{
							ctx.drawImage(
								rarityImg,
								rarityAttr.boundingBox.left,
								rarityAttr.boundingBox.top,
								rarityAttr.boundingBox.width,
								rarityAttr.boundingBox.height,
							);
						};
						rarityImg.src = this.cardObject.getRarityIconSrc();
					};
					factionBorderImg.src = factionBorderSrc;
				},
			}),
			faction: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-faction-selector'),
				ondraw: function()
				{
					var bannerImg = new Image();
					var bannerSrc = this.cardObject.getFactionBannerSrc();

					bannerImg.onload = ()=>
					{
						var ctx = this.cardObject.ctx;

						ctx.drawImage(
							bannerImg,
							0, 0,
							163, 431
						);

						/* we draw power and row below here for an easier layer management */
						/* Power */
						ctx.save();
						ctx.font = 'bold 64px '+this.cardObject.defaultFont;
						ctx.textAlign = 'center';
						ctx.fillStyle = 'white';
						ctx.strokeStyle = 'black';
						ctx.lineWidth = 8;
						ctx.strokeText(
							this.cardObject.attributes.power.value, 
							80, 
							105
						);
						ctx.fillText(
							this.cardObject.attributes.power.value, 
							80, 
							105
						);
						ctx.restore();

						/* Row */
						var rowImg = new Image();
						rowImg.onload = ()=>
						{
							ctx.drawImage
							(
								rowImg,
								80 - 80/2,
								125,
								80, 
								80
							);
						};
						rowImg.src = this.cardObject.getRowIconSrc();

					};
					bannerImg.src = bannerSrc;
				}
			}),
			title: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-title'),
				boundingBox: {
					left: this.cardWidth - 340 + 50,
					top: this.cardheight - 150,
					width : 340 - 50*2,
					height: 32
				}
			}),
			description: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-description'),
				boundingBox: {
					left: this.cardWidth - 340 + 50,
					top: this.cardheight - 110,
					width : 340 - 50*2,
					height: 90
				},
			}),
			power: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-power'),
			}),
			borderType: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-border-selector'),
				ondraw: function(){}
			}),
			row: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-row-selector'),
				ondraw: function(){}
			}),
			rarity: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-rarity-selector'),
				boundingBox: {
					left: this.cardWidth - 39,
					top: this.cardheight - 39,
					width: 22,
					height: 22
				},
			}),
			premium: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-premium'),
				onready: function()
				{
					this.value = this.inputDOM.checked; // checkbox specific
				},
				onchange: function()
				{
					this.value = this.inputDOM.checked; // checkbox specific
					this.cardObject.update();
				},
			}),
		};
	}

	getCardFrameSrc()
	{
		return `/images/frames_gwent/border_${this.attributes.borderType.value}.png`;
	}

	getFactionFrameSrc()
	{
		return `/images/frames_gwent/bgFaction${this.attributes.faction.value}.png`;
	}

	getFactionBannerSrc()
	{
		var src = `/images/icons_gwent/factionIcon${this.attributes.faction.value}`;
		if(this.attributes.premium.value)
			src += 'l';
		src += '.png';
		return src;
	}

	getRowIconSrc()
	{
		return `/images/icons_gwent/row_${this.attributes.row.value}.png`;
	}

	getRarityIconSrc()
	{
		return `/images/icons_gwent/rarity_${this.attributes.rarity.value}.png`;
	}

	getFactionIconSrc()
	{
		return `/images/icons_gwent/faction${this.attributes.row.value}.png`;
	}
}

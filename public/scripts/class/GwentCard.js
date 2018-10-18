class GwentCard extends GenericCard
{
	beforeInit()
	{
		super.beforeInit();
		this.cardWidth = 400;
		this.cardheight = 528;

		this.factionBorderImg = new Image();
		this.factionIconImg = new Image();
		this.rarityImage = new Image();
		this.bannerImg = new Image();
		this.rowImg = new Image();
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
					var factionBorderImgOnload = ()=>
					{
						this.cardObject.factionBorderImg.ready = true;

						ctx.drawImage(
							this.cardObject.factionBorderImg,
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
							this.cardObject.uploadedImage.onload = ()=>
							{
								this.cardObject.uploadedImage.ready = true;
								actualDraw(this.cardObject.ctx, this.cardObject.uploadedImage);
							};
							if(!this.cardObject.uploadedImage.ready)
								this.cardObject.uploadedImage.src = this.value;
							else
								actualDraw(this.cardObject.ctx, this.cardObject.uploadedImage);
						}

						/* title */
						var titleAttr = this.cardObject.attributes.title;
						if(titleAttr.value)
						{
							ctx.save();
							ctx.fillStyle = 'black';
							ctx.globalAlpha = 0.3;
							ctx.fillRect(
								titleAttr.boundingBox.left,
								titleAttr.boundingBox.top,
								titleAttr.boundingBox.width,
								titleAttr.boundingBox.height
							);
							ctx.restore();

							/* draw icon before the title */
							var factionIconImgOnload = ()=>
							{
								this.cardObject.factionIconImg.ready = true;
								ctx.drawImage(
									this.cardObject.factionIconImg,
									titleAttr.boundingBox.left,
									titleAttr.boundingBox.top,
									30,
									30
								);
							};
							this.cardObject.factionIconImg.onload = factionIconImgOnload;
							if(!this.cardObject.factionIconImg.ready)
								this.cardObject.factionIconImg.src = this.cardObject.getFactionIconSrc();
							else
								factionIconImgOnload();

							ctx.save();
							var fontSize = 32,
								offsetLeft = 32, 
								offsetTop = 0;

							ctx.fillStyle = 'white';
							ctx.textBaseline = 'top'; 

							ctx.font = `bold ${fontSize}px ${this.cardObject.defaultFont}`;
							fontSize = GenericCard.getFontSizeToFitText(this.cardObject.ctx, titleAttr.value, titleAttr.boundingBox.width - offsetLeft);
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
							ctx.globalAlpha = 0.4;
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
						var rarityImgOnload = ()=>
						{
							this.cardObject.rarityImage.ready = true;
							ctx.drawImage(
								this.cardObject.rarityImage,
								rarityAttr.boundingBox.left,
								rarityAttr.boundingBox.top,
								rarityAttr.boundingBox.width,
								rarityAttr.boundingBox.height,
							);
						};
						this.cardObject.rarityImage.onload = rarityImgOnload;
						if(!this.cardObject.rarityImage.ready)
							this.cardObject.rarityImage.src = this.cardObject.getRarityIconSrc();
						else
							rarityImgOnload();

						/* Faction top-left icon */
						var bannerImgOnload = ()=>
						{
							this.cardObject.bannerImg.ready = true;
							ctx.drawImage(
								this.cardObject.bannerImg,
								0, 0,
								163, 431
							);

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
							var rowImgOnload = ()=>
							{
								this.cardObject.rowImg.ready = true;
								ctx.drawImage
								(
									this.cardObject.rowImg,
									80 - 80/2,
									125,
									80, 
									80
								);
							};
							this.cardObject.rowImg.onload = rowImgOnload;
							var rowIconSrc = this.cardObject.getRowIconSrc();
							if(rowIconSrc)
							{
								if(!this.cardObject.rowImg.ready)
									this.cardObject.rowImg.src = this.cardObject.getRowIconSrc();
								else
									rowImgOnload();
							}
						};
						this.cardObject.bannerImg.onload = bannerImgOnload;
						if(!this.cardObject.bannerImg.ready)
							this.cardObject.bannerImg.src = this.cardObject.getFactionBannerSrc();
						else
							bannerImgOnload();
					};
					this.cardObject.factionBorderImg.onload = factionBorderImgOnload;
					if(!this.cardObject.factionBorderImg.ready)
						this.cardObject.factionBorderImg.src = factionBorderSrc;
					else
						factionBorderImgOnload();
				},
			}),
			faction: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-faction-selector'),
				onchange: function()
				{
					this.cardObject.factionBorderImg.ready = false;
					this.cardObject.factionIconImg.ready = false;
					this.cardObject.bannerImg.ready = false;
					this.cardObject.update();
				},
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
			}),
			row: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-row-selector'),
				onchange: function()
				{
					this.cardObject.rowImg.ready = false;
					this.cardObject.update();
				},
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
				onchange: function()
				{
					this.cardObject.rarityImage.ready = false;
					this.cardObject.update();
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
					this.cardObject.bannerImg.ready = false;
					this.cardObject.update();
				},
			}),
			author: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-author'),
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
		if(!this.attributes.row.value)
			return null;
			
		return `/images/icons_gwent/row_${this.attributes.row.value}.png`;
	}

	getRarityIconSrc()
	{
		return `/images/icons_gwent/rarity_${this.attributes.rarity.value}.png`;
	}

	getFactionIconSrc()
	{
		return `/images/icons_gwent/faction${this.attributes.faction.value}.png`;
	}
}

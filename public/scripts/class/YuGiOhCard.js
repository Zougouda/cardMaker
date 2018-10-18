class YuGiOhCard extends GenericCard
{
	beforeInit()
	{
		super.beforeInit();
		this.cardWidth = 420, this.cardheight = 610; 
	}

	getCardFrameSrc()
	{
		switch(this.attributes.template.value)
		{
			case 'spell':
				return '/images/frames_ygo/Spell.png';
			break;

			case 'trap':
				return '/images/frames_ygo/Trap.png';
			break;

			default:
				return '/images/frames_ygo/Normal.png';
			break;
		}
	}

	isACreature()
	{
		return (this.attributes.template.value === 'normal');
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
					left: 52,
					top: 110,
					width: 318,
					height: 320
				},
				onchange: function(val)
				{
					this.cardObject.setCropperSrc( window.URL.createObjectURL(this.inputDOM.files[0]) );
				},
				ondraw: function()
				{
					var actualDraw = (ctx, source)=>
					{
						ctx.clearRect(this.boundingBox.left, this.boundingBox.top, this.boundingBox.width, this.boundingBox.height); // clear card's caption
						ctx.fillStyle = '#FFFFFF';
						ctx.fillRect(this.boundingBox.left, this.boundingBox.top, this.boundingBox.width, this.boundingBox.height);
						ctx.drawImage(source, this.boundingBox.left-1, this.boundingBox.top, this.boundingBox.width+1, this.boundingBox.height); // TODO fix these offset/width values
					};

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
				},
			}),
			power: new CardAttribute({
				cardObject: this,
				boundingBox: {
					left: 300,
					top: 570
				},
				inputDOM: document.querySelector('.card-power'),
				ondraw: function()
				{
					if(!this.cardObject.isACreature())
						return;

					this.cardObject.ctx.save();
					this.cardObject.ctx.fillStyle = 'black';
					this.cardObject.ctx.textAlign = 'right';
					this.cardObject.ctx.font = `bold 18px ${this.defaultFont}`;
					this.cardObject.ctx.fillText(this.value, this.boundingBox.left, this.boundingBox.top);
					this.cardObject.ctx.restore();
				}
			}),
			toughness: new CardAttribute({
				cardObject: this,
				boundingBox: {
					left: 300 + 85,
					top: 570
				},
				inputDOM: document.querySelector('.card-toughness'),
				ondraw: function()
				{
					if(!this.cardObject.isACreature())
						return;

					this.cardObject.ctx.save();
					this.cardObject.ctx.fillStyle = 'black';
					this.cardObject.ctx.textAlign = 'right';
					this.cardObject.ctx.font = `bold 18px ${this.defaultFont}`;
					this.cardObject.ctx.fillText(this.value, this.boundingBox.left, this.boundingBox.top);
					this.cardObject.ctx.restore();
				}
			}),
			title: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-title'),
				boundingBox: {
					left: 36,
					top: 56,
					width: 328,
					height: 10
				},
				ondraw: function()
				{
					this.cardObject.ctx.save();
					this.cardObject.ctx.fillStyle = 'black';
					this.cardObject.ctx.textBaseline = 'alphabetic';
					this.cardObject.ctx.font = 'bold 28px '+this.cardObject.defaultFont;
					this.cardObject.ctx.fillText(this.value, this.boundingBox.left, this.boundingBox.top);
					this.cardObject.ctx.restore();
				}
			}),
			description: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-description'),
				boundingBox: {
					left: 40,
					top: 500,
					width: 350,
					height: 150
				},
				ondraw: function()
				{
					var x = this.boundingBox.left, y = this.boundingBox.top;
					var descFontSize = 16;

					/* Desc goes higher in some cases */
					if(
						!this.cardObject.isACreature() // spell || trap
						|| !this.cardObject.attributes.type.value // No type specified
					)
						y -= descFontSize * 1.5;

					this.cardObject.ctx.save();
					this.cardObject.ctx.fillStyle = 'black';
					this.cardObject.ctx.font = descFontSize+'px '+this.cardObject.defaultFont;
					this.cardObject.wrapText(
						this.cardObject.ctx, 
						this.value, 
						x, 
						y, 
						this.boundingBox.width, 
						descFontSize
					);
					this.cardObject.ctx.restore();
				}
			}),
			type: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-type'),
				boundingBox: {
					top: 460,
					left: 40
				},
				ondraw: function()
				{
					if(!this.value)
						return;

					var x = this.boundingBox.left, y = this.boundingBox.top;
					this.cardObject.ctx.save();
					if(!this.cardObject.isACreature())
					{
						y = this.cardObject.attributes.level.boundingBox.top;
						x = this.cardObject.cardWidth - 36;
						this.cardObject.ctx.textAlign = 'right';
					}

					this.cardObject.ctx.textBaseline = 'top';
					this.cardObject.ctx.fillStyle = 'black';
					this.cardObject.ctx.font = `bold 20px ${this.cardObject.defaultFont}`;
					this.cardObject.ctx.fillText(`[ ${this.value} ]`, x, y);
					this.cardObject.ctx.restore();
				}
			}),
			template: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-template-selector'),
				ondraw: function(){}
			}),
			attribute: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-attribute-selector'),
				boundingBox: {
					top: 27,
					left: 420 - 40 - 28,
					width: 40,
					height: 40
				},
				ondraw: function()
				{
					if(this.value === 'none' && this.cardObject.isACreature())
						return;

					var valueToUse = this.value;
					if(!this.cardObject.isACreature())
						valueToUse = this.cardObject.attributes.template.value;

					var fileName = valueToUse.charAt(0).toUpperCase() + valueToUse.substr(1) + '.png';
					var attributeIconSrc = `/images/icons_ygo/${fileName}`;
					var attributeIconImg = new Image();
					attributeIconImg.onload = ()=>
					{
						this.cardObject.ctx.drawImage
						(
							attributeIconImg,
							this.boundingBox.left,
							this.boundingBox.top,
							this.boundingBox.width,
							this.boundingBox.height
						);
					};
					attributeIconImg.src = attributeIconSrc;
				},
				onchange: function()
				{
					this.cardObject.update();
				}
			}),
			level: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-level'),
				boundingBox: {
					top: 72,
					left: 420 - 40 - 28,
					width: 28,
					height: 28
				},
				ondraw: function()
				{
					if(!this.cardObject.isACreature())
						return;

					var levelIconSrc = '/images/icons_ygo/Normal.png';
					var levelIconImg = new Image();
					levelIconImg.onload = ()=>
					{
						for(
								var x = this.boundingBox.left; 
								x > this.boundingBox.left - this.boundingBox.width * parseInt(this.value);
								x -= this.boundingBox.width
							)
						{
							this.cardObject.ctx.drawImage
							(
								levelIconImg,
								x,
								this.boundingBox.top,
								this.boundingBox.width,
								this.boundingBox.height
							);
						}
					};
					levelIconImg.src = levelIconSrc;
				}
			}),
			author: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-author'),
				boundingBox: {
					top: 591,
					left: 20
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
					var authorFontSize = 12;
					var authorColor = 'black';
					this.cardObject.ctx.save();
					this.cardObject.ctx.fillStyle = authorColor;
					this.cardObject.ctx.font = `${authorFontSize}px ${this.cardObject.defaultFont}`;
					if(this.value)
						this.cardObject.ctx.fillText("By "+this.value, this.boundingBox.left, this.boundingBox.top);
					this.cardObject.ctx.textAlign = 'right';
					this.cardObject.ctx.fillText("Zougouda's Yu-Gi-Oh™ generator, 2018", this.boundingBox.left + 358, this.boundingBox.top);
					this.cardObject.ctx.restore();
				}
			}),
		};
	}
}

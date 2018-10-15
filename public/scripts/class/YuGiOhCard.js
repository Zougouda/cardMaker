class YuGiOhCard extends GenericCard
{
	beforeInit()
	{
		super.beforeInit();
		this.cardWidth = 420, this.cardheight = 610; // FIXME
	}

	getCardFrameSrc()
	{
		return 'https://yemachu.github.io/cardmaker/res/tcg/ygo/border/Normal.png';
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
			attack: new CardAttribute({
				cardObject: this,
				boundingBox: {
					left: 300,
					top: 570
				},
				inputDOM: document.querySelector('.card-power'),
				ondraw: function()
				{
					this.cardObject.ctx.save();
					this.cardObject.ctx.fillStyle = 'black';
					this.cardObject.ctx.textAlign = 'right';
					this.cardObject.ctx.font = `bold 18px ${this.defaultFont}`;
					this.cardObject.ctx.fillText(this.value, this.boundingBox.left, this.boundingBox.top);
					this.cardObject.ctx.restore();
				}
			}),
			defense: new CardAttribute({
				cardObject: this,
				boundingBox: {
					left: 300 + 85,
					top: 570
				},
				inputDOM: document.querySelector('.card-toughness'),
				ondraw: function()
				{
					this.cardObject.ctx.save();
					this.cardObject.ctx.fillStyle = 'black';
					this.cardObject.ctx.textAlign = 'right';
					this.cardObject.ctx.font = `bold 18px ${this.defaultFont}`;
					this.cardObject.ctx.fillText(this.value, this.boundingBox.left, this.boundingBox.top);
					this.cardObject.ctx.restore();
				}
			}),
		};
	}
}

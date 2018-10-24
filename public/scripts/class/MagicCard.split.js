class MagicCardSplit extends MagicCard
{
	init()
	{
		this.uploadedImage2 = document.querySelector('img.uploaded-image-2');
		this.cropper2 = null;

		super.init();

		if( this.attributes.illustration2)
			this.attributes.illustration2.value = this.uploadedImage2.src;

		/* Build buttonsPickers */
		this.buildIconsPicker({
			inputDestinationDOM: this.attributes.manaCost2.inputDOM,
			containerDOM: document.querySelector('div.mana-cost-buttons-2'),
			includeReset: true
		});
		this.buildIconsPicker({
			iconsOptions: MagicCard.abbreviationDescriptionToSrc,
			inputDestinationDOM: this.attributes.description2.inputDOM,
			containerDOM: document.querySelector('div.description-buttons-2'),
		});
	}

	destroy()
	{
		super.destroy();

		/* remove mana-pickers buttons */
		document.querySelector('div.mana-cost-buttons-2').innerHTML = '';
		document.querySelector('div.description-buttons-2').innerHTML = '';
	}

	setAttributes()
	{
		super.setAttributes();

		var frameWidth = this.cardheight / 2;
		var frameHeight = frameWidth / ( this.cardWidth / this.cardheight );
		var sizeRatio = frameWidth / this.cardWidth;
		var rightFrameOffsetLeft = frameWidth - 20;
		var ctx = this.ctx;

		var translateAndRotate = (ctx = this.ctx)=>
		{
			ctx.translate(0, this.cardheight);
			ctx.rotate( Math.PI / 180 * -90);
		};

		/* ILLUSTRATIONS  */
		this.attributes.illustration.boundingBox = 
		{
			left: 26,
			top: 48,
			width: 328 * sizeRatio,
			height: 242 * sizeRatio
		};
		var illustrationDraw = this.attributes.illustration.ondraw;
		this.attributes.illustration.ondraw = function(ctx)
		{
			illustrationDraw.apply(this, [
				ctx, 
				undefined, 
				undefined, 
				undefined, 
				frameWidth, 
				frameHeight
			]);
		};
		this.attributes.illustration.beforeDraw = function(ctx)
		{
			//ctx.clearRect(0, 0, this.cardObject.cardWidth, this.cardObject.cardheight);
			ctx.save();
			translateAndRotate(ctx);
		};
		this.attributes.illustration.afterDraw = function(ctx)
		{
			ctx.restore();
		};

		this.attributes.illustration2 = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.uploader-2'),
			boundingBox: {
				left: rightFrameOffsetLeft + 26,
				top: 48,
				width: 328 * sizeRatio,
				height: 242 * sizeRatio
			},
			onchange: function(val)
			{
				/* Override original function with parameters for cropper #2 */
				this.cardObject.setCropperSrc( 
					window.URL.createObjectURL(this.inputDOM.files[0]),
					'cropper2',
					this.cardObject.uploadedImage2,
					this.cardObject.attributes.illustration2
				);
			},
			ondraw: function()
			{
				/* Override original function with parameters for cropper #2 */
				illustrationDraw.apply(this, [
					ctx, 
					this.cardObject.cropper2,
					this.cardObject.uploadedImage2,
					this.cardObject.cardFrameImg2,
					frameWidth, 
					frameHeight,
					rightFrameOffsetLeft,
					0,
				]);
			}
		});
		this.attributes.illustration2.beforeDraw = function(ctx)
		{
			ctx.save();
			translateAndRotate(ctx);
		};
		this.attributes.illustration2.afterDraw = function(ctx)
		{
			ctx.restore();
		};

		/* DESCRIPTIONS  */
		var descDraw = this.attributes.description.ondraw;
		this.attributes.description.boundingBox = {
			left: 30,
			top: 260,
			width: 220,
		};
		this.attributes.description.ondraw = function(ctx)
		{
			ctx.save();
			translateAndRotate(ctx);
			descDraw.apply(this, [ctx]);
			ctx.restore();
		};

		this.attributes.description2 = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-description-2'),
			boundingBox: {
				left: rightFrameOffsetLeft + 30,
				top: 260,
				width: 220,
			},
			ondraw: function(ctx)
			{
				this.cardObject.attributes.description.ondraw.apply(this, [ctx]);
			}
		});

		/* MANA  */
		var manaDraw = this.attributes.manaCost.ondraw;
		this.attributes.manaCost.boundingBox = {
			top: 25,
			left: frameWidth - 25,
		};
		this.attributes.manaCost.ondraw = function(ctx)
		{
			ctx.save();
			translateAndRotate(ctx);
			manaDraw.apply(this, [ctx]);
			ctx.restore();
		};
		this.attributes.manaCost2 = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-mana-cost-2'),
			boundingBox: {
				top: 25,
				left: frameWidth + rightFrameOffsetLeft - 25,
			},
			ondraw: function()
			{
				this.cardObject.attributes.manaCost.ondraw.apply(this, [ctx])
			}
		});

		/* TITLES */
		var titleDraw = this.attributes.title.ondraw;
		this.attributes.title.ondraw = function(ctx)
		{
			ctx.save();
			translateAndRotate(ctx);
			titleDraw.apply(this, [ctx]);
			ctx.restore();
		};
		this.attributes.title.boundingBox = {
			left: 26,
			top: 38,
			width: 328,
			height: 10
		};
		this.attributes.title2 = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-title-2'),
			boundingBox: {
				left: 26 + rightFrameOffsetLeft,
				top: 38,
				width: 328,
				height: 10
			},
			ondraw: function()
			{
				this.cardObject.attributes.title.ondraw.apply(this, [ctx])
			}
		});

		/* TYPES */
		var typeDraw = this.attributes.type.ondraw;
		this.attributes.type.ondraw = function(ctx)
		{
			ctx.save();
			translateAndRotate(ctx);
			typeDraw.apply(this, [ctx]);
			ctx.restore();
		};
		this.attributes.type.boundingBox = {
			left: 26,
			top: 235,
		};
		this.attributes.type2 = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-type-2'),
			boundingBox: {
				left: 26 + rightFrameOffsetLeft,
				top: 235,
			},
			ondraw: function()
			{
				this.cardObject.attributes.type.ondraw.apply(this, [ctx])
			}
		});

		/* Rarity */
		var rarityDraw = this.attributes.rarity.ondraw;
		this.attributes.rarity.boundingBox = {
			top: 222,
			left: frameWidth - 44,
			width: 16,
			height: 16
		};
		this.attributes.rarity.ondraw = function(ctx)
		{
			ctx.save();
			translateAndRotate(ctx);
			rarityDraw.apply(this, [ctx]);
			ctx.restore();
		};
		this.attributes.rarity.beforeDraw = function(ctx)
		{
			ctx.save();
			translateAndRotate(ctx);
		};
		this.attributes.rarity.afterDraw = function(ctx)
		{
			ctx.restore();
		};

		this.attributes.rarity2 = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-rarity-selector'),
			boundingBox: {
				top: 222,
				left: frameWidth + rightFrameOffsetLeft - 44,
				width: 16,
				height: 16
			},
			ondraw: function(ctx)
			{
				this.cardObject.attributes.rarity.ondraw.apply(this, [ctx]);
			}
		});
		this.attributes.rarity2.beforeDraw = function(ctx)
		{
			ctx.save();
			translateAndRotate(ctx);
		};
		this.attributes.rarity2.afterDraw = function(ctx)
		{
			ctx.restore();
		};

		/* Author */
		var authorDraw = this.attributes.author.ondraw;
		this.attributes.author.boundingBox = {
			top: frameHeight - 22,
			left: 25
		};
		this.attributes.author.ondraw = function(ctx)
		{
			ctx.save();
			translateAndRotate(ctx);


			if(this.beforeDraw)
				this.beforeDraw(ctx);

			var authorFontSize = 11;
			var authorColor = this.cardObject.getAuthorColor(this.cardObject.cardFrameImg.src);
			ctx.fillStyle = authorColor;
			ctx.font = authorFontSize+'px '+this.cardObject.defaultFont;
			ctx.fillText("Zougouda's Magic The Gathering™ generator, 2018", this.boundingBox.left, this.boundingBox.top);
			if(this.value)
			{
				authorColor = this.cardObject.getAuthorColor(this.cardObject.cardFrameImg2.src);
				ctx.fillStyle = authorColor;
				ctx.fillText("By "+this.value, this.boundingBox.left + rightFrameOffsetLeft, this.boundingBox.top);
			}

			if(this.afterDraw)
				this.afterDraw(ctx);


			ctx.restore();
		};
	}
}

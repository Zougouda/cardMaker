class MagicCardTransform extends MagicCard
{
	init()
	{
		this.canvasDOM2 = document.querySelector('.preview-canvas-2');
		this.ctx2 = this.canvasDOM2.getContext('2d');
		this.uploadedImage2 = document.querySelector('img.uploaded-image-2'); // TODO

		super.init();

		this.attributes['illustration2'].value = this.uploadedImage2.src;

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

		this.attributes['illustration2'] = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.uploader-2'),
			boundingBox: this.attributes.illustration.boundingBox,
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
				this.cardObject.attributes.illustration.ondraw.apply(this, [
					this.cardObject.ctx2, 
					this.cardObject.cropper2,
					this.cardObject.uploadedImage2,
					this.cardObject.cardFrameImg2
				])
			}
		});

		this.attributes['title2'] = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-title-2'),
			boundingBox: this.attributes.title.boundingBox,
			ondraw: function()
			{
				this.cardObject.attributes.title.ondraw.apply(this, [this.cardObject.ctx2])
			}
		});

		this.attributes['manaCost2'] = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-mana-cost-2'),
			boundingBox: this.attributes.manaCost.boundingBox,
			ondraw: function()
			{
				this.cardObject.attributes.manaCost.ondraw.apply(this, [this.cardObject.ctx2])
			}
		});

		this.attributes['type2'] = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-type-2'),
			boundingBox: this.attributes.type.boundingBox,
			ondraw: function()
			{
				this.cardObject.attributes.type.ondraw.apply(this, [this.cardObject.ctx2])
			}
		});

		/* redefine rarity to draw on both */
		var onDrawRarity = this.attributes.rarity.ondraw;
		this.attributes['rarity'] = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-rarity-selector'),
			boundingBox: this.attributes.rarity.boundingBox,
			ondraw: function()
			{
				onDrawRarity.apply(this, [this.cardObject.ctx]);
				onDrawRarity.apply(this, [this.cardObject.ctx2]);
			}
		});

		var onDrawPower = this.attributes.power.ondraw;
		this.attributes['power2'] = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-power-2'),
			boundingBox: this.attributes.power.boundingBox,
			ondraw: function()
			{
				onDrawPower.apply(
					this, 
					[
						this.cardObject.ctx2, 
						this.cardObject.attributes.power2, 
						this.cardObject.attributes.toughness2
					]
				);
			}
		});

		this.attributes['toughness2'] = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-toughness-2'),
		});

		this.attributes['description2'] = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-description-2'),
			boundingBox: this.attributes.description.boundingBox,
			ondraw: function()
			{
				this.cardObject.attributes.description.ondraw.apply(this, [this.cardObject.ctx2])
			}
		});

		/* redefine author to draw on both */
		var onDrawAuthor = this.attributes.author.ondraw;
		this.attributes.author.ondraw = function()
		{
			onDrawAuthor.apply(this, [this.cardObject.ctx])
			onDrawAuthor.apply(this, [this.cardObject.ctx2, this.cardObject.cardFrameImg2.src])
		};
	}
}

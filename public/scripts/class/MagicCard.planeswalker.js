class MagicCardPlaneswalker extends MagicCard
{
	init()
	{
		super.init();
	}

	destroy()
	{
		super.destroy();
	}

	getCardFrameSrc()
	{
		
	}

	setAttributes()
	{
		super.setAttributes();

		unset(this.attributes.power);
		unset(this.attributes.toughness);
		unset(this.attributes.description);

		this.attributes.loyalty = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-loyalty'),
			boundingBox: {
				// TODO
			},
			ondraw: function()
			{
				// TODO
			}
		});

		this.attributes.ability1Cost = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-ability-cost-1'),
			boundingBox: {
				// TODO
			},
			ondraw: function()
			{
				// TODO
			}
		});
		this.attributes.ability1Description = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-ability-desc-1'),
			boundingBox: {
				// TODO
			},
			ondraw: function()
			{
				// TODO
			}
		});

		this.attributes.ability2Cost = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-ability-cost-2'),
			boundingBox: {
				// TODO
			},
			ondraw: function()
			{
				// TODO
			}
		});
		this.attributes.ability2Description = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-ability-desc-2'),
			boundingBox: {
				// TODO
			},
			ondraw: function()
			{
				// TODO
			}
		});

		this.attributes.ability3Cost = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-ability-cost-3'),
			boundingBox: {
				// TODO
			},
			ondraw: function()
			{
				// TODO
			}
		});
		this.attributes.ability3Description = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-ability-desc-3'),
			boundingBox: {
				// TODO
			},
			ondraw: function()
			{
				// TODO
			}
		});

		this.attributes.ability4Cost = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-ability-cost-4'),
			boundingBox: {
				// TODO
			},
			ondraw: function()
			{
				// TODO
			}
		});
		this.attributes.ability4Description = new CardAttribute({
			cardObject: this,
			inputDOM: document.querySelector('.card-ability-desc-4'),
			boundingBox: {
				// TODO
			},
			ondraw: function()
			{
				// TODO
			}
		});
	}
}

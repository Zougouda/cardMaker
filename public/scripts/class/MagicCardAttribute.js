class MagicCardAttribute
{
	constructor(options = {})
	{
		this.options = options;
		this.init();
	}

	init()
	{
		({
			cardObject: this.cardObject = null,
			value: this.value = '',
			inputDOM: this.inputDOM = null,
			boundingBox: this.boundingBox = {left: 0, top: 0},
			onready:  this.onready = function(){},
			onchange: this.onchange = this.defaultOnchange,
			ondraw: this.ondraw = function(){},
		} = this.options);

		if(!this.value)
			this.value = this.inputDOM.value;

		this.onready();
		if(this.inputDOM)
		{
			['change', 'keyup'].forEach((action) =>
			{
				this.inputDOM.addEventListener(action, (e)=>
				{
					this.value = e.target.value;
					this.onchange();		
				});
			});
		}
	}

	defaultOnchange(value)
	{
		this.cardObject.update();
	}

	draw()
	{
		this.ondraw();
	}
}

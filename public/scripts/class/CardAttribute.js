class CardAttribute
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
			debug: this.debug = false,
		} = this.options);

		if(!this.value)
			this.value = this.inputDOM.value;

		this.onready();
		if(this.inputDOM)
		{
			this.eventListenerCallback = (e)=>
			{
				this.value = e.target.value;
				this.onchange();		
			};
			['change', 'keyup'].forEach((action) =>
			{
				this.inputDOM.addEventListener(action, this.eventListenerCallback);
			});
		}
	}

	destroy()
	{
		if(!this.inputDOM)
			return;

		['change', 'keyup'].forEach((action) =>
		{
			this.inputDOM.removeEventListener(action, this.eventListenerCallback);
		});
	}

	defaultOnchange(value)
	{
		this.cardObject.update();
	}

	draw()
	{
		var ctx = this.cardObject.ctx;
		this.ondraw(ctx);
		if(this.debug)
		{
			ctx.save();
			ctx.strokeStyle = 'red'; ctx.lineWidth = 3;
			ctx.strokeRect(
				this.boundingBox.left,
				this.boundingBox.top,
				this.boundingBox.width || 10,
				this.boundingBox.height || 10,
			);
			ctx.restore();
		}
	}
}

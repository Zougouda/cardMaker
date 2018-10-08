class MagicCard extends GenericCard
{
	init()
	{
		super.init();

		/* Build buttonsPickers */
		this.buildIconsPicker({
			inputDestinationDOM: this.attributes.manaCost.inputDOM,
			containerDOM: document.querySelector('div.mana-cost-buttons'),
			includeReset: true
		});
		this.buildIconsPicker({
			iconsOptions: MagicCard.abbreviationDescriptionToSrc,
			inputDestinationDOM: this.attributes.description.inputDOM,
			containerDOM: document.querySelector('div.description-buttons'),
		});
	}

	destroy()
	{
		super.destroy();

		/* remove mana-pickers buttons */
		document.querySelector('div.mana-cost-buttons').innerHTML = '';
		document.querySelector('div.description-buttons').innerHTML = '';
	}

	setAttributes()
	{
		var self = this;
		this.attributes = {
			illustration: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.uploader'),
				boundingBox: {
					left: 36,
					top: 68,
					width: 328,
					height: 242
				},
				onchange: function(val)
				{
					this.cardObject.setCropperSrc( window.URL.createObjectURL(this.inputDOM.files[0]) );
				},
				ondraw: function()
				{
					this.cardObject.ctx.drawImage(this.cardObject.cardFrameImg, 0, 0, this.cardObject.cardWidth, this.cardObject.cardheight); // draw frame
					var actualDraw = (ctx, source)=>
					{
						ctx.clearRect(this.boundingBox.left, this.boundingBox.top, this.boundingBox.width, this.boundingBox.height); // clear card's caption
						ctx.fillStyle = '#FFFFFF';
						ctx.fillRect(this.boundingBox.left, this.boundingBox.top, this.boundingBox.width, this.boundingBox.height);
						ctx.drawImage(source, this.boundingBox.left-1, this.boundingBox.top, this.boundingBox.width+1, this.boundingBox.height); // TODO fix these offset/width values
					};

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
					left: 36,
					top: 52,
					width: 328,
					height: 10
				},
				ondraw: function()
				{
					this.cardObject.ctx.fillStyle = 'black';
					this.cardObject.ctx.font = 'bold 18px '+this.cardObject.defaultFont;
					this.cardObject.ctx.fillText(this.value, this.boundingBox.left, this.boundingBox.top);
				}
			}),
			description: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-description'),
				boundingBox: {
					left: 40,
					top: 370,
					width: 328,
					height: 150
				},
				ondraw: function()
				{
					var descFontSize = 16;
					this.cardObject.ctx.fillStyle = 'black';
					this.cardObject.ctx.font = descFontSize+'px '+this.cardObject.defaultFont;
					this.cardObject.wrapText(
						this.cardObject.ctx, 
						this.value, 
						this.boundingBox.left, 
						this.boundingBox.top, 
						this.boundingBox.width, 
						descFontSize
					);
				}
			}),
			manaCost: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-mana-cost'),
				boundingBox: {
					top: 40,
					right: -40
				},
				ondraw: function()
				{
					var startX = this.cardObject.canvasDOM.width + this.boundingBox.right;
					var startY = this.boundingBox.top;
					var manaCostImages = this.cardObject.getImagesByAbbreviationsText(this.value);
					var manaIconsSize = 16;
					startX -= manaCostImages.length * manaIconsSize;
					manaCostImages.forEach((imageSrc)=>
					{
						var localStartX = startX; // to avoid async errors with image loading
						var image = new Image();
						image.src = imageSrc;
						image.onload = ()=>
						{
							this.cardObject.ctx.drawImage(image, localStartX, startY, manaIconsSize, manaIconsSize);
						}
						startX += manaIconsSize;
					});
				}
			}),
			type: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-type'),
				boundingBox: {
					top: 336,
					left: 40
				},
				ondraw: function()
				{
					this.cardObject.ctx.fillStyle = 'black';
					this.cardObject.ctx.font = 'bold 16px '+this.cardObject.defaultFont;
					this.cardObject.ctx.fillText(this.value, this.boundingBox.left, this.boundingBox.top);
				}
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
						this.cardObject.ctx.drawImage(
							this.rarityIcon, 
							this.boundingBox.left, 
							this.boundingBox.top,
							this.boundingBox.width, 
							this.boundingBox.height
						);
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
					var authorFontSize = 11;
					var authorColor = 'black';
					if(this.cardObject.cardFrameImg.src.match(/(land|colorless|black|green|red)/)) 
						authorColor = 'white';
					this.cardObject.ctx.fillStyle = authorColor;
					this.cardObject.ctx.font = authorFontSize+'px '+this.cardObject.defaultFont;
					this.cardObject.ctx.fillText("Zougouda's Magic The Gathering™ generator, 2018", this.boundingBox.left, this.boundingBox.top);
					if(this.value)
						this.cardObject.ctx.fillText("By "+this.value, this.boundingBox.left, this.boundingBox.top+authorFontSize);
				}
			}),
			power: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-power'),
				boundingBox: {
					top: 520,
					left: 334
				},
				ondraw: function()
				{
					/* little hack: we draw both power and toughness here */
					var power = this.value;
					var toughness = this.cardObject.attributes.toughness.value;

					if(power || toughness)
					{
						this.cardObject.ctx.save();
						this.cardObject.ctx.fillStyle = 'black';
						this.cardObject.ctx.font = 'bold 20px '+this.cardObject.defaultFont;
						this.cardObject.ctx.textAlign = 'center';
						this.cardObject.ctx.fillText(power + ' / ' + toughness, this.boundingBox.left, this.boundingBox.top);
						this.cardObject.ctx.restore();
					}
				}
			}),
			toughness: new CardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-toughness'),
			}),
		};
	}

	getCardFrameSrc()
	{
		/* is a land */
		if(!this.attributes.manaCost.value && !this.isACreature() )
			return MagicCard.cardFramesSrcByColor.land + '.png';

		var 
			white = (this.attributes.manaCost.value.match(/\(w\)/g) || []).length,
			blue  = (this.attributes.manaCost.value.match(/\(u\)/g) || []).length,
			black = (this.attributes.manaCost.value.match(/\(b\)/g) || []).length,
			red   = (this.attributes.manaCost.value.match(/\(r\)/g) || []).length,
			green = (this.attributes.manaCost.value.match(/\(g\)/g) || []).length;

		/* fatass if to determine the card's frame */
		var returnValue;
		if( !white && !blue && !black && !red && !green )
			returnValue = MagicCard.cardFramesSrcByColor.colorless;
		else if( white > 0 && !blue && !black && !red & !green )
			returnValue = MagicCard.cardFramesSrcByColor.white; 
		else if( blue > 0 && !white && !black && !red && !green )
			returnValue = MagicCard.cardFramesSrcByColor.blue;
		else if( black > 0 && !blue && !white && !red && !green )
			returnValue = MagicCard.cardFramesSrcByColor.black;
		else if( red > 0 && !blue && !black && !white && !green )
			returnValue = MagicCard.cardFramesSrcByColor.red;
		else if( green > 0 && !blue && !black && !red & !white )
			returnValue = MagicCard.cardFramesSrcByColor.green;
		else
			returnValue = MagicCard.cardFramesSrcByColor.gold;

		if(this.attributes.power.value || this.attributes.toughness.value)
			returnValue += '-creature';
		returnValue += '.png';

		return returnValue;
	}

	insertIconIntoTextInput(iconAsText, inputDOM)
	{
		var txtIndex = inputDOM.selectionStart;
		inputDOM.value = inputDOM.value.slice(0, txtIndex) + iconAsText + inputDOM.value.slice(txtIndex); // Add value at the selected index in the input
	
		/* manually trigger onchange event */
		var event = new Event('change');
		inputDOM.dispatchEvent(event);
	
		inputDOM.focus();
	}

	buildIconsPicker(options = {})
	{
		var {iconsOptions = MagicCard.abbreviationToSrc, 
			inputDestinationDOM, 
			containerDOM = null, 
			includeReset = false
		} = options;
	
		if(!containerDOM)
			containerDOM = inputDestinationDOM.parentNode;
		
		Object.entries(iconsOptions).forEach(([key, value])=>
		{
			var button = document.createElement('a');
			button.classList.add('icons-picker-button');
			var img = document.createElement('img');
			img.src = value;
			img.width = 16;
			button.appendChild(img);
			button.onclick = ()=>
			{
				this.insertIconIntoTextInput(key, inputDestinationDOM);
			};
			button.href = 'javascript:void(0);';
			button.setAttribute('tabIndex', -1);
			containerDOM.appendChild(button);
		});
	
		if(includeReset)
		{
			var resetButton = document.createElement('a');
			resetButton.classList.add('icons-picker-button');
			resetButton.href = 'javascript:void(0);';
			resetButton.setAttribute('tabIndex', -1);
			resetButton.innerHTML = 'Reset';
			resetButton.onclick = function()
			{
				inputDestinationDOM.value = '';
				var event = new Event('change');
				inputDestinationDOM.dispatchEvent(event);
			};
			containerDOM.appendChild(resetButton);
		}
	}
}

/* Static attributes */

MagicCard.cardFramesSrcByColor = {
	'land'	   : '/images/frames/small/land',
	'colorless': '/images/frames/small/colorless',
	'white'    : '/images/frames/small/white',
	'blue'     : '/images/frames/small/blue',
	'black'    : '/images/frames/small/black',
	'red'      : '/images/frames/small/red',
	'green'    : '/images/frames/small/green',
	'gold'     : '/images/frames/small/gold',
};


MagicCard.getAbbreviationsRegexp = /\(([^)]?)\)/gi; // Matches every single char within parenthesis eg."(b)"

MagicCard.abbreviationToSrc = {
	'(0)' : '/images/icons/mana/0.png',
	'(X)' : '/images/icons/mana/X.png',
	'(1)' : '/images/icons/mana/1.png',
	'(2)' : '/images/icons/mana/2.png',
	'(3)' : '/images/icons/mana/3.png',
	'(4)' : '/images/icons/mana/4.png',
	'(5)' : '/images/icons/mana/5.png',
	'(6)' : '/images/icons/mana/6.png',
	'(7)' : '/images/icons/mana/7.png',
	'(8)' : '/images/icons/mana/8.png',
	'(9)' : '/images/icons/mana/9.png',

	'(w)' : '/images/icons/mana/white.png',
	'(u)' : '/images/icons/mana/blue.png',
	'(b)' : '/images/icons/mana/black.png',
	'(r)' : '/images/icons/mana/red.png',
	'(g)' : '/images/icons/mana/green.png',
};

MagicCard.abbreviationDescriptionToSrc = {
	'(t)' : '/images/icons/tap.png',
	'(n)' : '/images/icons/untap.png',
};
Object.entries(MagicCard.abbreviationToSrc).forEach(function([key, val])
{
	MagicCard.abbreviationDescriptionToSrc[key] = val;
});

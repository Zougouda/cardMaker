class MagicCard
{
	constructor(options = {})
	{
		this.options = options;
		this.init();
	}

	init()
	{
		({
			canvasDOM: this.canvasDOM = null,
		} = this.options);

		if(!this.canvasDOM)
			throw('Error: canvasDOM attribute is mandatory for the preview to work');

		this.ctx = this.canvasDOM.getContext('2d');
		this.cardWidth = 400, this.cardheight = 560;

		this.uploadedImage = document.querySelector('img.uploaded-image');

		this.defaultFont = 'Trajan';

		/* Attributes  */
		var self = this;
		this.attributes = {
			illustration: new MagicCardAttribute({
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
				onready: ()=>
				{
					/* Add illustration by url from input text  */
					['change', 'keyup'].forEach((action)=>
					{
						document.querySelector('input.uploader-by-url').addEventListener(action, (e)=>
						{
							this.setCropperSrc( e.target.value, true );
						});
					});
				},
				ondraw: function()
				{
					if(this.cardObject.cropper)
					{
						this.cardObject.ctx.clearRect(this.boundingBox.left, this.boundingBox.top, this.boundingBox.width, this.boundingBox.height); // clear card's caption
						this.cardObject.ctx.drawImage(this.cardObject.cropper.getCroppedCanvas(), this.boundingBox.left, this.boundingBox.top, this.boundingBox.width, this.boundingBox.height);
					}
					else if(this.value)
					{
						this.cardObject.uploadedImage.src = this.value;
						this.cardObject.uploadedImage.onload = ()=>
						{
							this.cardObject.ctx.clearRect(this.boundingBox.left, this.boundingBox.top, this.boundingBox.width, this.boundingBox.height); // clear card's caption
							this.cardObject.ctx.drawImage(this.cardObject.uploadedImage, this.boundingBox.left, this.boundingBox.top, this.boundingBox.width, this.boundingBox.height);
						};
					}
				}
			}),
			title: new MagicCardAttribute({
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
			description: new MagicCardAttribute({
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
			manaCost: new MagicCardAttribute({
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
			type: new MagicCardAttribute({
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
			rarity: new MagicCardAttribute({
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
			author: new MagicCardAttribute({
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
					if(this.cardObject.cardFrameImg.src.match(/(colorless|black|green|red)/)) 
						authorColor = 'white';
					this.cardObject.ctx.fillStyle = authorColor;
					this.cardObject.ctx.font = authorFontSize+'px '+this.cardObject.defaultFont;
					this.cardObject.ctx.fillText("Zougouda's Magic The Gathering™ generator, 2018", this.boundingBox.left, this.boundingBox.top);
					if(this.value)
						this.cardObject.ctx.fillText("By "+this.value, this.boundingBox.left, this.boundingBox.top+authorFontSize);
				}
			}),
			power: new MagicCardAttribute({
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
			toughness: new MagicCardAttribute({
				cardObject: this,
				inputDOM: document.querySelector('.card-toughness'),
			}),
		};

		/* Add ctrl-S shortcut */
		document.addEventListener('keydown',(e)=>
		{
			if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83)  // Ctrl + S or cmd + S
			{
				e.preventDefault();
				this.exportImg();
			}
		}, false);

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

		this.update();
	}

	update()
	{
		this.cardFrameImg = new Image();
		this.cardFrameImg.src = this.getCardFrameSrc();
		this.cardFrameImg.onload = ()=>
		{
			this.ctx.drawImage(this.cardFrameImg, 0, 0, this.cardWidth, this.cardheight); // draw frame

			Object.entries(this.attributes).forEach( ([key, obj])=>
			{
				obj.draw();
			});
		};
	}

	setCropperSrc(src)
	{
		if(!src) 
			return;

		//try
		//{
			if(src.indexOf('blob') == -1 && src.indexOf('data:') == -1) // image URL from another domain
				this.uploadedImage.src = 'https://cors-anywhere.herokuapp.com/'+src; // Thanks for this guys :)
			else // image uploaded with input type=file
				this.uploadedImage.src = src;

			this.uploadedImage.onload = ()=>
			{
				if(this.cropper) this.cropper.destroy(); // remove potential existing cropper
				
				this.cropper = new Cropper( this.uploadedImage, {
					dragMode: 'move',
					aspectRatio: this.attributes.illustration.boundingBox.width / this.attributes.illustration.boundingBox.height,
					cropend:  ()=>{this.update()},
					cropmove: ()=>{this.update()},
					zoom:     ()=>{this.update()},
					ready:    ()=>{this.update()},
				});
			}
		//}
		//catch(e)
		//{
		//	alert('Failed to retrieve the selected image! ', e);
		//}
	}

	getCardFrameSrc()
	{
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

	getWholeCardImgSrc()
	{
		this.update();
		return this.canvasDOM.toDataURL('image/png').replace("image/png", "image/octet-stream");
	}

	exportImg()
	{
		//this.update();
		//var dataUrl = this.canvasDOM.toDataURL('image/png').replace("image/png", "image/octet-stream");
		var dataUrl = this.getWholeCardImgSrc();

		var downloadButton = document.createElement('a');

		var title = this.attributes.title.value;
		downloadButton.setAttribute('download', (title) ? title+'.png' : 'newCard.png');
		downloadButton.href = dataUrl;
		downloadButton.click();
	}

	exportJson()
	{
		var json = {};

		Object.entries(this.attributes).forEach(([key, obj])=>
		{
			if(key === 'illustration')
			{
				if(this.cropper)
					json[key] = this.cropper.getCroppedCanvas().toDataURL('image/png');
				else if(obj.value.startsWith('/images') )
					return;
				else
					json[key] = obj.value;
			}
			else
				json[key] = obj.value;

			//if(key === 'illustration' && this.cropper) // special case for illu: export img as base64
			//	json[key] = this.cropper.getCroppedCanvas().toDataURL('image/png');
			//else
			//	json[key] = obj.value;
		});

		return json;
	}

	importJson(json)
	{
		Object.entries(json).forEach(([key, val])=>
		{
			if(!this.attributes[key])
				return;

			this.attributes[key].value = val;
			if(key == 'illustration')
			{
				if(this.cropper)
				{
					this.cropper.destroy();
					this.cropper = null;
				}
			}
			else
			{
				this.attributes[key].inputDOM.value = val;
			}

			//if(key === 'illustration' && this.cropper) // special case for illu: export img as base64
			//{
			//	this.cropper.destroy();
			//	this.cropper = null;
			//}
			//this.attributes[key].value = val;
			//if(key != 'illustration')
			//	this.attributes[key].inputDOM.value = val;
		});
		this.update();
	}

	fetchData(id, callback = null)
	{
		return fetch(`/get-card-data?id=${id}`)
		.then((resp)=>
		{
			resp.json()
			.then((json)=>
			{
				if(callback)
					callback(json);
			});
		});
	}

	saveToDatabase()
	{
		var json = this.exportJson(); // get card-relative infos
		json['wholeCardImgSrc'] = this.getWholeCardImgSrc(); // save generated img to DB
		json['userID'] = window.userID;
		if(this.cardID)
			json['id'] = this.cardID; // update card
		console.log(json);

		/* Ajax query to save card */
		var newXHR = new XMLHttpRequest();
		newXHR.onreadystatechange = function() 
		{
			if (newXHR.readyState === 4 && newXHR.status === 200) 
			{
				window.location.href = `/list-cards?userID=${userID}`;
			}
		};
		newXHR.open( 'POST', '/save-card', true );
		newXHR.setRequestHeader("Content-Type", "application/json");
		var formattedJsonData = JSON.stringify( json );
		newXHR.send( formattedJsonData );
	}

	deleteFromDatabase()
	{
		if(this.cardID)
			window.location.href = `/list-cards?id=${userID}`;

		var confirmed = window.confirm('U sure ?');
		if(!confirmed)
			return;

		/* Ajax query to delete card */
		var json = {id: this.cardID};
		var newXHR = new XMLHttpRequest();
		newXHR.onreadystatechange = function() 
		{
			if (newXHR.readyState === 4 && newXHR.status === 200) 
			{
				window.location.href = `/list-cards?id=${userID}`;
			}
		};
		newXHR.open( 'POST', '/delete-card', true );
		newXHR.setRequestHeader("Content-Type", "application/json");
		var formattedJsonData = JSON.stringify( json );
		newXHR.send( formattedJsonData );
	}

	getImagesByAbbreviationsText(text)
	{
		var regex = MagicCard.getAbbreviationsRegexp; 
		var allPatterns = text.match(regex); // get all patterns within parenthesis ( like '(b)' )
	
		var returnValue = [];
		if(allPatterns)
		{
			allPatterns.forEach(function(elem)
			{
				returnValue.push(MagicCard.abbreviationToSrc[elem]);
			});
		}
		return returnValue;
	}

	/* https://stackoverflow.com/a/2936288 */
//	 wrapText(context, text, x, y, line_width, line_height)
//	{
//		var line = '';
//		var paragraphs = text.split('\n');
//		for (var i = 0; i < paragraphs.length; i++)
//		{
//			var words = paragraphs[i].split(' ');
//			for (var n = 0; n < words.length; n++)
//			{
//				var testLine = line + words[n] + ' ';
//	
//				/* replace detected abbreviations by their matching images */
//				var regex = MagicCard.getAbbreviationsRegexp; 
//				var reResult;
//				while(reResult = regex.exec(testLine))
//				{
//					var pattern = reResult[0];
//					var imageSrc = MagicCard.abbreviationDescriptionToSrc[pattern];
//					if(imageSrc)
//					{
//						var textUpToAbbreviation = reResult.input.substring(0, reResult.input.indexOf(pattern) ); // remove everything just before the found string
//						testLine = testLine.replace(pattern, ' '.repeat(pattern.length)); // remove pattern from the line and replace it with spaces
//	
//						var imgWidth, imgHeight; imgWidth = imgHeight = 12;
//						var marginX = context.measureText(textUpToAbbreviation).width;
//						var imgX = x + marginX;
//						var imgY = y - imgHeight;
//	
//						/* build image */
//						var img = new Image();
//						img.src = imageSrc;
//						context.drawImage(img, imgX, imgY, imgWidth, imgHeight);
//					}
//				}
//	
//				/* TODO : handle <i> and </i> */
//				var italicRegex = /\<i\>/gi; // "<i>"
//				var italicEndRegex = /\<\/i\>/gi; // "</i>
//				while(reResult = italicRegex.exec(testLine))
//				{
//					var pattern = reResult[0];
//					console.log(reResult);
//					//var textUpToAbbreviation = reResult.input.substring(0, reResult.input.indexOf(pattern) ); // remove everything just before the found string
//					//testLine = testLine.replace(pattern, ' '.repeat(pattern.length)); // remove pattern from the line and replace it with spaces
//				}
//	
//				var metrics = context.measureText(testLine);
//				var testWidth = metrics.width;
//				if (testWidth > line_width && n > 0)
//				{
//					context.fillText(line, x, y);
//					line = words[n] + ' ';
//					y += line_height;
//				}
//				else
//				{
//					line = testLine;
//				}
//			}
//			context.fillText(line, x, y);
//			y += line_height;
//	line = '';
//}
//	}

	/* https://stackoverflow.com/a/2936288 */
	wrapText(context, text, x, y, line_width, line_height)
	{
		var defaultCtxFont = context.font;

		var line = ''; var startX = x;
		var paragraphs = text.split('\n');
		for (var i = 0; i < paragraphs.length; i++)
		{
			let italicStartIndexes = [];
			let italicEndIndexes = [];

			var words = paragraphs[i].split(' ');
			for (var n = 0; n < words.length; n++)
			{
				var testLine = line + words[n] + ' ';
	
				/* replace detected abbreviations by their matching images */
				var regex = MagicCard.getAbbreviationsRegexp; 
				var reResult;
				while(reResult = regex.exec(testLine))
				{
					var pattern = reResult[0];
					var imageSrc = MagicCard.abbreviationDescriptionToSrc[pattern];
					if(imageSrc)
					{
						var textUpToAbbreviation = reResult.input.substring(0, reResult.input.indexOf(pattern) ); // remove everything just before the found string
						testLine = testLine.replace(pattern, ' '.repeat(pattern.length)); // remove pattern from the line and replace it with spaces
	
						var imgWidth, imgHeight; imgWidth = imgHeight = 12;
						var marginX = context.measureText(textUpToAbbreviation).width;
						var imgX = x + marginX;
						var imgY = y - imgHeight;
	
						/* build image */
						var img = new Image();
						img.src = imageSrc;
						context.drawImage(img, imgX, imgY, imgWidth, imgHeight);
					}
				}

				var metrics = context.measureText(testLine);
				var testWidth = metrics.width;
				if (testWidth > line_width && n > 0)
				{
					//context.fillText(line, x, y);
					writeLineWords(line);

					line = words[n] + ' ';
					y += line_height;
					x = startX;
				}
				else
				{
					line = testLine;
				}
			}
			//context.fillText(line, x, y);
			writeLineWords(line);

			y += line_height;
			x = startX;
			line = '';
		}

		function writeLineWords(line)
		{
			line.split(' ').forEach((lineWord)=>
			{
				var italicRegex = /\<i\>/gi; // "<i>"
				var boldRegex = /\<b\>/gi; // "<b>"
				var italicEndRegex = /\<\/i\>/gi; // "</i>
				var boldEndRegex = /\<\/b\>/gi; // "</b>
				var stopItalic = false, stopBold = false;

				var reResult;
				reResult = italicRegex.exec(lineWord);
				if(reResult /*&& reResult.index == 0*/)
				{
					context.font = 'italic ' + context.font;
					lineWord = lineWord.replace(italicRegex, '');
				}
				reResult = boldRegex.exec(lineWord);
				if(reResult /*&& reResult.index == 0*/)
				{
					context.font = 'bold ' + context.font;
					lineWord = lineWord.replace(boldRegex, '');
				}

				reResult = italicEndRegex.exec(lineWord);
				if(reResult)
				{
					lineWord = lineWord.replace(italicEndRegex, '');
					//if(reResult.index == lineWord.length)
						stopItalic = true;
				}
				reResult = boldEndRegex.exec(lineWord);
				if(reResult)
				{
					lineWord = lineWord.replace(boldEndRegex, '');
					//if(reResult.index == lineWord.length)
						stopBold = true;
				}

				context.fillText(lineWord+' ', x, y); // Actual writing done here

				if(stopItalic)
					context.font = context.font.replace('italic', '');
				if(stopBold)
					context.font = context.font.replace('bold', '');

				x+= context.measureText(lineWord+' ').width;
			});
		}
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
			containerDOM.appendChild(button);
		});
	
		if(includeReset)
		{
			var resetButton = document.createElement('a');
			resetButton.classList.add('icons-picker-button');
			resetButton.href = 'javascript:void(0);';
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
	'colorless': '/images/frames/colorless',
	'white'    : '/images/frames/white',
	'blue'     : '/images/frames/blue',
	'black'    : '/images/frames/black',
	'red'      : '/images/frames/red',
	'green'    : '/images/frames/green',
	'gold'     : '/images/frames/gold',
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

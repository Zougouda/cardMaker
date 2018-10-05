class GenericCard
{
	static initCard(pattern)
	{
		if (window.currentCard)
			window.currentCard.destroy();
	
		var classToUse, card;
		var cardID = GenericCard.getCardID();
		var options = {
			canvasDOM: document.querySelector('.preview-canvas')
		};
		if(cardID && !pattern) // Import json if cardID exists (A.K.A. edit an existing card)
		{
			GenericCard.fetchData(cardID, (json)=>
			{
				classToUse = GenericCard.getCardClass(pattern);
				if(json.cardPattern)
					pattern = json.cardPattern;
				classToUse = GenericCard.getCardClass(pattern);
				card = new classToUse(options);
				card.cardID = cardID;
	
				card.importJson(json);
				window.currentCard = card;
			});
		}
		else
		{
			classToUse = GenericCard.getCardClass(pattern);
			card = new classToUse(options);
			window.currentCard = card;
		}

		
		/* Add ctrl-S shortcut */
		document.addEventListener('keydown',(e)=>
		{
			if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83)  // Ctrl + S or cmd + S
			{
				e.preventDefault();
				card.saveToDatabase();
			}
		}, false);
		/* Add ctrl-i shortcut */
		document.addEventListener('keydown',(e)=>
		{
			if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 73)  // Ctrl + i or cmd + i
			{
				e.preventDefault();
				card.exportImg();
			}
		}, false);
		/* Add paste imageData feature */
		document.addEventListener('paste', (e)=>
		{
			var items = (e.clipboardData || e.originalEvent.clipboardData).items;
			Object.entries(items).forEach(([index, item])=>
			{
				if(item.type.indexOf('image') == -1) 
					return;

				var blob = item.getAsFile();
				var uRLObj = window.URL || window.webkitURL;
				card.setCropperSrc( uRLObj.createObjectURL(blob), true );
			});	
		});
	}
	
	static getCardClass(pattern = 'magic')
	{
		var classToUse;
		switch(pattern)
		{
			case 'magic':
				classToUse = MagicCard;
			break;
	
			case 'hearthstone':
				classToUse = HearthstoneCard;
			break;
		}
	
		document.querySelector('.editor').dataset.pattern = pattern;
		return classToUse;
	}

	static getCardID()
	{
		var urlParams = new URLSearchParams(window.location.search);
		return urlParams.get('id') || null;
	}

	static fetchData(id, callback = null)
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
		this.uploadedImage = document.querySelector('img.uploaded-image');
	}

	destroy()
	{
		if(this.attributes)
		{
			Object.entries(this.attributes).forEach(([key, attribute])=>
			{
				if(attribute.destroy)
					attribute.destroy();	
			});
		}
		if(this.cropper)
			this.cropper.destroy();
	}


	getCardFrameSrc()
	{
		// TODO ovoerride me
	}

	update()
	{
		if(this.canvasDOM.width !== this.cardWidth)
			this.canvasDOM.width = this.cardWidth;
		if(this.canvasDOM.height !== this.cardheight)
			this.canvasDOM.height = this.cardheight;

		this.cardFrameImg = new Image();
		this.cardFrameImg.src = this.getCardFrameSrc();

		//var imagesToLoad = [this.cardFrameImg];
		//if(
		//	this.attributes['illustration'].value 
		//	&& this.attributes['illustration'].value.indexOf('fake') == -1 // not a cropped image
		//)
		//{
		//	this.uploadedImage.src = this.attributes['illustration'].value;
		//	imagesToLoad.push(this.uploadedImage);
		//}

		var actualDraw = ()=>
		{
			Object.entries(this.attributes).forEach( ([key, obj])=>
			{
				obj.draw();
			});
		};

		function onMultipleImagesLoaded(imagesArray, cb)
		{
			var loaded = 0;
			imagesArray.forEach((image)=>
			{
				image.addEventListener('load', ()=>
				{
					loaded++;
					if(loaded == imagesArray.length)
						cb();
				});
			});
		}

		//onMultipleImagesLoaded(imagesToLoad, actualDraw);
		this.cardFrameImg.onload = ()=>
		{
			actualDraw();
		};
	}

	setCropperSrc(src)
	{
		if(!src) 
			return;

		GenericCard.lastCropperSrc = src;

		if(src.indexOf('blob') == -1 && src.indexOf('data:') == -1) // image URL from another domain
			this.uploadedImage.src = 'https://cors-anywhere.herokuapp.com/'+src; // Thanks for this guys :)
		else // image uploaded with input type=file
			this.uploadedImage.src = src;

		//this.uploadedImage.onload = ()=>
		//{
			if(this.cropper) this.cropper.destroy(); // remove potential existing cropper
			
			this.cropper = new Cropper( this.uploadedImage, {
				dragMode: 'move',
				aspectRatio: this.attributes.illustration.boundingBox.width / this.attributes.illustration.boundingBox.height,
				cropend:  ()=>{this.update()},
				cropmove: ()=>{this.update()},
				zoom:     ()=>{this.update()},
				ready:    ()=>{this.update()},
			});
		//};
	}

	getWholeCardImgSrc()
	{
		this.update();
		return this.canvasDOM.toDataURL('image/png').replace("image/png", "image/octet-stream");
	}

	exportImg()
	{
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

		//if(this.attributes)
		//{
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
			});
		//}

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
		});
		this.update();
	}


	saveToDatabase()
	{
		var json = this.exportJson(); // get card-relative infos
		json['wholeCardImgSrc'] = this.getWholeCardImgSrc(); // save generated img to DB
		if(this.cardID) // existing card
			json['id'] = this.cardID; // update card
		else // new card
			json['userID'] = window.userID; // set ownership

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
				window.location.href = `/list-cards?userID=${userID}`;
			}
		};
		newXHR.open( 'POST', '/delete-card', true );
		newXHR.setRequestHeader("Content-Type", "application/json");
		var formattedJsonData = JSON.stringify( json );
		newXHR.send( formattedJsonData );
	}

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
				if(reResult)
				{
					context.font = 'italic ' + context.font;
					lineWord = lineWord.replace(italicRegex, '');
				}
				reResult = boldRegex.exec(lineWord);
				if(reResult)
				{
					context.font = 'bold ' + context.font;
					lineWord = lineWord.replace(boldRegex, '');
				}

				reResult = italicEndRegex.exec(lineWord);
				if(reResult)
				{
					lineWord = lineWord.replace(italicEndRegex, '');
					stopItalic = true;
				}
				reResult = boldEndRegex.exec(lineWord);
				if(reResult)
				{
					lineWord = lineWord.replace(boldEndRegex, '');
					stopBold = true;
				}

				/* Actual writing done here */
				//context.strokeText(lineWord+' ', x, y);
				context.fillText(lineWord+' ', x, y);

				if(stopItalic)
					context.font = context.font.replace('italic', '');
				if(stopBold)
					context.font = context.font.replace('bold', '');

				x+= context.measureText(lineWord+' ').width;
			});
		}
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

	isACreature()
	{
		return (this.attributes.toughness.value);
	}
}

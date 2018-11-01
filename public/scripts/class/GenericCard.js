class GenericCard
{
	static initCard(pattern)
	{
		if (window.currentCard)
		{
			if(window.currentCard.pattern === pattern )
				return;
			window.currentCard.destroy();
		}
	
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
				card.pattern = pattern;
	
				card.importJson(json);
				window.currentCard = card;
			});
		}
		else
		{
			classToUse = GenericCard.getCardClass(pattern);
			card = new classToUse(options);
			card.pattern = pattern;
			window.currentCard = card;
		}
	}
	
	static getCardClass(pattern = 'magic')
	{
		var classToUse;
		switch(pattern)
		{
			case 'magic':
				classToUse = MagicCard;
			break;

			case 'magic-transform':
				classToUse = MagicCardTransform;
			break;
			
			case 'magic-split':
				classToUse = MagicCardSplit;
			break;
	
			case 'hearthstone':
				classToUse = HearthstoneCard;
			break;

			case 'gwent':
				classToUse = GwentCard;
			break;

			case 'yu-gi-oh':
				classToUse = YuGiOhCard;
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

	static getFontSizeToFitText(ctx, text, maxTextWidth)
	{
		var titleFits = false;
		var fontSize = ctx.font.match(/\d+px/)[0].slice(0, -2); // fetch the font size, without 'px'

		while(!titleFits) // change text font based on his measured width
		{
			ctx.font = ctx.font.replace(/\d+px/, fontSize+"px");
			var textWidth = ctx.measureText(text).width;
			if(textWidth <= maxTextWidth)
				titleFits = true;
			else
				fontSize--;
		}

		return fontSize;
	}

	static imageToDataURL(image) // blob or file
	{
		return new Promise((resolve, reject)=>
		{
			/* blob/file to dataURL */
			try
			{
				var a = new FileReader();
				a.onload = function(e) 
				{
					resolve(e.target.result); // returns blob URL-encoded as URL-encoded gif
				};
				a.readAsDataURL(image);
			}
			catch(e)
			{
				reject('Failed to convert image to dataURL', e);
			}
		});
	}

	constructor(options = {})
	{
		this.options = options;
		this.init();
	}

	beforeInit()
	{
		this.cardWidth = 400, this.cardheight = 560;
		this.defaultFont = 'Trajan';
	}

	init()
	{
		({
			canvasDOM: this.canvasDOM = null,
		} = this.options);
		this.beforeInit();

		if(!this.canvasDOM)
			throw('Error: canvasDOM attribute is mandatory for the preview to work');

		this.ctx = this.canvasDOM.getContext('2d');
		this.uploadedImage = document.querySelector('img.uploaded-image');

		this.setAttributes();
		this.attributes['illustration'].value = this.uploadedImage.src;
		if(GenericCard.lastCropperSrc)
			this.setCropperSrc(GenericCard.lastCropperSrc);

		this.clear();
		this.update();
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
		if(this.cropper2)
			this.cropper2.destroy();
	}


	getCardFrameSrc()
	{
		// TODO ovoerride me
	}

	clear()
	{
		this.ctx.clearRect(0, 0, this.cardWidth, this.cardheight);
	}

	update()
	{
		if(this.canvasDOM.width !== this.cardWidth)
			this.canvasDOM.width = this.cardWidth;
		if(this.canvasDOM.height !== this.cardheight)
			this.canvasDOM.height = this.cardheight;

		this.cardFrameImg = new Image();
		this.cardFrameImg.src = this.getCardFrameSrc();

		var imagesToLoad = [this.cardFrameImg];

		/* TODO Move elsewhere */
		/* Dual-illustrations Magic specific */
		if(this.attributes.illustration2)
		{
			this.cardFrameImg2 = new Image();
			this.cardFrameImg2.src = this.getCardFrameSrc
			(
				this.attributes.manaCost2,
				this.attributes.power2,
				this.attributes.toughness2
			);
			imagesToLoad.push(this.cardFrameImg2);
		}

		var actualDraw = ()=>
		{
			this.attributes.illustration.draw();
			if(this.attributes.illustration2)
				this.attributes.illustration2.draw();
			Object.entries(this.attributes).forEach( ([key, obj])=>
			{
				/* Little hack: ALWAYS draw illustration first */
				if(['illustration', 'illustration2'].indexOf(key) === -1)
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

		onMultipleImagesLoaded(imagesToLoad, actualDraw);
	}

	setCropperSrc
	(
		src, 
		cropperRef = 'cropper',
		uploadedImage = this.uploadedImage,
		attribute = this.attributes.illustration
	)
	{
		if(!src) 
			return;

		GenericCard.lastCropperSrc = src;

		if(src.indexOf('blob') == -1 && src.indexOf('data:') == -1) // image URL from another domain
			uploadedImage.src = 'https://cors-anywhere.herokuapp.com/'+src; // Thanks for this guys :)
		else // image uploaded with input type=file
			uploadedImage.src = src;

		if(this[cropperRef]) this[cropperRef].destroy(); // remove potential existing cropper
		
		this[cropperRef] = new Cropper( uploadedImage, {
			dragMode: 'move',
			aspectRatio: attribute.boundingBox.width / attribute.boundingBox.height,
			cropend:  ()=>{this.update()},
			cropmove: ()=>{this.update()},
			zoom:     ()=>{this.update()},
			ready:    ()=>{this.update()},
		});
	}

	getWholeCardImgSrc(canvasDOM = this.canvasDOM)
	{
		this.update();
		return canvasDOM.toDataURL('image/png').replace("image/png", "image/octet-stream");
	}

	getWholeCardImgSrcPromise(canvasDOM = this.canvasDOM)
	{
		return new Promise((resolve, reject)=>
		{
			var illustrationAttribute = this.attributes.illustration;
			if(this.attributes.illustration2 && this.canvasDOM2 && canvasDOM == this.canvasDOM2) // secondary card
				illustrationAttribute = this.attributes.illustration2;

			if(!illustrationAttribute .frameData) // no gif
			{
				this.update();
				resolve(canvasDOM.toDataURL('image/png'));
			}
			else // gif
			{
				GifHandler.exportToFile(this)
				.then((urlEncodedGif)=>
				{
					resolve(urlEncodedGif);
				});
			}
		});
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
				else if(key === 'illustration2')
				{
					if(this.cropper2)
						json[key] = this.cropper2.getCroppedCanvas().toDataURL('image/png');
					else if(obj.value.startsWith('/images') )
						return;
					else
						json[key] = obj.value;
				}
				else
					json[key] = obj.value;
			});
		//}

		if(this.pattern)
			json.cardPattern = this.pattern;
		return json;
	}

	exportJsonPromise()
	{
		return new Promise((resolve, reject)=>
		{
			var json = {};

			Object.entries(this.attributes).forEach(([key, obj])=>
			{
				if( ['illustration', 'illustration2'].includes(key) )
					return;
				json[key] = obj.value;
			});

			if(this.pattern)
				json.cardPattern = this.pattern;

			if(this.attributes.illustration2)
			{
				if(this.cropper2)
					json.illustration2 = this.cropper2.getCroppedCanvas().toDataURL('image/png');
				else if(!this.attributes.illustration2.value.startsWith('/images') )
					json[key] = this.attributes.illustration2.value;
			}

			if(this.attributes.illustration)
			{
				/* special case for gifs */
				if(this.cropper && this.attributes.illustration.frameData) // cropped gif
				{
					GenericCard.imageToDataURL(this.attributes.illustration.inputDOM.files[0]) // TODO fixme export the cropped gif only
					.then((illustrationToDataURL)=>
					{
						json.illustration = illustrationToDataURL;
						resolve(json);
					});
				}
				if(this.cropper)
					json.illustration = this.cropper.getCroppedCanvas().toDataURL('image/png');
				else if(!this.attributes.illustration.value.startsWith('/images') )
					json[key] = this.attributes.illustration.value;
			}

			if
			(
				!this.attributes.illustration.frameData
				&& ( 
					!this.attributes.illustration2
					|| !this.attributes.illustration2.frameData
				)
			) // no cropped gif for illustration or illustration2
				resolve(json);
		});
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
			if(key == 'illustration2')
			{
				if(this.cropper2)
				{
					this.cropper2.destroy();
					this.cropper2 = null;
				}
			}
			else
			{
				try{
					this.attributes[key].inputDOM.value = val;
				}
				catch(e)
				{

				}
				this.attributes[key].inputDOM.checked = Boolean(val); // checkbox specific
			}
		});
		this.update();
	}


	saveToDatabase()
	{
		var json = this.exportJson(); // get card-relative infos
		json['wholeCardImgSrc'] = this.getWholeCardImgSrc(); // save generated img to DB
		if(json.cardPattern === 'magic-transform')
			json['wholeCardImgSrc2'] = this.getWholeCardImgSrc(this.canvasDOM2); // save generated img to DB
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

	saveToDatabasePromise()
	{
		var onJsonReady = (json)=>
		{
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
		};

		this.exportJsonPromise()
		.then((json)=>
		{
			if(this.cardID) // existing card
				json.id = this.cardID; // update card
			else // new card
				json.userID = window.userID; // set ownership

			this.getWholeCardImgSrcPromise()
			.then((wholeCardImgDataURL)=>
			{
				json.wholeCardImgSrc = wholeCardImgDataURL;

				if(json.cardPattern !== 'magic-transform') // default behaviour
				{
					onJsonReady(json); // JSON READY
				}
				else // on transform-card specific case
				{
					this.getWholeCardImgSrcPromise(this.canvasDOM2)
					.then((wholeCardImgDataURL2)=>
					{
						json.wholeCardImgSrc2 = wholeCardImgDataURL2;
						onJsonReady(json); // JSON READY
					});
				}
			});
		});
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
		return (this.attributes.power.value || this.attributes.toughness.value);
	}
}

document.addEventListener('DOMContentLoaded', (e)=>
{
	/* Add ctrl-S shortcut */
	document.addEventListener('keydown',(e)=>
	{
		if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83)  // Ctrl + S or cmd + S
		{
			e.preventDefault();
			window.currentCard.saveToDatabasePromise();
		}
	}, false);
	/* Add ctrl-i shortcut */
	document.addEventListener('keydown',(e)=>
	{
		if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 73)  // Ctrl + i or cmd + i
		{
			e.preventDefault();
			window.currentCard.exportImg();
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
			window.currentCard.setCropperSrc( uRLObj.createObjectURL(blob) );
		});	
	});
	/* Add illustration by url from input text  */
	/*
	['change', 'keyup'].forEach((action)=>
	{
		document.querySelector('input.uploader-by-url').addEventListener(action, (e)=>
		{
			window.currentCard.setCropperSrc( e.target.value );
		});
	});
	*/
});

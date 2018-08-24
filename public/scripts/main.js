var cropper;
var uploader, uploadedImage;
var previewCanvas, previewCtx;

var font = 'Trajan';

var title, titleBoundingBox,
	description, descriptionBoundingBox,
	manaCost, manaCostBoundingBox,
	type, typeBoundingBox,
	author, authorBoundingBox
	;

var abbreviationToSrc = {
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

var abbreviationDescriptionToSrc = {
	'(t)' : '/images/icons/tap.png',
	'(n)' : '/images/icons/untap.png',
};
Object.entries(abbreviationToSrc).forEach(function([key, val])
{
	abbreviationDescriptionToSrc[key] = val;
});

var getAbbreviationsRegexp = /\(([^)]?)\)/gi; // Matches every single char within parenthesis eg."(b)"

var cardFramesSrcByColor = {
	'colorless': '/images/frames/colorless',
	'white'    : '/images/frames/white',
	'blue'     : '/images/frames/blue',
	'black'    : '/images/frames/black',
	'red'      : '/images/frames/red',
	'green'    : '/images/frames/green',
	'gold'     : '/images/frames/gold',
};


document.addEventListener("DOMContentLoaded", function()
{
	//onReady();
	window.currentCard = new MagicCard({
		canvasDOM: document.querySelector('.preview-canvas')
	});
});

function onReady()
{
	
	cardCaptionBoundingBox = {
		left: 36,
		top: 68,
		width: 328,
		height: 242
	};
	
	title = '';
	titleBoundingBox = {
		left: 36,
		top: 52,
		width: 328,
		height: 10
	};
	
	description = '';
	descriptionBoundingBox = {
		left: 40,
		top: 370,
		width: 328,
		height: 150
	};
	
	manaCost = '';
	manaCostBoundingBox = {
		top: 40,
		right: -40
	};
	
	type = '';
	typeBoundingBox = {
		top: 336,
		left: 40
	};
	
	author = document.querySelector('.card-author').value;
	authorBoundingBox = {
		top: 522,
		left: 32
	};

	power = '';
	powerBoundingBox = {
		top: 520,
		left: 334
	};
	toughness = '';
	//toughnessBoundingBox = {
	//	top: 530,
	//	left: 350
	//};


	uploader = document.querySelector('.uploader');
	uploadedImage = document.querySelector('img.uploaded-image');

	previewCanvas = document.querySelector('.preview-canvas');
	previewCtx = previewCanvas.getContext('2d');

	['change', 'keyup'].forEach(function(action)
	{
		document.querySelector('input.uploader-by-url').addEventListener(action, function(e)
		{
			setCropperSrc( this.value, true );
		});
	});
	uploader.addEventListener('change', function(e)
	{
		setCropperSrc( window.URL.createObjectURL(this.files[0]) );
	}, false);
	
	document.querySelector('.card-title').addEventListener('keyup', function(e)
	{
		title = this.value;
		updatePreview();
	}, false);

	['change', 'keyup'].forEach(function(action)
	{
		document.querySelector('.card-description').addEventListener(action, function(e)
		{
			description = this.value;
		updatePreview();
		}, false);
	});

	['change', 'keyup'].forEach(function(action)
	{
		document.querySelector('.card-mana-cost').addEventListener(action, function(e)
		{
			manaCost = this.value;
			updatePreview();
		}, false);
	});

	document.querySelector('.card-type').addEventListener('keyup', function(e)
	{
		type = this.value;
		updatePreview();
	}, false);

	document.querySelector('.card-author').addEventListener('keyup', function(e)
	{
		author = this.value;
		updatePreview();
	}, false);

	document.addEventListener('keydown', function(e)
	{
		if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83)  // Ctrl + S or cmd + S
		{
			e.preventDefault();
			exportImg();
		}
	}, false);

	document.querySelector('.card-power').addEventListener('keyup',  function(e)
	{
		power = this.value;	
		updatePreview();
	}, false);
	document.querySelector('.card-toughness').addEventListener('keyup',  function(e)
	{
		toughness = this.value;
		updatePreview();
	}, false);


	updatePreview();

	buildIconsPicker({
		inputDestinationDOM: document.querySelector('input.card-mana-cost'),
		containerDOM: document.querySelector('div.mana-cost-buttons'),
		includeReset: true
	});
	buildIconsPicker({
		iconsOptions: abbreviationDescriptionToSrc,
		inputDestinationDOM: document.querySelector('textarea.card-description'),
		containerDOM: document.querySelector('div.description-buttons'),
	});
}

function setCropperSrc(src)
{
	if(!src) 
		return;

	try
	{
		if(src.indexOf('blob') == -1) // image URL from another domain
			uploadedImage.src = 'https://cors-anywhere.herokuapp.com/'+src; // Thanks for this guys :)
		else // image uploaded with input type=file
			uploadedImage.src = src;

		uploadedImage.onload = function()
		{
			if(cropper) cropper.destroy(); // remove potential existing cropper
			
			cropper = new Cropper( uploadedImage, {
				dragMode: 'move',
				aspectRatio: cardCaptionBoundingBox.width / cardCaptionBoundingBox.height,
				cropend: updatePreview,
				cropmove: updatePreview,
				zoom: updatePreview,
				ready: updatePreview
			});
		}
	}
	catch(e)
	{
		alert('Failed to retrieve the selected image! ', e);
	}
}

function getCardFrameSrc()
{
	var 
		white = (manaCost.match(/\(w\)/g) || []).length,
		blue  = (manaCost.match(/\(u\)/g) || []).length,
		black = (manaCost.match(/\(b\)/g) || []).length,
		red   = (manaCost.match(/\(r\)/g) || []).length,
		green = (manaCost.match(/\(g\)/g) || []).length;

	/* fatass if to determine the card's frame */
	var returnValue;
	if( !white && !blue && !black && !red && !green )
		returnValue = cardFramesSrcByColor.colorless;
	else if( white > 0 && !blue && !black && !red & !green )
		returnValue = cardFramesSrcByColor.white; 
	else if( blue > 0 && !white && !black && !red && !green )
		returnValue = cardFramesSrcByColor.blue;
	else if( black > 0 && !blue && !white && !red && !green )
		returnValue = cardFramesSrcByColor.black;
	else if( red > 0 && !blue && !black && !white && !green )
		returnValue = cardFramesSrcByColor.red;
	else if( green > 0 && !blue && !black && !red & !white )
		returnValue = cardFramesSrcByColor.green;
	else
		returnValue = cardFramesSrcByColor.gold;

	if(power || toughness)
		returnValue += '-creature';
	returnValue += '.png';

	return returnValue;
}

function updatePreview()
{
	var cardFrameImg = new Image();
	cardFrameImg.src = getCardFrameSrc();
	cardFrameImg.onload = function()
	{
		previewCtx.drawImage(cardFrameImg, 0, 0, 400, 560); // draw frame

		/* update image */
		if(cropper)
		{
			previewCtx.clearRect(cardCaptionBoundingBox.left, cardCaptionBoundingBox.top, cardCaptionBoundingBox.width, cardCaptionBoundingBox.height); // clear card's caption
			previewCtx.drawImage(cropper.getCroppedCanvas(), cardCaptionBoundingBox.left, cardCaptionBoundingBox.top, cardCaptionBoundingBox.width, cardCaptionBoundingBox.height);
		}

		/* update title */
		previewCtx.fillStyle = 'black';
		previewCtx.font = 'bold 18px '+font;
		previewCtx.fillText(title, titleBoundingBox.left, titleBoundingBox.top);

		/* update manacost */
		var startX = previewCanvas.width + manaCostBoundingBox.right;
		var startY = manaCostBoundingBox.top;
		var manaCostImages = getImagesByAbbreviationsText(manaCost);
		var manaIconsSize = 16;
		startX -= manaCostImages.length * manaIconsSize;
		manaCostImages.forEach(function(imageSrc)
		{
			var image = new Image();
			image.src = imageSrc;
			previewCtx.drawImage(image, startX, startY, manaIconsSize, manaIconsSize);
			startX += manaIconsSize;
		});

		/* update type */
		previewCtx.fillStyle = 'black';
		previewCtx.font = 'bold 16px '+font;
		previewCtx.fillText(type, typeBoundingBox.left, typeBoundingBox.top);

		/* update desc */
		var descFontSize = 16;
		previewCtx.fillStyle = 'black';
		previewCtx.font = descFontSize+'px '+font;
		wrapText(
			previewCtx, 
			description, 
			descriptionBoundingBox.left, 
			descriptionBoundingBox.top, 
			descriptionBoundingBox.width, 
			descFontSize
		);

		/* update author */
		var authorFontSize = 11;
		var authorColor = 'black';
		if(cardFrameImg.src.match(/(colorless|black|green|red)/)) 
			authorColor = 'white';
		previewCtx.fillStyle = authorColor;
		previewCtx.font = authorFontSize+'px '+font;
		previewCtx.fillText("Zougouda's Magic The Gathering™ generator, 2018", authorBoundingBox.left, authorBoundingBox.top);
		if(author)
			previewCtx.fillText("By "+author, authorBoundingBox.left, authorBoundingBox.top+authorFontSize);

		/* update power/toughness */
		if(power || toughness)
		{
			previewCtx.save();
			previewCtx.fillStyle = 'black';
			previewCtx.font = 'bold 20px '+font;
			previewCtx.textAlign = 'center';
			previewCtx.fillText(power + ' / ' + toughness, powerBoundingBox.left, powerBoundingBox.top);
			previewCtx.restore();
		}
	};
}

/* https://stackoverflow.com/a/2936288 */
function wrapText(context, text, x, y, line_width, line_height)
{
	var line = '';
	var paragraphs = text.split('\n');
	for (var i = 0; i < paragraphs.length; i++)
	{
		var words = paragraphs[i].split(' ');
		for (var n = 0; n < words.length; n++)
		{
			var testLine = line + words[n] + ' ';

			/* replace detected abbreviations by their matching images */
			var regex = getAbbreviationsRegexp; 
			while(reResult = regex.exec(testLine))
			{
				var pattern = reResult[0];
				var imageSrc = abbreviationDescriptionToSrc[pattern];
				if(imageSrc)
				{
					var textUpToAbbreviation = reResult.input.substring(0, reResult.input.indexOf(pattern) ); // remove everything just before the found string
					testLine = testLine.replace(pattern, ' '.repeat(pattern.length)); // remove pattern from the line and replace it with spaces

					var imgWidth = imgHeight = 12;
					var marginX = context.measureText(textUpToAbbreviation).width;
					var imgX = x + marginX;
					var imgY = y - imgHeight;

					/* build image */
					var img = new Image();
					img.src = imageSrc;
					context.drawImage(img, imgX, imgY, imgWidth, imgHeight);
				}
			}

			/* TODO : handle <i> and </i> */

			var metrics = context.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > line_width && n > 0)
			{
				context.fillText(line, x, y);
				line = words[n] + ' ';
				y += line_height;
			}
			else
			{
				line = testLine;
			}
		}
		context.fillText(line, x, y);
		y += line_height;
		line = '';
	}
}

function getImagesByAbbreviationsText(text)
{
	var regex = getAbbreviationsRegexp; 
	var allPatterns = text.match(regex); // get all patterns within parenthesis ( like '(b)' )

	var returnValue = [];
	if(allPatterns)
	{
		allPatterns.forEach(function(elem)
		{
			returnValue.push(abbreviationToSrc[elem]);
		});
	}
	return returnValue;
}

function exportImg()
{
	updatePreview();
	var dataUrl = previewCanvas.toDataURL('image/png').replace("image/png", "image/octet-stream");

	var downloadButton = document.createElement('a');
	downloadButton.setAttribute('download', (title) ? title+'.png' : 'newCard.png');
	downloadButton.href = dataUrl;
	downloadButton.click();
}

function insertIconIntoTextInput(iconAsText, inputDOM)
{
	var txtIndex = inputDOM.selectionStart;
	inputDOM.value = inputDOM.value.slice(0, txtIndex) + iconAsText + inputDOM.value.slice(txtIndex); // Add value at the selected index in the input

	/* manually trigger onchange event */
	var event = new Event('change');
	inputDOM.dispatchEvent(event);

	inputDOM.focus();
}

function buildIconsPicker(options = {})
{
	var {iconsOptions = abbreviationToSrc, 
		inputDestinationDOM, 
		containerDOM = null, 
		includeReset = false
	} = options;

	if(!containerDOM)
		containerDOM = inputDestinationDOM.parentNode;
	
	Object.entries(iconsOptions).forEach(function([key, value])
	{
		var button = document.createElement('a');
		button.classList.add('icons-picker-button');
		var img = document.createElement('img');
		img.src = value;
		img.width = 16;
		button.appendChild(img);
		button.onclick = function()
		{
			insertIconIntoTextInput(key, inputDestinationDOM);
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

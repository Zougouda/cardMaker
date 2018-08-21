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
	//'(10)' : '/images/icons/mana/10.png',
	//'(13)' : '/images/icons/mana/13.png',

	'(w)' : '/images/icons/mana/white.png',
	'(u)' : '/images/icons/mana/blue.png',
	'(b)' : '/images/icons/mana/black.png',
	'(r)' : '/images/icons/mana/red.png',
	'(g)' : '/images/icons/mana/green.png',
};


var cardFramesSrcByColor = {
	'default': '/images/createcard.jpg',
	'white': '/images/createcard.jpg',
	'blue': '/images/createcard.jpg',
	'black': '/images/createcard.jpg',
	'red': '/images/createcard.jpg',
	'green': '/images/createcard.jpg',
	'multi': '/images/createcard.jpg',
};


document.addEventListener("DOMContentLoaded", function()
{
	onReady();
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
		left: 30
	};


	uploader = document.querySelector('.uploader');
	uploadedImage = document.querySelector('img.uploaded-image');

	previewCanvas = document.querySelector('.preview-canvas');
	previewCtx = previewCanvas.getContext('2d');

	uploader.addEventListener('change', function(e)
	{
		uploadedImage.src = window.URL.createObjectURL(this.files[0])

		if(cropper) cropper.destroy(); // remove potential existing cropper

		cropper = new Cropper( uploadedImage, {
			//viewMode: 1,
			dragMode: 'move',
			aspectRatio: cardCaptionBoundingBox.width / cardCaptionBoundingBox.height,
			cropend: updatePreview,
			cropmove: updatePreview,
			zoom: updatePreview,
		});

		/* show preview when uploading new image */
		setTimeout(function()
		{
			updatePreview();
		}, 100);

	}, false);
	
	document.querySelector('.card-title').addEventListener('keyup', function(e)
	{
		title = this.value;
		updatePreview();
	}, false);

	document.querySelector('.card-description').addEventListener('keyup', function(e)
	{
		description = this.value;
		updatePreview();
	}, false);

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


	updatePreview();
	buildManaCostButtons(true);
};

function updatePreview()
{
	//previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height); // clear canvas

	var cardFrameImg = new Image();
	cardFrameImg.src = '/images/createcard.jpg'; // TODO use other frames depending on the mana used
	cardFrameImg.onload = function()
	{
		previewCtx.drawImage(cardFrameImg, 0, 0); // draw frame

		/* update image */
		if(cropper)
			previewCtx.drawImage(cropper.getCroppedCanvas(), cardCaptionBoundingBox.left, cardCaptionBoundingBox.top, cardCaptionBoundingBox.width, cardCaptionBoundingBox.height);

		/* update title */
		previewCtx.color = 'black';
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
			// FIXME wait for images to load ?
		});

		/* update type */
		previewCtx.color = 'black';
		previewCtx.font = 'bold 16px '+font;
		previewCtx.fillText(type, typeBoundingBox.left, typeBoundingBox.top);

		/* update desc */
		var descFontSize = 16;
		previewCtx.color = 'black';
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
		var authorFontSize = 13;
		previewCtx.color = 'black';
		previewCtx.font = authorFontSize+'px '+font;
		previewCtx.fillText("Zougouda's Magic The Gathering™ generator, 2018", authorBoundingBox.left, authorBoundingBox.top);
		if(author)
			previewCtx.fillText("By "+author, authorBoundingBox.left, authorBoundingBox.top+authorFontSize);
	};
}

/* https://stackoverflow.com/a/2936288 */
//function wrapText(context, text, x, y, line_width, line_height)
//{
//		var line = '';
//		var paragraphs = text.split('\n');
//		for (var i = 0; i < paragraphs.length; i++)
//		{
//				var words = paragraphs[i].split(' ');
//				for (var n = 0; n < words.length; n++)
//				{
//						var testLine = line + words[n] + ' ';
//						var metrics = context.measureText(testLine);
//						var testWidth = metrics.width;
//						if (testWidth > line_width && n > 0)
//						{
//								context.fillText(line, x, y);
//								line = words[n] + ' ';
//								y += line_height;
//						}
//						else
//						{
//								line = testLine;
//						}
//				}
//				context.fillText(line, x, y);
//				y += line_height;
//				line = '';
//		}
//}


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

					//var regex = /\(([^)]+)\)/gi;
					var regex = /\(([^)]?)\)/gi;
					while(reResult = regex.exec(testLine))
					{
						var pattern = reResult[0];
						var textUpToAbbreviation = reResult.input.substring(0, reResult.input.indexOf(pattern) ); // remove everything just before the found string
						testLine = testLine.replace(pattern, ' '.repeat(pattern.length)); // remove pattern from the line and replace it with spaces

						var imgWidth = imgHeight = 12;
						var marginX = context.measureText(textUpToAbbreviation).width;
						var imgX = x + marginX;
						var imgY = y - imgHeight;

						/* build image */
						var imageSrc = abbreviationToSrc[pattern];
						var img = new Image();
						img.src = imageSrc;

						context.drawImage(img, imgX, imgY, imgWidth, imgHeight);
					}

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
	//var regex = /\(([^)]+)\)/gi;
	var regex = /\(([^)]?)\)/gi;
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
	var dataUrl = previewCanvas.toDataURL('image/jpg').replace("image/png", "image/octet-stream");

	var downloadButton = document.createElement('a');
	downloadButton.setAttribute('download', (title) ? title+'.jpg' : 'newCard.jpg');
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
}

function buildManaCostButtons(includeReset = false)
{
	var containerSelector = '.mana-cost-buttons';
	var container = document.querySelector(containerSelector);
	
	Object.entries(abbreviationToSrc).forEach(function(entry)
	{
		var key = entry[0], value = entry[1];

		var button = document.createElement('a');
		var img = document.createElement('img');
		img.src = value;
		img.width = 16;
		button.appendChild(img);
		button.onclick = function()
		{
			insertIconIntoTextInput(key, document.querySelector('input.card-mana-cost'));
		};
		button.href = 'javascript:void(0);';
		container.appendChild(button);
	});

	if(includeReset)
	{
		var resetButton = document.createElement('a');
		resetButton.href = 'javascript:void(0);';
		resetButton.innerHTML = 'Reset';
		resetButton.onclick = function()
		{
			var input = document.querySelector('input.card-mana-cost');
			input.value = '';
			var event = new Event('change');
			input.dispatchEvent(event);
		};
		container.appendChild(resetButton);
	}
}

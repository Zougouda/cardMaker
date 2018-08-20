var cropper;
var uploader, uploadedImage;
var previewCanvas, previewCtx;

var font = 'Trajan';

var cardCaptionBoundingBox = {
	left: 36,
	top: 68,
	width: 328,
	height: 242
};

var title = '';
var titleBoundingBox = {
	left: 36,
	top: 52,
	width: 328,
	height: 10
};

var description = '';
var descriptionBoundingBox = {
	left: 40,
	top: 370,
	width: 328,
	height: 150
};

var manaCost = '';
var manaCostBoundingBox = {
	top: 40,
	right: -40
};

var type = '';
var typeBoundingBox = {
	top: 336,
	left: 40
};

document.addEventListener("DOMContentLoaded", function()
{
	onReady();
});

function onReady()
{
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
		var descFontSize = 14;
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
	var abbreviationToSrc = {
		'(w)' : 'https://vignette.wikia.nocookie.net/mtg/images/d/da/Mana_W.png/revision/latest',
		'(u)' : 'https://vignette.wikia.nocookie.net/mtg/images/a/a8/Mana_U.png/revision/latest',
		'(b)' : 'https://vignette.wikia.nocookie.net/mtg/images/a/a6/Mana_B.png/revision/latest',
		'(r)' : 'https://vignette.wikia.nocookie.net/mtg/images/c/ce/Mana_R.png/revision/latest',
		'(g)' : 'https://vignette.wikia.nocookie.net/mtg/images/f/f7/Mana_G.png/revision/latest',
	};
	var allPatterns = text.match(/\(([^)]+)\)/gi); // get all patterns within parenthesis ( like '(b)' )

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

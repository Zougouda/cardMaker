class GifHandler
{
	static animateCardCanvas(cardIllustrationAttr, src)
	{
		/* GIF HANDLING */
		if(cardIllustrationAttr.animationFrameID)
		{
			cancelAnimationFrame(cardIllustrationAttr.animationFrameID);
			cardIllustrationAttr.animationFrameID = null;
		}
		cardIllustrationAttr.frameData = null;
		cardIllustrationAttr.animationIndex = 0;
		GifHandler.isAnimatedGif(src, (isAnimated)=>
		{
			if(isAnimated)
			{
				GifHandler.getFramesData(src)
				.then((frameData)=>
				{
					cardIllustrationAttr.frameData = frameData;
					cardIllustrationAttr.cardObject.update();
				});
			}
		});
	}

	/* FROM https://gist.github.com/lakenen/3012623 */
	static  isAnimatedGif(src, cb) 
	{
		var request = new XMLHttpRequest();
		request.open('GET', src, true);
		request.responseType = 'arraybuffer';
		request.addEventListener('load', function () 
		{
			var arr = new Uint8Array(request.response),
			i, len, length = arr.length, frames = 0;

			// make sure it's a gif (GIF8)
			if (
					arr[0] !== 0x47 || arr[1] !== 0x49 || 
					arr[2] !== 0x46 || arr[3] !== 0x38)
			{
				return cb(false);
			}

			//ported from php http://www.php.net/manual/en/function.imagecreatefromgif.php#104473
			//an animated gif contains multiple "frames", with each frame having a 
			//header made up of:
			// * a static 4-byte sequence (\x00\x21\xF9\x04)
			// * 4 variable bytes
			// * a static 2-byte sequence (\x00\x2C) (some variants may use \x00\x21 ?)
			// We read through the file til we reach the end of the file, or we've found 
			// at least 2 frame headers
			for (i=0, len = length - 9; i < len, frames < 2; ++i) 
			{
				if (
						arr[i] === 0x00 && arr[i+1] === 0x21 &&
						arr[i+2] === 0xF9 && arr[i+3] === 0x04 &&
						arr[i+8] === 0x00 && 
						(arr[i+9] === 0x2C || arr[i+9] === 0x21)
					)
				{
					frames++;
				}
			}

			// if frame count > 1, it's animated
			return cb(frames > 1);
		});
		request.send();
	}

	static getFramesData(src)
	{
		return window.gifFrames({
				url: src, 
				frames: 'all', 
				outputType: 'canvas', 
				cumulative: true
			});
	}

	static exportToFile(cardObject)
	{
		return new Promise((resolve, reject)=>
		{
			var gif = new GIF({
				workers: 2,
				quality: 10,
				width: cardObject.cardWidth,
				height: cardObject.cardheight,
				workerScript: 'scripts/vendor/gif.worker.js'
			});
			gif.on('finished', function(blob) 
			{
				GenericCard.imageToDataURL(blob)
				.then((dataURL)=>
				{
					resolve(dataURL);
				});
			});

			var frameIndex = 0, isRendering = false;
			cardObject.attributes.illustration.afterDraw = ()=>
			{
				if(frameIndex >= cardObject.attributes.illustration.frameData.length && !isRendering)
				{
					isRendering = true;
					//console.log('RENDERING');
					gif.render();
				}

				if
				(
					cardObject.attributes.illustration.animationIndex == frameIndex
					&& frameIndex <= cardObject.attributes.illustration.frameData.length
					&& !isRendering
				)
				{
					gif.addFrame(cardObject.ctx, {delay: 48, copy: true});
					frameIndex++;
				}
			};
			cardObject.update();
		});

	}
}

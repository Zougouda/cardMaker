class GenericCard
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
		this.uploadedImage = document.querySelector('img.uploaded-image');

		/* Add ctrl-S shortcut */
		document.addEventListener('keydown',(e)=>
		{
			if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83)  // Ctrl + S or cmd + S
			{
				e.preventDefault();
				this.saveToDatabase();
			}
		}, false);
		/* Add ctrl-i shortcut */
		document.addEventListener('keydown',(e)=>
		{
			if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 73)  // Ctrl + i or cmd + i
			{
				e.preventDefault();
				this.exportImg();
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
				this.setCropperSrc( uRLObj.createObjectURL(blob), true );
			});	
		});
	}


	getCardFrameSrc()
	{
		// TODO ovoerride me
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
				window.location.href = `/list-cards?userID=${userID}`;
			}
		};
		newXHR.open( 'POST', '/delete-card', true );
		newXHR.setRequestHeader("Content-Type", "application/json");
		var formattedJsonData = JSON.stringify( json );
		newXHR.send( formattedJsonData );
	}
}

const express = require('express'),
	  bodyParser = require('body-parser')
	  http = require('http'),
	  pug = require('pug'),
	  mongoClient = require('mongodb').MongoClient,
	  mongoose = require('mongoose'),
	  fs = require('fs')
	  ;

/* DB vars */
const db = mongoose.connect('mongodb://localhost:27017/cardMaker', {useNewUrlParser: true});
const MagicCardModel = mongoose.model('MagicCard', require('./schemas/MagicCard.js')),
	  UserModel = mongoose.model('User', require('./schemas/User.js'));

const port = 4242;

const maxCardPerPage = 8;

function writeBase64ToImage(imageAsBase64, path)
{
	return new Promise((resolve, reject)=>
	{
		var base64Data = imageAsBase64
		.replace('data:image/png;base64,', '')
		.replace('data:image/octet-stream;base64,', '');
		fs.writeFile(path, base64Data, {encoding: 'base64'}, (imgErr)=>
		{
			if(imgErr)
				return reject(imgErr);
			resolve();
		});
	});
}

function getFavoritesCards(userID, fields = {})
{
	return new Promise((resolve, reject)=>
	{
		if(!userID)
			return reject(JSON.stringify({error: 'No userID specified'}));

		var onErrorCB = (err)=>
		{
			console.log(err);
			return reject(JSON.stringify({error: err}));
		};

		var populateOptions = {path: 'favoriteCards', select: fields}
		UserModel.findOne({userID})
		.populate(populateOptions)
		.then((user)=>
		{
			resolve(user);
		})
		.catch(onErrorCB);
	});
}

var app = express()
.use(bodyParser.json({limit: '50mb'})) // support json encoded bodies
.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
.get('/', (req, res)=>
{
	var linksOptions = [
		{src: '/images/Create new card.png', href: '/edit-card', title: 'New card'},
		{src: '/images/My cards.png', href: '/list-cards', title: 'My  cards'},
		{src: '/images/Crowd Favorites.png', href: '/favorite-cards', title: 'Favorites'},
		{src: '/images/All cards.png', href: '/list-cards', title: 'All cards'},
	];

	res.send(pug.renderFile('public/templates/index.pug', {linksOptions: linksOptions}));
})
.get('/edit-card', (req, res)=>
{
	var templateParams = {};
	var {id} = req.query;
	if(!id)
		return res.send(pug.renderFile('public/templates/editCard.pug', templateParams));

	MagicCardModel.findById(req.query.id, {_id: 0, title: 1, description: 1, author: 1}, (err, card)=>
	{
		if(err || !card)
			return res.send({error: "No card found"});

		templateParams.id = id;
		templateParams.title = card.title;
		templateParams.description = card.description;
		res.send(pug.renderFile('public/templates/editCard.pug', templateParams));
	});

})
.get('/get-card-data', (req, res)=>
{
	var id = req.query.id;
	if(!id)
		return res.send({error: 'No ID specified'});

	MagicCardModel.findById(req.query.id, {_id: 0, wholeCardImgSrc: 0, illustration: 0}, (err, card)=>
	{
		if(!card || err)
			return res.send({error: "No card found"});

		card.illustration = `/images/savedCards/${req.query.id}_illustration.png`;
		res.send(card);
	});
})
.post('/save-card', (req, res)=>
{
	var onSaveCallback = (err, savedCard)=>
	{
		if(err)
		{
			console.log(`Error: ${err}`);
			return res.send('ko');
		}

		/* write the whole card as an img onto the disk */
		writeBase64ToImage(req.body.wholeCardImgSrc, `public/images/savedCards/${savedCard.id}.png`)
		.then(()=>
		{
			/* write the illustration as an img onto the disk */
			if(!req.body.illustration)
		  		res.send('ok'); // success
			else
			{
				writeBase64ToImage(req.body.illustration, `public/images/savedCards/${savedCard.id}_illustration.png`)
				.then(()=>
				{
		  			res.send('ok'); // success
				});
			}
		});
	};

	var cardID = req.body.id;
	if(cardID)
		MagicCardModel.findOneAndUpdate({_id: cardID}, req.body, {new: true}, onSaveCallback);
	else
	{
		var card = new MagicCardModel(req.body);
		card.save(onSaveCallback);
	}

})
.post('/delete-card', (req, res)=>
{
	var cardID = req.body.id;
	if(cardID)
	{
		MagicCardModel.findByIdAndRemove(cardID, (err, savedCard)=>{});
	}
	res.send('ok'); // success
})
.get('/list-cards', (req, res)=>
{
	var userID = req.query.userID;
	
	var offset = req.query.offset;

	var searchParams = {};
	if(userID)
		searchParams.userID = userID;

	var onErrorCB = (err)=>
	{
		console.log(err);
		res.send(JSON.stringify({error: err}));
	};
	MagicCardModel.count(searchParams)
	.then((count)=>
	{
		MagicCardModel.find(searchParams, 
			{
				_id: 1,
				title: 1, 
				userID: 1, 
				author: 1,
			}, 
			{
				skip: offset, 
				limit: maxCardPerPage, 
				sort: {created: -1} // sort by creation date DESC
			}
		)
		.then((cards)=>
		{
			res.send(pug.renderFile('public/templates/listCards.pug', {cards, count, maxPerPage: maxCardPerPage, offset}));
		})
		.catch(onErrorCB);
	})
	.catch(onErrorCB);
})
.get('/favorite-cards', (req, res)=>
{
	var {userID} = req.query;

	getFavoritesCards(userID)
	.then((user)=>
	{
		res.send(pug.renderFile('public/templates/listCards.pug', {cards: user.favoriteCards}));
	})
	.catch((err)=>
	{
		res.send(err);	
	});
})
.get('/get-favorite-cards-id', (req, res) =>
{
	var {userID} = req.query;

	getFavoritesCards(userID, {'_id': 1})
	.then((user)=>
	{
		var arrayOfIDs = [];
		user.favoriteCards.forEach((card)=>
		{
			arrayOfIDs.push(card.id);
		});

		res.send(JSON.stringify(arrayOfIDs));
	})
	.catch((err)=>
	{
		res.send(err);	
	});
})
.get('/toggle-card-as-favorite', (req, res)=>
{	
	var {cardID, userID} = req.query;
	if(!cardID || !userID)
		return res.send(JSON.stringify({error: 'No cardID or userID specified'}));
	
	var errorResp = JSON.stringify({error: 'Failed to update database'});

	var onSaveCallback = (err, savedUser)=>
	{
		if(err)
			return res.send(errorResp);

		res.send(JSON.stringify(savedUser));
	};
	var onErrorCallback = (err)=>
	{
		res.send(errorResp);
	};

	UserModel.findOne({userID})
	.then((user)=>
	{
		if(!user) // no user found: create it with the first favorite
		{
			var user = new UserModel(req.body);
			user.userID = userID;
			user.favoriteCards.push(cardID)
			user.save(onSaveCallback);
		}
		else // update existing user
		{
			UserModel.findOne({userID})
			.then((user)=>
			{
				var index = user.favoriteCards.indexOf(cardID);
				if(index !== -1) // cardID exists
					user.favoriteCards.splice(index, 1);
				else
					user.favoriteCards.push(cardID)
				user.save(onSaveCallback);
			})
			.catch(onErrorCallback);
		}

	})
	.catch(onErrorCallback);
})
.get('/search', (req, res)=>
{
	var {search = ''} = req.query;
	
	var searchParams = {};

	var onErrorCB = (err)=>
	{
		console.log(err);
		res.send(JSON.stringify({error: err}));
	};
	MagicCardModel.find(
		{
			title: new RegExp(search, 'i')
		}, 
		{
			_id: 1,
			title: 1, 
			userID: 1, 
			author: 1,
		}, 
		{
			sort: {created: -1} // sort by creation date DESC
		}
	)
	.then((cards)=>
	{
		res.send(pug.renderFile('public/templates/listCards.pug', {cards, maxPerPage: null, offset: 0}));
	})
	.catch(onErrorCB);
})
.use(express.static('public'))
.use((req, res, next)=>
{
	res.status(404).send('404 not found.');
});

process.on('SIGINT', async function()
{
	try 
	{
		db.close();
	}
	catch(err){}
	process.exit();
});

var httpServer = http.createServer(app);
httpServer.listen(port);
console.log(`Now listening on port ${port}`);

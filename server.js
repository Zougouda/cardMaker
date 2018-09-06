const express = require('express'),
	  bodyParser = require('body-parser')
	  http = require('http'),
	  pug = require('pug'),
	  mongoClient = require('mongodb').MongoClient,
	  mongoose = require('mongoose'),
	  fs = require('fs')
	  ;

const MagicCardSchema = require('./schemas/MagicCard.js');

const port = 4242;

function getCardModel()
{
	var conn = mongoose.createConnection('mongodb://localhost:27017/cardMaker', {useNewUrlParser: true});
	var MagicCardModel = conn.model('MagicCard', MagicCardSchema);
	return MagicCardModel;
}

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

var app = express()
.use(bodyParser.json({limit: '50mb'})) // support json encoded bodies
.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
.get('/', (req, res)=>
{
	var linksOptions = [
		{src: '/images/Create new card.png', href: '/edit-card'},
		{src: '/images/My cards.png', href: '/list-cards'},
		{src: '/images/All cards.png', href: '/list-cards'},
	];

	res.send(pug.renderFile('public/templates/index.pug', {linksOptions: linksOptions}));
})
.get('/edit-card', (req, res)=>
{
	res.send(pug.renderFile('public/templates/editCard.pug'));
})
.get('/get-card-data', (req, res)=>
{
	var id = req.query.id;
	if(!id)
		return res.send({error: 'No ID specified'});

	var MagicCardModel = getCardModel();
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
	/* Save into DB */
	var MagicCardModel = getCardModel();

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
	/* Save into DB */
	var MagicCardModel = getCardModel();

	var cardID = req.body.id;
	if(!cardID)
		res.send('nope');

	MagicCardModel.findByIdAndRemove(cardID, (err, savedCard)=>
	{
		res.send('ok'); // success
	});
})
.get('/list-cards', (req, res)=>
{
	var userID = req.query.userID;
	var searchParams = {};
	if(userID)
		searchParams.userID = userID;

	var MagicCardModel = getCardModel();
	MagicCardModel.find(searchParams, 
	{
		_id: 1,
		title: 1, 
		userID: 1, 
		author: 1,
	}, (err, cards)=>
	{
		res.send(pug.renderFile('public/templates/listCards.pug', {cards: cards}));
	});
})
.use(express.static('public'))
.use((req, res, next)=>
{
	res.status(404).send('404 not found.');
});

var httpServer = http.createServer(app);
httpServer.listen(port);
console.log(`Now listening on port ${port}`);

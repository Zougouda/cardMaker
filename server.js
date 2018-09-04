const express = require('express'),
	  bodyParser = require('body-parser')
	  http = require('http'),
	  pug = require('pug'),
	  mongoClient = require('mongodb').MongoClient,
	  mongoose = require('mongoose'),
	  fs = require('fs');

const MagicCardSchema = require('./schemas/MagicCard.js');

const port = 4242;

var app = express()
.use(bodyParser.json({limit: '50mb'})) // support json encoded bodies
.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
.get('/', (req, res)=>
{
	res.send(pug.renderFile('public/templates/index.pug'));
})
//.get('/edit-card', (req, res)=>
//{
//	res.send(pug.renderFile('public/templates/index.pug'));
//})
.post('/save-card', (req, res)=>
{
	/* Save into DB */
	var conn = mongoose.createConnection('mongodb://localhost:27017/cardMaker', {useNewUrlParser: true});
	var MagicCardModel = conn.model('MagicCard', MagicCardSchema);

	var card = new MagicCardModel(req.body);
	card.save((err, savedCard)=>
	{
		/* write the whole card as an img onto the disk */
		var imgPath = `public/images/savedCards/${savedCard.id}.png`;
		var base64Data = req.body.wholeCardImgSrc
		.replace('data:image/png;base64,', '')
		.replace('data:image/octet-stream;base64,', '');
		fs.writeFile(imgPath, base64Data, {encoding: 'base64'}, (imgErr)=>
		{
			if(imgErr)
				console.log(imgErr);
		  	res.send('ok');
		});
	});
})
.get('/list-cards', (req, res)=>
{
	var conn = mongoose.createConnection('mongodb://localhost:27017/cardMaker', {useNewUrlParser: true});
	var MagicCardModel = conn.model('MagicCard', MagicCardSchema);
	MagicCardModel.find({}, {illustration: 0, wholeCardImgSrc: 0}, (err, cards)=>
	{
		//console.log(cards);
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

const express = require('express'),
	  http = require('http'),
	  pug = require('pug');

const port = 4242;

var app = express()
.get('/', (req, res)=>
{
	res.send(pug.renderFile('public/templates/index.pug'));
})
.use(express.static('public'))
.use((req, res, next)=>
{
	res.status(404).send('404 not found.');
});

var httpServer = http.createServer(app);
httpServer.listen(port);
console.log(`Now listening on port ${port}`);

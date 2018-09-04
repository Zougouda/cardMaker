document.addEventListener("DOMContentLoaded", function()
{
	window.currentCard = new MagicCard({
		canvasDOM: document.querySelector('.preview-canvas')
	});
	var card = window.currentCard;

	/* Import json if cardID exists (A.K.A. edit an existing card) */
	var urlParams = new URLSearchParams(window.location.search);
	var cardID = urlParams.get('id');
	if(cardID)
	{
		card.cardID = cardID;

		card.fetchData(cardID, (json)=>
		{
			card.importJson(json);
		});
	}
});

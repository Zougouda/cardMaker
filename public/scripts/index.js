document.addEventListener("DOMContentLoaded", function()
{
	/* add userID to the 'my cards' link FIXME dirty ? */
	var myCardsLink = document.querySelector('.list-card-el:nth-child(2) a');
	myCardsLink.href += '?userID='+window.userID;

	/* add userID to the 'my cards' link FIXME dirty ? */
	var favoriteCardsLink = document.querySelector('.list-card-el:nth-child(3) a');
	favoriteCardsLink.href += '?userID='+window.userID;
});

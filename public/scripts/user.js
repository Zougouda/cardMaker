document.addEventListener("DOMContentLoaded", ()=>
{
	/* set the current user as owner */
	var userID = localStorage.getItem('userID');
	if(!userID)
	{
		userID = new Date().valueOf();
		localStorage.setItem('userID', userID);
	}
	window.userID = userID;

	/* check for favorites cards */
	checkFavorites();

	/* Handle search requests */
	document.querySelector('.search').addEventListener('keyup', function(e)
	{
		event.preventDefault();
		if (event.keyCode === 13) // enter
			window.location.href = `/search?search=${this.value}`;
	});
});

function addCardToFavorites(cardID, callback)
{
	return fetch(`/toggle-card-as-favorite?cardID=${cardID}&userID=${window.userID}`)
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

function checkFavorites()
{
	fetch(`/get-favorite-cards-id?userID=${window.userID}`)
	.then((resp)=>
	{
		resp.json()
		.then((myFavoriteCardsIDs)=>
		{
			document.querySelectorAll('.list-card-el').forEach((cardEl)=>
			{
				var isFavoriteCheckbox = cardEl.querySelector('.add-to-favorites');
				var cardID = cardEl.dataset.cardId;
				if(!isFavoriteCheckbox)
					return;

				if( myFavoriteCardsIDs.indexOf(cardID) !== -1)
					isFavoriteCheckbox.checked = true;
				
				isFavoriteCheckbox.addEventListener('change', (e)=>
				{
					addCardToFavorites(cardID);	
				}, false);
			});
		})
	});
}

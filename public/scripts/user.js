( ()=>
{
	/* set the current user as owner */
	var userID = localStorage.getItem('userID');
	if(!userID)
	{
		userID = new Date().valueOf();
		localStorage.setItem('userID', userID);
	}
	window.userID = userID;
})()

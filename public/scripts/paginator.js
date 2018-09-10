function paginator(containerDOM, maxPerPage, count)
{
	var pagesNumber = Math.ceil(count / maxPerPage);
	if(pagesNumber < 2)
		return;

	var urlParams = new URLSearchParams(window.location.search);
	var offset = urlParams.get('offset') || 0;
	for(var i = 0; i < pagesNumber; i++)
	{
		let currentOffset = i*maxPerPage;
		if(currentOffset == offset)
		{
			var page = document.createElement('span');
		}
		else
		{
			var page = document.createElement('a');
			urlParams.set('offset', currentOffset)
			page.href = window.location.pathname + '?' + urlParams.toString();
		}
		page.classList.add('page');
		page.innerHTML = i+1;
		containerDOM.appendChild(page);
	}
}


document.addEventListener("DOMContentLoaded", function()
{
	paginator(document.querySelector('.paginator'), window.maxPerPage, window.count );
});

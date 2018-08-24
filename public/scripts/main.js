document.addEventListener("DOMContentLoaded", function()
{
	window.currentCard = new MagicCard({
		canvasDOM: document.querySelector('.preview-canvas')
	});
});


function DrawContextMenu(e) {
	$("cx-menu").css("visibility", "visible");
	$("cx-menu").css({left:e.pageX, top:e.pageY});
	var i = ($(e.target).parent()).attr("id");
}



function Rename(e){
	console.log('rf');
}



function ActivateContextMenu(){
  $("cx-menu").load("context_menu.html");
  $("#Rename").click(function ()
	{	chrome.tabs.update(null, {url: 'https://translate.google.ru/?hl=ru' }); });
}

ActivateContextMenu();

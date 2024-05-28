
function DrawContextMenu(e) {
	document.querySelector("cx-menu").style.visibility = "visible";
	document.querySelector("cx-menu").style.left = e.pageX + "px";
	document.querySelector("cx-menu").style.top = e.pageY + "px";
	var i = e.target.parentElement.id;
}


function Rename(e){
	console.log('rf');
}

function ActivateContextMenu() {
	let menu = document.querySelector("cx-menu");
	let rename = document.getElementById("Rename");
	rename.addEventListener("click", function(e) {
		Rename(e);
	});
}

ActivateContextMenu();

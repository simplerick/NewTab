// Copyright (c) 2017 Mikhaylov Artyom "SimpleRick".

/*
d1 - width of column (default),
d2 - height of row,
c1 - number of columns,
c2 - number of rows,
w - width (default),
a - width ratio (menu-open state/default)
h - height,
l - size of icon,
k - area ratio,
N - number of bookmarks,
caption - presence of captions,
minfs - minimal font size,
maxfs - max font size,


Calculations and ideas:
d1*c1 = a*w, d2*c2 = h, c1*c2 > N.
Want: d1 ~ d2 in menu-open state ==> d1=d2=d; (d1<=d2) ==> c1 = min integer > sqrt(Naw/h), c2 = min integer > N/c1.
l^2 = k*d1*d2=k*a*w*h/c1/c2.
 */

let startTime = performance.now();


let w = document.body.clientWidth;
let h = document.body.clientHeight;
let a = 0.72;
let k = 0.15;
let minfs = 13;
let maxfs = 15;
let GridAnimation = true; // increase icon on hover
let Caption = true; // presence of captions
let BgCaption = true; // background of caption
let ListAnimation = true; // draw list items in the side menu gradually
let LightSpot = true; // highlight folder icons
// let BlurAnimation = true; Add later (see last in styles.scss)


function Transition(Bookmark){
	return function ()
	{
		chrome.tabs.update(null, {url: Bookmark.url });
	}
}


function CreateList(Bookmark) {
	/**
	 * Create list of bookmarks in the side menu.
	 */
	// for each nested bookmark create a list item
	let template = document.getElementById("list-item-template");
	document.getElementById("side-menu-title").innerHTML = Bookmark.title;
	Bookmark.children.forEach((child) => {
		let new_item = template.content.cloneNode(true);
		new_item.querySelector(".list-item > img").src = `chrome://favicon/size/16@1x/${child.url}`;
		let a = new_item.querySelector(".list-item > p > a");
		a.innerHTML = child.title;
		a.href = child.url;
		document.getElementById("list").append(new_item);
	});
}


function ToggleMenu(Bookmark){
	/**
	 * Toggle side menu. If bookmark is passed, open side menu, add header and list of it's nested bookmarks.
	 * Otherwise, clear content and close side menu.
	 */
	return function() {
		if(document.body.classList.contains("menu-open") || Bookmark === undefined){
			document.getElementById("side-menu-title").innerHTML = "";
			document.getElementById("list").innerHTML = "";
			document.getElementById("list").scrollTop = 0;
		}
		if(Bookmark){
			document.body.classList.add("menu-open");
			CreateList(Bookmark);
		} else {
			document.body.classList.remove("menu-open");
		}
	}
}


function CreateGrid(Bookmarks){
	let template = document.getElementById("grid-item-template");
	Bookmarks.forEach((Bookmark) => {
		let figure = template.content.cloneNode(true).querySelector("figure");
		let img = figure.querySelector("img");
		img.title = Bookmark.title;
		if(Bookmark.children) {
			img.src = `icon/${Bookmark.title}.svg`
			img.onerror = () => {img.src = "icon/default/folder.svg"};
			figure.classList.add("folder");
			figure.onclick = ToggleMenu(Bookmark);
		} else {
			img.src = `icon/${(new URL(Bookmark.url)).hostname}.svg`;
			img.onerror = () => {img.src = "icon/default/bookmark.svg"};
			figure.classList.add("bookmark");
			figure.onclick = Transition(Bookmark);
		}
		figure.oncontextmenu = (e) => {
			e.preventDefault();
			DrawContextMenu(e);
		};
		figure.querySelector("figcaption").innerHTML = Bookmark.title;
		document.getElementById("grid").append(figure);
	});
}


function CreateHtml(Tree) {
	let Bookmarks = Tree[0].children[0].children;
	let N = Bookmarks.length;
	let c1 = Math.ceil(Math.sqrt(a*w*N/h));
	let c2 = Math.ceil(N/c1);
	let d1 = a*w/c1;
	let l = Math.ceil(Math.sqrt(k*d1*h/c2));

	SetStyles(l, Caption, LightSpot, BgCaption, ListAnimation);
	CreateGrid(Bookmarks);

	document.querySelector("#side-menu > .plus-btn").onclick = ToggleMenu();
	document.body.addEventListener("click", function (e) {
		if (e.target.matches("div.container") || e.target.matches("body.window")) {
			ToggleMenu()();
		}
		if (!e.target.matches("cx-menu"))
			document.querySelector("cx-menu").style.visibility = "hidden";
	});

	let container = document.querySelector(".container");
	if (GridAnimation) {
		container.style.gridTemplateColumns = `repeat(${c1}, 1fr)`; // grid properties
		container.style.gridTemplateRows = `repeat(${c2}, 1fr)`;
		container.style.height = "90vh";
		container.style.margin = "auto";
		let grid_icons = document.querySelectorAll("figure.item > img");
		grid_icons.forEach((grid_icon) => {
			grid_icon.addEventListener("mouseover", function() {
				grid_icon.style.width = 1.2*l + "px";
				grid_icon.style.height = 1.2*l + "px";
			});
			grid_icon.addEventListener("mouseout", function() {
				grid_icon.style.width = l + "px";
				grid_icon.style.height = l + "px";
			});
		});
	} else {
		container.style.gridTemplateColumns = `repeat(${c1}, auto)`; // grid properties
		container.style.gridTemplateRows = `repeat(${c2}, auto)`;
	}
}

function SetStyles(size, Caption, LightSpot, BgCaption, ListAnimation, BlurAnimation) {
	let grid_item = document.getElementById("grid-item-template").content.querySelector("figure");
	let grid_icon = grid_item.querySelector("img");
	grid_icon.style.width = size + "px";
	grid_icon.style.height = size + "px";
	if(Caption && Number(0.2 * size)>minfs) {
		let caption = grid_item.querySelector("figcaption");
		caption.classList.remove("hidden");
		if (BgCaption) {
			caption.classList.add("caption_bg");
		}
	}
	if(LightSpot) {
		grid_item.querySelector("div.point").classList.remove("hidden");
	}
	if(ListAnimation) {
		document.querySelector("div.menu > div.list").classList.add("list-animation");
	}
}



chrome.bookmarks.getTree(CreateHtml);
chrome.bookmarks.onChanged.addListener(() => {chrome.bookmarks.getTree(CreateHtml);});


window.onload = function() {
    let endTime = performance.now();
    let timeTaken = endTime - startTime;
    console.log("Page load time is " + timeTaken + " milliseconds.");
}
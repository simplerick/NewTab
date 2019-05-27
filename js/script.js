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
Want: d1 ~ d2 in menu-open state ==> d1=d2=d; (d1<=d2) ==> c1 = min integral > sqrt(Naw/h), c2 = min integral > N/c1.
l^2 = k*d1*d2=k*a*w*h/c1/c2.
 */


var w = $("body").width(); //1366
var h = $("body").height();
var a = 0.72;
var k = 0.15;
var minfs = 13;
var maxfs = 15;
var GridAnimation = true;
var Caption = false;
var BgCaption = true;
var ListAnimation = true;
var LightSpot = false;
// var BlurAnimation = true; Add later (see last in styles.scss)

function Transition(Bookmark){
	return function ()
	{
		chrome.tabs.update(null, {url: Bookmark.url });
	}
}

function OpenMenu(Bookmark){
	return function() {
		if(!$("body").hasClass("menu-open")){
			$("body.window").addClass("menu-open");
		} else {
			$("div.menu > div.header > h, div.menu > div.list > div").detach();
		}
		$("div.menu > div.header").append("<h>"+Bookmark.title+"</h>");
		if (ListAnimation) {
			for(i = 0; i < Bookmark.children.length; i++) {
				$("div.menu > div.list").append("<div class = 'favicon'> <img  src='chrome://favicon/size/16@1x/"+ Bookmark.children[i].url +"'> <p><a href='"+ Bookmark.children[i].url+"'>" + Bookmark.children[i].title + "</a></p> </div>");
				$("div.list-animation > div:nth-child("+(i+1)+")").css("animation-delay", (i+1)/10 +"s");
			}
		} else {
			for(i = 0; i < Bookmark.children.length; i++) {
				$("div.menu > div.list").append("<div class = 'favicon'> <img  src='chrome://favicon/size/16@1x/"+ Bookmark.children[i].url +"'> <p><a href='"+ Bookmark.children[i].url+"'>" + Bookmark.children[i].title + "</a></p> </div>");
			}
		}

	}
}





function CreateHtml(Tree) {
	var Bookmarks = Tree[0].children[0].children;
	var N = Bookmarks.length;
	var c1 = Math.ceil(Math.sqrt(a*w*N/h));
	var c2 = Math.ceil(N/c1);
	var d1 = a*w/c1;
	var l = Math.ceil(Math.sqrt(k*d1*h/c2));

function DrawContextMenu(e) {
	$("cx-menu").css("visibility", "visible");
	$("cx-menu").css({left:e.pageX, top:e.pageY});
	var i = ($(e.target).parent()).attr("id");
	$("cx-menu").append("<button role='menuitem'>"+"Lorem Ipsum"+"</menuitem>");
	$("cx-menu").append("<button role='menuitem'>"+"Create shortcuts..."+"</menuitem>");

}

	if (Number(0.2*l)<minfs) { Caption = false; }

	for (i = 0;  i < N; i++) {
		if(!Bookmarks[i].children) {
			var str = "<figure class='item' id = '"+i+"'> <img class='bookmark' src='icon/"+ (new URL(Bookmarks[i].url)).hostname +".svg' title ='"+ Bookmarks[i].title +"'></figure>";
			$("div.container").append(str);
			$("#"+i).click(Transition(Bookmarks[i]));
			$("#"+i).bind("contextmenu", function(e) {
				DrawContextMenu(e);
				e.preventDefault();
			});
		}
		else {
			var str = "<figure class='item' id = '"+i+"'> <img class='folder' src='icon/"+ Bookmarks[i].title +".svg' title ='"+ Bookmarks[i].title +"'>"+ (LightSpot ? "<div class = 'point'></div>" : "") + "</figure>";
			$("div.container").append(str);
			$("#"+i).click(OpenMenu(Bookmarks[i]));
			$("#"+i).bind("contextmenu", function(e) {
				DrawContextMenu(e);
				e.preventDefault();
			});
		}
	}

	if(Caption) {
		for (i = 0;  i < N; i++) {
			$("figure#"+i).append("<figcaption>"+ Bookmarks[i].title +"</figcaption>");
			$("figcaption").css("width", 0.7*d1);  // properties of caption
			$("figcaption").css("font-size", (Number(0.2*l) > maxfs) ? maxfs : (0.2*l));
		}
	}


	$("img.bookmark").on("error", ( function() { $(this).attr("src", "icon/default/bookmark.svg");})); // default icons in the case where there are no personal
	$("img.folder").on("error", ( function() { $(this).attr("src", "icon/default/folder.svg");}));

	$("figure.item > img").css("width", l); // assigns size of icons
	$("figure.item > img").css("height", l);

	$(".plus-btn").click(function () {
		$("div.menu > div.header > h, div.menu > div.list > div").detach();
		$("body.window").removeClass("menu-open");
	});

	$("body").click(function (e) {
		if ($(e.target).is("div.container") || $(e.target).is("body.window")) {
			$("div.menu > div.header > h, div.menu > div.list > div").detach();
			$("body.window").removeClass("menu-open");
		}
		if (!$(e.target).is("cx-menu"))
			$("cx-menu").css("visibility", "hidden");
	});





	if (GridAnimation) {
	$(".container").css("grid-template-columns", "repeat("+c1+",1fr)"); // grid properties
	$(".container").css("grid-template-rows", "repeat("+c2+",1fr)");
	$(".container").css("height", "90vh");
	$(".container").css("margin", "auto");
	$("figure.item > img").hover(
		function() {
			$(this).animate({
				width: 1.2*l,
				height: 1.2*l
			}, 100);},
		function() {
			$(this).stop(true);
			$(this).animate({
				width: l,
				height: l
			}, 100);}
	);
	} else {
	$(".container").css("grid-template-columns", "repeat("+c1+", auto)"); // grid properties
	$(".container").css("grid-template-rows", "repeat("+c2+", auto)");
	}


	if (BgCaption && Caption) {
		$("figure.item > figcaption").addClass("caption_bg")
	}

	if (ListAnimation) {
		$("div.menu > div.list").addClass("list-animation");
	}

}






chrome.bookmarks.getTree(CreateHtml);

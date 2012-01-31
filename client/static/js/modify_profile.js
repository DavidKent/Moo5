$(document).ready(onReady);
var u = ".tab_page", v=".tab_click";
function onReady(e){	
	$(u).hide();
	$('#p0').show();
	$(v).click(tab_click_onClick);
}

function tab_click_onClick(e){
	$(u).hide();
	$(v).parent().removeClass('active');
	var page = $("#p"+$(this).attr('id').substr(1,1));
	var tab = $(this).parent();
	page.fadeIn(1000);
	tab.addClass('active');
}
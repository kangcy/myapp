function ShowVideo(domid, vid) {
	player = new YKU.Player(domid, {
		client_id: base.youku_client_id,
		styleid: '0',
		vid: vid,
		autoplay: false,
		show_related: false
	});
}

function AppendVideo(sourceurl) {
	var html = []; 
	var width = window.innerWidth * 0.9;
	var height = window.innerHeight * 0.5;
	//优酷
	if(sourceurl.indexOf(".") < 0) {
		return '<div class="media-cont audio-cont" style="width:100%;"><div id="youku_player_' + sourceurl + '" sid="' + sourceurl + '" class="youku_player" style="width:' + width + ';height:' + height + ';"></div></div>';
	}
	//SWF
	if(sourceurl.toLowerCase().indexOf(".swf") > 0) {
		return '<div class="media-cont audio-cont" style="width:100%;"><embed src="' + sourceurl + '" allowfullscreen="true" quality="high" width="' + width + '"  height="' + height + '" align="middle" allowscriptaccess="always" type="application/x-shockwave-flash"></embed></div>';
	}
	//本地视频
	if(sourceurl.toLowerCase().indexOf(".") > 0) {
		return '<video controls="controls" style="width:90%;height:200px;margin:5%;float:left;" preload="Metadata"><source src="' + sourceurl + '" /></video>';
	}
	return "";
}
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
	var height = window.innerHeight * 0.5;
	//优酷
	if(sourceurl.indexOf(".") < 0) {
		return '<div class="media-cont audio-cont" style="width:100%;"><div id="youku_player_' + sourceurl + '" sid="' + sourceurl + '" class="youku_player" style="width:100%;height:' + height + ';"></div></div>';
	}
	//SWF
	if(sourceurl.toLowerCase().indexOf(".swf") > 0) {
		return '<div class="media-cont audio-cont" style="width:100%;"><embed src="' + sourceurl + '" allowfullscreen="true" quality="high" width="100%"  height="' + height + '" align="middle" allowscriptaccess="always" type="application/x-shockwave-flash"></embed></div>';
	}
	//本地视频
	if(sourceurl.toLowerCase().indexOf(".") > 0) {
		return '<video style="width:100%;height:' + height + 'px;" autoplay controls preload="none"><source src="' + sourceurl + '" /></video>';
	}
	return "";
}
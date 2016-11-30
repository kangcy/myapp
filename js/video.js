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
	//优酷
	if(sourceurl.indexOf(".") < 0) {
		return '<div class="media-cont audio-cont" style="margin-top: 10px; width: 100%;"><div id="youku_player_' + sourceurl + '" sid="' + sourceurl + '" class="youku_player" style="width:100%;height:400px;"></div></div>';
	}
	//SWF
	if(sourceurl.toLowerCase().indexOf(".swf") > 0) {
		return '<div class="media-cont audio-cont" style="margin-top:10px;width: 100%;"><embed src="' + sourceurl + '" allowfullscreen="true" quality="high" width="100%"  height="400" align="middle" allowscriptaccess="always" type="application/x-shockwave-flash"></embed></div>';
	}
	//本地视频
	if(sourceurl.toLowerCase().indexOf(".") > 0) {
		return '<video style="margin-top:10px;" src="' + sourceurl + '" controls></video>';
	}
	return "";
}
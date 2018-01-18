//用户列表
template.defaults.imports.formatUrl = function(url, type) {
	return base.ShowThumb(url, type);
}

template.defaults.imports.formatText = function(text) {
	return base.UnUnicodeText(text)
}

template.defaults.imports.formatDistance = function(distance) {
	var distance = parseFloat(distance);
	var meter = parseInt(distance / 100);
	if(meter < 9) {
		return(meter + 1) + "00米以内";
	} else {
		return(parseInt(distance / 1000) + 1) + "公里以内";
	}
}

template.defaults.imports.formatTip = function(type, article, follow, keep) {
	switch(type) {
		case 0:
			return "喜欢了" + article + "篇";
			break;
		case 1:
			return "关注了" + follow + "人";
			break;
		case 2:
			return "收藏了" + keep + "篇";
			break;
		default:
			return "";
			break;
	}
}
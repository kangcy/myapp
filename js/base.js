(function($, owner) {

	/**
	 * 获取接口请求根路径
	 **/
	owner.RootUrl = "http://localhost/app/";

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

}(mui, window.base = {}));
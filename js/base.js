(function($, owner) {

	/**
	 * 列表每次请求数
	 **/
	owner.PageSize = 1;

	/**
	 * 获取接口请求根路径
	 **/
	owner.RootUrl = "http://localhost/app/";

	/**
	 * 获取当前用户ID
	 **/
	owner.GetUserID = function() {
		return 1;
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.GetSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	/**
	 * 校验字符串是否为空
	 **/
	owner.IsNullOrEmpty = function(str) {
		if(str == null || str == undefined || str == "") {
			return true;
		}
		return false;
	}

}(mui, window.base = {}));

/**
 * Get请求
 **/
function HttpGet(url, data, callback) {
	$.ajax({
		url: url,
		type: "GET",
		dataType: "jsonp",
		data: data,
		jsonp: 'jsoncallback',
		contentType: "application/json;utf-8", //返回Json类型 
		success: function(res) {
			callback(res)
		}
	});
}
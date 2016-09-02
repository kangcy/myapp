(function($, owner) {

	/**
	 * 列表每次请求数
	 **/
	owner.PageSize = 10;

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

	/**
	 * 发送GET请求
	 **/
	owner.HttpGet = function(url, data, callback) {
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
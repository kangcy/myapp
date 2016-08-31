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

	/*owner.httpGet = function(url, callback) {
		var xhr = new plus.net.XMLHttpRequest();
		xhr.onreadystatechange = callback(xhr);
		xhr.open("GET", url);
		xhr.send();
	}

	base.httpGet(base.RootUrl, function(xhr) {
				if(xhr.readyState == 4 && xhr.status == 200) {
					alert(xhr.responseText)
					var data = JSON.parse(xhr.responseText);
				}
			})*/

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
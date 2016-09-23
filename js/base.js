var base = new function() {
	/**
	 * 是否测试
	 **/
	this.IsTest = true;

	/**
	 * 列表每次请求数
	 **/
	this.PageSize = 1;

	/**
	 * 窗口动画持续时间
	 **/
	this.AnimateDuration = 300;

	/**
	 * 获取接口请求根路径
	 **/
	this.RootUrl = "http://localhost/app/";

	/**
	 * 获取当前用户ID
	 **/
	this.GetUserID = function() {
		return 2;
	}

	/**
	 * 获取当前用户信息
	 **/
	this.GetUserInfo = function() {
		var settingsText = localStorage.getItem('$userinfo') || "{}";

		if(base.IsTest && settingsText == "{}") {
			return {
				ID: 1,
				UserName: 18652913873,
				Password: 123456,
				NickName: "一个傻瓜",
				Avatar: "",
				NickName: "",
				Address: "",
				Birthday: ""
			}
		}
		return JSON.parse(settingsText);
	}

	/**
	 * 设置应用本地配置
	 **/
	this.GetSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	/**
	 * 校验字符串是否为空
	 **/
	this.IsNullOrEmpty = function(str) {
		if(str == null || str == undefined || str == "") {
			return true;
		}
		return false;
	}

	/**
	 * 产生一个随机数
	 **/
	this.GetUid = function() {
		return new Date().getTime().toString();
	}
}

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
(function($, owner) {
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.UserName = loginInfo.UserName || '';
		loginInfo.Password = loginInfo.Password || '';
		if(loginInfo.UserName.length < 5) {
			return callback('账号最短为 5 个字符');
		}
		if(loginInfo.Password.length < 6) {
			return callback('密码最短为 6 个字符');
		}

		//登录验证
		HttpGet(base.RootUrl + "User/Login", {
			UserName: loginInfo.UserName,
			Password: loginInfo.Password
		}, function(data) {
			if(data == null) {
				return callback("系统异常,请稍后再试~");
			} else {
				if(data.result) {
					//更新用户缓存信息
					data = data.message;

					var info = {
						ID: data.ID,
						Sex: data.Sex == "0" ? "男" : "女",
						Signature: data.Signature,
						UserName: loginInfo.UserName,
						Password: loginInfo.Password,
						Avatar: data.Avatar,
						NickName: data.NickName,
						Address: data.Address,
						Birthday: data.BirthdayText,
						Follows: data.Follows,
						Fans: data.Fans,
						Articles: data.Articles,
						Keeps: data.Keeps,
						Comments: data.Comments,
						Zans: data.Zans,
						Cover: data.Cover
					}
					localStorage.setItem('$userinfo', JSON.stringify(info));
					return callback();
				} else {
					return callback(data.message);
				}
			}
		});
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.UserName = regInfo.UserName || '';
		regInfo.NickName = regInfo.NickName || '';
		regInfo.Password = regInfo.Password || '';

		if(!checkPhone(regInfo.UserName)) {
			return callback('手机号码不合法');
		}
		if(regInfo.NickName.length < 1) {
			return callback('昵称最短需要 1 个字符');
		}
		if(regInfo.NickName.length > 12) {
			return callback('昵称最长限制 12 个字符');
		}
		if(regInfo.Password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		if(regInfo.Password.length > 16) {
			return callback('密码最长限制 16 个字符');
		}

		HttpGet(base.RootUrl + "User/Register", {
			UserName: loginInfo.UserName,
			Password: loginInfo.Password
		}, function(data) {
			if(data == null) {
				return callback("系统异常,请稍后再试~");
			} else {
				if(data.result) {
					//更新用户缓存信息
					data = data.message;
					var info = {
						ID: data.ID,
						UserName: regInfo.UserName,
						Password: regInfo.Password,
						Avatar: data.Avatar,
						NickName: data.NickName,
						Address: "",
						Birthday: ""
					}
					localStorage.setItem('$userinfo', JSON.stringify(info));
					return callback();
				} else {
					return callback(data.message);
				}
			}
		});
	};

	/**
	 * 退出登录
	 **/
	owner.loginOut = function() {
		var userinfo = {};
		localStorage.setItem('$userinfo', JSON.stringify(userinfo));
	};

	/**
	 * 邮箱校验
	 **/
	var checkEmail = function(email) {
		email = email || '';
		if(email == '')
			return false;
		return email.length > 3 && email.indexOf('@') > -1;
	};

	/**
	 * 手机号码校验
	 **/
	var checkPhone = function(phone) {
		phone = phone || '';
		if(phone == '')
			return false;
		return phone.length == 11 && !isNaN(phone) && phone.toString().indexOf("1") == 0;
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if(!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	/**
	 * 获取本地是否安装客户端
	 **/
	owner.isInstalled = function(id) {
		if(id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if(mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch(e) {}
		} else {
			switch(id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));
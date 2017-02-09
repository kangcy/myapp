(function($, owner) {
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.Phone = loginInfo.Phone || '';
		loginInfo.Password = loginInfo.Password || '';
		if(loginInfo.Phone.length < 5) {
			return callback('账号最短为 5 个字符');
		}
		if(loginInfo.Password.length < 6 || loginInfo.Password.length > 16) {
			return callback('密码为6-16个字符');
		}

		//登录验证
		HttpGet(base.RootUrl + "User/Login", {
			Phone: loginInfo.Phone,
			Password: loginInfo.Password,
			Province: loginInfo.Province,
			City: loginInfo.City
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
						Password: data.Password,
						Avatar: data.Avatar == "" ? base.DefaultImg : data.Avatar,
						NickName: data.NickName,
						Address: data.Address,
						Birthday: data.BirthdayText,
						Follows: data.Follows,
						Fans: data.Fans,
						Articles: data.Articles,
						Keeps: data.Keeps,
						Comments: data.Comments,
						Zans: data.Zans,
						Cover: data.Cover,
						FanText: data.FanText,
						KeepText: data.KeepText,
						BlackText: data.BlackText,
						Phone: data.Phone,
						Weixin: data.Weixin,
						QQ: data.QQ,
						Weibo: data.Weibo,
						ShareNick: data.ShareNick,
						AutoMusic: data.AutoMusic,
						IsPay: data.IsPay,
						Money: data.Money,
						UseDraw: data.UseDraw,
						Number: data.Number,
						ShowArticle: data.ShowArticle,
						ShowFollow: data.ShowFollow,
						ShowFan: data.ShowFan
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
	 * 用户第三方登录
	 **/
	owner.loginThird = function(loginInfo, callback) {
		callback = callback || $.noop;

		HttpGet(base.RootUrl + "User/LoginThird", {
			NickName: loginInfo.NickName,
			Avatar: loginInfo.Avatar,
			Sex: loginInfo.Sex,
			OpenID: loginInfo.OpenID,
			Cover: "",
			Province: loginInfo.Province,
			City: loginInfo.City,
			Source: loginInfo.Source
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
						Password: data.Password,
						Avatar: data.Avatar == "" ? base.DefaultImg : data.Avatar,
						NickName: data.NickName,
						Address: data.Address,
						Birthday: data.BirthdayText,
						Follows: data.Follows,
						Fans: data.Fans,
						Articles: data.Articles,
						Keeps: data.Keeps,
						Comments: data.Comments,
						Zans: data.Zans,
						Cover: data.Cover,
						FanText: data.FanText,
						KeepText: data.KeepText,
						BlackText: data.BlackText,
						Phone: data.Phone,
						Weixin: data.Weixin,
						QQ: data.QQ,
						Weibo: data.Weibo,
						ShareNick: data.ShareNick,
						AutoMusic: data.AutoMusic,
						IsPay: data.IsPay,
						Money: data.Money,
						UseDraw: data.UseDraw,
						Number: data.Number,
						ShowArticle: data.ShowArticle,
						ShowFollow: data.ShowFollow,
						ShowFan: data.ShowFan
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
		regInfo.Phone = regInfo.Phone || '';
		regInfo.NickName = regInfo.NickName || '';
		regInfo.Password = regInfo.Password || '';
		HttpGet(base.RootUrl + "User/Register", {
			Phone: regInfo.Phone,
			Password: regInfo.Password,
			NickName: regInfo.NickName,
			Province: regInfo.Province,
			City: regInfo.City,
			Cover: ""
		}, function(data) {
			if(data == null) {
				return callback("系统异常,请稍后再试~");
			} else {
				if(data.result) {
					//更新用户缓存信息
					data = data.message;
					var info = {
						ID: data.ID,
						Password: data.Password,
						Avatar: data.Avatar,
						NickName: data.NickName,
						Address: "",
						Birthday: "0001-01-01",
						Sex: "男",
						Signature: "",
						Follows: 0,
						Fans: 0,
						Articles: 0,
						Keeps: 0,
						Comments: 0,
						Zans: 0,
						Cover: data.Cover,
						FanText: data.FanText,
						KeepText: data.KeepText,
						BlackText: data.BlackText,
						Phone: data.Phone,
						Weixin: data.Weixin,
						QQ: data.QQ,
						Weibo: data.Weibo,
						ShareNick: data.ShareNick,
						AutoMusic: data.AutoMusic,
						IsPay: data.IsPay,
						Money: data.Money,
						UseDraw: data.UseDraw,
						Number: data.Number,
						ShowArticle: data.ShowArticle,
						ShowFollow: data.ShowFollow,
						ShowFan: data.ShowFan
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
		return phone.length == 11 && !isNaN(phone) && (/^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/.test(phone));
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
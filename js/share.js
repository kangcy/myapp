var shares = null; //分享服务
var shareImageUrl = ''; //分享图片地址

//更新分享服务
function updateSerivces() {
	plus.share.getServices(function(s) {
		shares = {};
		for(var i in s) {
			var t = s[i];
			shares[t.id] = t;
		}
		console.log("获取分享服务列表成功");
	}, function(e) {
		console.log("获取分享服务列表失败：" + e.message);
	});
}

//分享弹窗
function Share(index) {
	if(index == 0) {
		$("#mysharebg").addClass("hide");
		$("#myshare").slideUp();
	}else{
		$("#mysharebg").removeClass("hide");
		$("#myshare").slideDown();
	}
}

//分享信息
function ShareAction(index) {
	var id = "";
	var ex = "";
	switch(index) {
		//朋友圈
		case 1:
			id = "weixin";
			ex = "WXSceneSession";
			break;
			//微信
		case 2:
			id = "weixin";
			ex = "WXSceneTimeline";
			break;
			//新浪微博
		case 3:
			id = "sinaweibo";
			ex = "";
			break;
			//qq
		case 4:
			id = "qq";
			ex = "";
			break;
			//qq空间
		case 5:
			id = "";
			ex = "";
			break;
			//其他
		case 6:
			id = "";
			ex = "";
			break;
			//复制链接
		case 7:
			id = "";
			ex = "";
			break;
			//收藏
		case 8:
			id = "";
			ex = "";
			break;
			//举报
		case 9:
			id = "";
			ex = "";
			break;
		default:
			break;
	}
	var s = null;
	if(!id || !(s = shares[id])) {
		console.log("无效的分享服务！");
		return;
	}
	if(s.authenticated) {
		shareMessage(s, ex);
	} else {
		mui.toast("未授权");
		s.authorize(function() {
			shareMessage(s, ex);
		}, function(e) {
			mui.toast("认证授权失败");
		});
	}
}
//发送分享信息
function shareMessage(s, ex) {
	var msg = {
		content: '分享-详情',
		href: 'http://blog.csdn.net/zhuming3834',
		title: '标题',
		content: '内容',
		thumbs: ['http://img3.3lian.com/2013/v10/4/87.jpg'],
		pictures: ['http://img3.3lian.com/2013/v10/4/87.jpg'],
		extra: {
			scene: ex
		}
	};
	s.send(msg, function() {
		mui.toast("分享成功!");
	}, function(e) {
		mui.toast("分享失败!");
	});
}
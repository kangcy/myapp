var channel = {}; //支付渠道
var payway = 0; //支付方式

//发起支付
function Payment() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	var money = $("#txtmoney").val();
	if(isNaN(money)) {
		base.CloseWaiting();
		isLoading = false;
		plus.nativeUI.alert("输入金额格式不正确", null, "");
		return;
	}
	if(money < 0) {
		base.CloseWaiting();
		isLoading = false;
		plus.nativeUI.alert("输入金额格式不正确", null, "");
		return;
	}

	base.ShowWaiting("支付请求中");
	var id = payway == 0 ? "alipay" : "wxpay";
	var ALIPAYSERVER = base.RootUrl + 'Notify/AddWxOrder?UserNumber=' + userinfo.Number + "&Money=" + money + "&Anony=" + (anony ? 1 : 0) + "&ArticleNumber=" + ArticleNumber + "&ArticleUserNumber=" + ArticleUserNumber;
	var WXPAYSERVER = base.RootUrl + 'Notify/AddWxOrder?UserNumber=' + userinfo.Number + "&Money=" + money + "&Anony=" + (anony ? 1 : 0) + "&ArticleNumber=" + ArticleNumber + "&ArticleUserNumber=" + ArticleUserNumber;

	// 从服务器请求支付订单
	var PAYSERVER = '';
	if(id == 'alipay') {
		PAYSERVER = ALIPAYSERVER;
	} else if(id == 'wxpay') {
		PAYSERVER = WXPAYSERVER;
	} else {
		isLoading = false;
		base.CloseWaiting();
		plus.nativeUI.alert("不支持此支付通道！", null, "");
		return;
	}
	mui.get(PAYSERVER, {}, function(data) {
		base.CloseWaiting();
		//console.log(JSON.stringify(data));
		var model = data;
		if(base.IsNullOrEmpty(model)) {
			isLoading = false;
			plus.nativeUI.alert("请求订单失败");
			return false;
		}
		var obj = {
			"retcode": 0,
			"retmsg": "ok",
			"appid": model.appid,
			"noncestr": model.noncestr,
			"package": model.package,
			"partnerid": model.partnerid,
			"prepayid": model.prepayid,
			"timestamp": model.timestamp,
			"sign": model.sign
		}
		plus.payment.request(channel[id], obj, function(result) {
			plus.nativeUI.alert("支付成功", function() {
				mui.back();
			});
		}, function(error) {
			//console.log(JSON.stringify(error));
			plus.nativeUI.alert("一毛一分都是情  打赏一下都不行？");
		});
		isLoading = false;
	}, "json");
}

//支付弹窗
function PayTan(index) {
	if(index == 0) {
		$("#mypaybg,#mypay").addClass("hide");
	} else {
		$("#mypaybg,#mypay").removeClass("hide");
	}
}

//更换支付金额
function ChangePayMoney(index) {
	if(index == 0) {
		$("#mypaybg,#mypay").addClass("hide");
	} else {
		$("#mypaybg,#mypay").removeClass("hide");
	}
}

//更换支付方式
function ChangePayWay(index) {
	payway = index;
	if(index == 0) {
		$("#weixin").removeClass("curr");
		$("#alipay").addClass("curr");
	} else {
		$("#alipay").removeClass("curr");
		$("#weixin").addClass("curr");
	}
}
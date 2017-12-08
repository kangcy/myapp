var channel = {}; //支付渠道
var payway = 1; //支付方式

//发起支付
function Payment() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	var money = $("#txtmoney").val().trim();
	if(base.IsNullOrEmpty(money) || isNaN(money)) {
		isLoading = false;
		return mui.toast("红包金额格式错误");
	}
	if(money <= 0) {
		isLoading = false;
		return mui.toast("红包金额格式错误");
	}
	if(/^\d+(\.\d{1,2})?$/.test(money)) {
		money = money * 100;
	} else {
		isLoading = false;
		return mui.toast("红包金额格式错误");
	}
	if(payway == 0) {
		isLoading = false;
		return mui.toast("暂不支持支付宝，请使用微信支付");
		return;
	}
	mask.show();
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
		mask.close();
		base.CloseWaiting();
		plus.nativeUI.alert("不支持此支付通道！", null, "");
		return;
	}
	mui.get(PAYSERVER, {}, function(data) {
		var model = data;
		if(base.IsNullOrEmpty(model)) {
			isLoading = false;
			mask.close();
			plus.nativeUI.alert("请求订单失败！", null, "");
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
		mask.close();
		plus.payment.request(channel[id], obj, function(result) {
			mask.show();
			base.Get("success").classList.remove("hide");
		}, function(error) {
			mask.show();
			base.Get("error").classList.remove("hide");
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
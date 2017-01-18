var channel = {}; //支付渠道
var payway = 0; //支付方式

//发起支付
function Payment() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	var id = payway == 0 ? "alipay" : "wxpay";
	var ALIPAYSERVER = base.RootUrl + 'Notify/AddWxOrder?UserID=' + userinfo.ID;
	var WXPAYSERVER = base.RootUrl + 'Notify/AddWxOrder?UserID=' + userinfo.ID;

	// 从服务器请求支付订单
	var PAYSERVER = '';
	if(id == 'alipay') {
		PAYSERVER = ALIPAYSERVER;
	} else if(id == 'wxpay') {
		PAYSERVER = WXPAYSERVER;
	} else {
		isLoading = false;
		plus.nativeUI.alert("不支持此支付通道！", null, "捐赠");
		return;
	}
	mui.get(PAYSERVER, {}, function(data) {
		console.log(JSON.stringify(data));
		var model = data;
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
			plus.nativeUI.alert("支付成功！", function() {
				back();
			});
		}, function(error) {
			console.log(JSON.stringify(error));
			alert(JSON.stringify(error));
			plus.nativeUI.alert("支付失败：" + error.code);
		});
		isLoading = false;
	}, "json");
}

//支付弹窗
function PayTan(index) {
	if(index == 0) {
		$("#mypaybg,#mypay").addClass("hide");
	} else {

		//base.OpenWindow("payment", "../page/payment.html", {});

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
function ChangePayWay(index, type) {
	payway = type;
	if(index == 0) {
		$("#payway").addClass("hide");
		if(type == 0) {
			$("#paybyalipay").removeClass("hide");
		} else {
			$("#paybyweixin").removeClass("hide");
		}
	} else {
		$("#paybyalipay,#paybyweixin").addClass("hide");
		$("#payway").removeClass("hide");
	}
}
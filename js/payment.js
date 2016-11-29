var wxChannel = null; //微信支付
var aliChannel = null; //支付宝支付
var channel = null; //支付渠道
var payway = 0; //支付方式

//发起支付
function Payment() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	var id = payway == 0 ? "alipay" : "wxpay";

	var ALIPAYSERVER = 'http://demo.dcloud.net.cn/helloh5/payment/alipay.php?total=';
	var WXPAYSERVER = 'http://demo.dcloud.net.cn/helloh5/payment/wxpay.php?total=';

	// 从服务器请求支付订单
	var PAYSERVER = '';
	if(id == 'alipay') {
		PAYSERVER = ALIPAYSERVER; 
		channel = aliChannel;
	} else if(id == 'wxpay') {
		PAYSERVER = WXPAYSERVER;
		channel = wxChannel;
	} else {
		isLoading = false;
		plus.nativeUI.alert("不支持此支付通道！", null, "捐赠");
		return;
	}
	mui.get(PAYSERVER, {}, function(data) {
		alert(data);
		//console.log(data);
		plus.payment.request(channel, data, function(result) {
			plus.nativeUI.alert("支付成功！", function() {
				back();
			});
		}, function(error) {
			plus.nativeUI.alert("支付失败：" + error.code);
		});
		isLoading = false;
	}, "text");

	/*var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		switch(xhr.readyState) {
			case 4:
				if(xhr.status == 200) {
					plus.payment.request(channel, xhr.responseText, function(result) {
						plus.nativeUI.alert("支付成功！", function() {
							back();
						});
					}, function(error) {
						plus.nativeUI.alert("支付失败：" + error.code);
					});
				} else {
					alert("获取订单信息失败！");
				}
				break;
			default:
				break;
		}
		isLoading = false;
	}
	xhr.open('GET', PAYSERVER);
	xhr.send();*/
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
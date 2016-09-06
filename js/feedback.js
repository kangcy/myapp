(function(mui, window, document, undefined) {
	mui.init();
	var get = function(id) {
		return document.getElementById(id);
	};
	var ui = {
		question: get('question'),
		submit: get('submit')
	};
	ui.clearForm = function() {
		ui.question.value = '';
	};
	ui.submit.addEventListener('tap', function(event) {
		if (ui.question.value == '') {
			return mui.toast('请填写反馈信息');
		} 
		plus.nativeUI.showWaiting();
		feedback.send({
			question: ui.question.value
		}, function() {
			plus.nativeUI.closeWaiting();
			mui.toast('感谢您的建议~');
			ui.clearForm();
			mui.back();
		});
	}, false);
})(mui, window, document, undefined);
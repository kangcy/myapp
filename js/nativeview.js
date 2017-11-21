//创建原生View控件 
var bgview = null;
var customview = null;

function CreatePicView() {

	//绘制背景
	bgview = new plus.nativeObj.View('bgview', {
		top: '0px',
		left: '0px',
		height: '100%',
		width: '100%',
		backgroundColor: 'rgba(0,0,0,0.5)'
	});

	//绘制底部区域
	customview = new plus.nativeObj.View('customview', {
		left: '0px',
		bottom: '0px',
		width: '100%',
		height: '200px',
		backgroundColor: '#fff'
	});

	//绘制底部边线
	customview.draw([{
			tag: 'rect',
			id: 'line1',
			color: '#f5f5f5',
			position: {
				bottom: '50px',
				left: '0px',
				width: '100%',
				height: '1px'
			}
		},
		{
			tag: 'rect',
			id: 'line2',
			color: '#f5f5f5',
			position: {
				bottom: '100px',
				left: '0px',
				width: '100%',
				height: '1px'
			}
		},
		{
			tag: 'rect',
			id: 'line3',
			color: '#f5f5f5',
			position: {
				bottom: '150px',
				left: '0px',
				width: '100%',
				height: '1px'
			}
		},
		{
			tag: 'font',
			id: 'font1',
			text: '拍照',
			textStyles: {
				size: '16px',
				color: '#000'
			},
			position: {
				bottom: '150px',
				height: '50px'
			}
		},
		{
			tag: 'font',
			id: 'font2',
			text: '从手机相册选择',
			textStyles: {
				size: '16px',
				color: '#000'
			},
			position: {
				bottom: '100px',
				height: '50px'
			}
		},
		{
			tag: 'font',
			id: 'font3',
			text: '从小微篇相册选择',
			textStyles: {
				size: '16px',
				color: '#000'
			},
			position: {
				bottom: '50px',
				height: '50px'
			}
		},
		{
			tag: 'font',
			id: 'font4',
			text: '取消',
			textStyles: {
				size: '16px',
				color: '#ff0000'
			},
			position: {
				bottom: '0px',
				height: '50px'
			}
		}
	]);

	bgview.interceptTouchEvent(true);
	customview.interceptTouchEvent(true);

	//关闭
	bgview.addEventListener("click", function(e) {
		console.log('aa');
		HideView();
	}, false);
	customview.addEventListener("click", function(e) {
		//相对容器位置
		var y = e.clientY;
		if(y <= 50) {
			//拍照
			Camera();
		} else if(y > 50 && y <= 100) {
			//从手机相册选择
			Gallery();
		} else if(y > 100 && y <= 150) {
			//从小微篇相册选择
			Pic();
		}
		//取消
		HideView();
	}, false);
}

// 显示原生View控件
function ShowView() {
	//bgview.show(); 
	//customview.show();

	plus.nativeObj.View.startAnimation({
		type: 'pop-in'
	}, customview, bgview, function() {
		console.log('plus.nativeObj.View.startAnimation动画结束');
		// 关闭原生动画
		bgview.show();
		customview.show();
		//plus.nativeObj.View.clearAnimation();
	});
} 
// 隐藏原生View控件
function HideView() {
	customview.hide();
	bgview.hide();
}
// 查看View控件的显示状态
function VisibleView() {
	var visible = customview.isVisible();
	console.log('View控件状态:' + visible);
}
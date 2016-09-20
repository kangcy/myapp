//拍照  
function getImage() {
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			var localurl = entry.toLocalURL();

			//压缩图片
			var dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片路径

			//压缩图片,并重命名
			compressImage(localurl, dstname, function(src) {
				$("#readyimg").attr("src", src);
				cutImg();
			});
		});
	});
}

//相册选取  
function galleryImgs() {
	plus.gallery.pick(function(e) {
		//压缩图片
		var dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片路径

		//压缩图片,并重命名
		compressImage(e, dstname, function(src) {
			$("#readyimg").attr("src", src);
			cutImg();
		});
	}, function(e) {
		//outSet( "取消选择图片" ) 
	}, {
		filter: "image"
	});
}

//照片裁剪类  
function cutImg() {
	$(".mui-content,.header,.footer").hide();
	$("#cropperEdit").show();
	$("#readyimg").cropper({
		checkImageOrigin: true,
		aspectRatio: 1 / 1,
		autoCropArea: 0.3,
		zoom: -0.2
	});
}

//右旋转90度  
function rotateimgright() {
	$("#readyimg").cropper('rotate', 90);
}

//左旋转90度
function rotateimgleft() {
	$("#readyimg").cropper('rotate', -90);
}

//关闭裁剪窗口
function closepop() {
	$("#cropperEdit").hide();
	$("#readyimg").cropper('destroy');
	$(".mui-content,.header,.footer").show();
}

//确认照片，展示效果  
function confirm(targetid) {
	$("#cropperEdit").hide();
	var dataURL = $("#readyimg").cropper("getCroppedCanvas");
	var imgurl = dataURL.toDataURL("image/jpeg", 0.5);
	$("#" + targetid).attr("src", imgurl);
	$(".mui-content,.header,.footer").show();
	$("#readyimg").cropper('destroy');
}

//压缩图片(src：压缩前原始路径,dstname：压缩后保存路径) 
function compressImage(src, newsrc, callback) {
	plus.zip.compressImage({
			src: src,
			dst: newsrc,
			overwrite: true,
			width: window.innerWidth + "px",
			quality: 100
		},
		function(event) {
			//console.log(JSON.stringify(event));
			if($.isFunction(callback)) {
				callback(event.target);
			}
		},
		function(error) {
			if($.isFunction(callback)) {
				callback(src);
			}
		});
}

//选择图片
function showActionSheet() {
	var bts = [{
		title: "拍照"
	}, {
		title: "从相册选择"
	}];
	plus.nativeUI.actionSheet({
			cancel: "取消",
			buttons: bts
		},
		function(e) {
			if(e.index == 1) {
				getImage();
			} else if(e.index == 2) {
				galleryImgs();
			}
		}
	);
}
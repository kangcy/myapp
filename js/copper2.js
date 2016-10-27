var iscutimging = false;

//拍照
function getImage(long, width) {
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			closepop(); //关闭裁剪
			var localurl = entry.toLocalURL();

			//压缩图片
			var dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片路径

			//压缩图片,并重命名
			compressImage(localurl, dstname, function(src) {
				$("#readyimg").attr("src", src);
				//cutImg(long, width, function() {});
			});
		});
	});
}

//相册选取  
function galleryImgs(long, width, callback) {

	plus.gallery.pick(function(e) {
		closepop(); //关闭裁剪

		//压缩图片 
		var dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片路径

		//压缩图片,并重命名
		compressImage(e, dstname, function(src) {
			$("#readyimg").hide().attr("src", src).load(function() {
				var totalheight = window.innerHeight - 90;
				var imagewidth = $("#readyimg").width();
				var imageheight = $("#readyimg").height();
				if(totalheight > imageheight) {
					$("#readyimg").css("margin-top", (totalheight - imageheight) / 2 + "px").show();
				} else {
					$("#readyimg").css({
						"width": "auto",
						"height": totalheight + "px",
						"margin": "0px"
					});
				}
			}).show();
		});
	}, function(e) {
		//outSet( "取消选择图片" ) 
		if($.isFunction(callback)) {
			callback();
		}
	}, {
		filter: "image",
		maximum: 1
	});
}

//照片裁剪类  
function cutImg(long, width, callback) {
	if(long > 0 && width > 0) {
		$("#readyimg").cropper({
			checkImageOrigin: true,
			aspectRatio: long / width,
			autoCropArea: 0.3,
			zoom: -0.2,
			built: function() {
				callback()
			}
		});
	} else {
		$("#readyimg").cropper({
			checkImageOrigin: true,
			autoCropArea: 0.3,
			zoom: -0.2,
			built: function() {
				callback()
			}
		});
	}
	iscutimging = true;
}

//右旋转90度  
function rotateimgright() {
	if(iscutimging) {
		$("#readyimg").cropper('rotate', 90);
	} else {
		cutImg(0, 0, function() {
			$("#readyimg").cropper('rotate', 90);
		});
	}
}

//左旋转90度
function rotateimgleft() {
	if(iscutimging) {
		$("#readyimg").cropper('rotate', -90);
	} else {
		cutImg(0, 0, function() {
			$("#readyimg").cropper('rotate', -90);
		});
	}
}

//打开裁剪窗口
function openpop() {
	cutImg(0, 0, function() {

	})
}

//关闭裁剪窗口
function closepop() {
	$("#readyimg").cropper('destroy');
	iscutimging = false;
}

//确认照片，展示效果  
function confirm(callback) {
	var imgurl = $("#readyimg").attr("src");

	if(iscutimging) {
		var dataURL = $("#readyimg").cropper("getCroppedCanvas");
		imgurl = dataURL.toDataURL("image/jpeg", 1);
		Upload(imgurl,callback);
	} else {
		if(imgurl.toLowerCase().indexOf("http") > -1) {
			if($.isFunction(callback)) {
				callback(imgurl);
			}
			return;
		} else {
			var image = new Image();
			image.src = imgurl;
			image.onload = function() {
				var imgData = getBase64Image(image);
				Upload(imgData,callback);
			}
		}
	}
}

//请求上传图片
function Upload(imgurl,callback){
	//上传图片到服务器 
	plus.nativeUI.showWaiting("上传中...");
	mui.post(base.RootUrl + "Upload/Upload", {
		str: imgurl
	}, function(data) {
		if(data != null) {
			if(data.result) {
				if($.isFunction(callback)) {
					callback(base.RootUrl + data.message);
				}
				$("#readyimg").cropper('destroy');
				iscutimging = false;
				plus.nativeUI.closeWaiting();
			} else {
				plus.nativeUI.closeWaiting();
				mui.toast(data.message);
			}
		}
	}, "json");
}

//压缩图片(src：压缩前原始路径,dstname：压缩后保存路径) 
function compressImage(src, newsrc, callback) {
	plus.zip.compressImage({
			src: src,
			dst: newsrc,
			overwrite: true,
			width: window.innerWidth + "px",
			quality: 80
		},
		function(event) {
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
function showActionSheet(long, width, callback) {
	if(!long) {
		long = 1;
	}
	if(!width) {
		width = 1;
	}
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
				getImage(long, width);
			} else if(e.index == 2) {
				galleryImgs(long, width, callback);
			}
		}
	);
}

//将图片压缩转成base64 
function getBase64Image(img) {
	var canvas = document.createElement("canvas");
	var width = img.width;
	var height = img.height;
	/*if(width > height) {
		if(width > 100) {
			height = Math.round(height *= 100 / width);
			width = 100;
		}
	} else {
		if(height > 100) {
			width = Math.round(width *= 100 / height);
			height = 100;
		}
	}*/
	canvas.width = width; /*设置新的图片的宽度*/
	canvas.height = height; /*设置新的图片的长度*/
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, width, height); /*绘图*/
	return canvas.toDataURL("image/jpeg", 0.8);
}
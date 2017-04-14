var iscutimging = false;
var dstname = "";

//拍照
function Camera() {
	mui('#power').popover('hide');
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			closepop(); //关闭裁剪
			var localurl = entry.toLocalURL();

			//压缩图片
			dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片路径

			//压缩图片,并重命名
			compressImage(localurl, dstname, function(status, src) {
				if(status) {
					$("#readyimg").attr("src", src);
				}
			});
		});
	});
}

//相册选取  
function Gallery() {
	mui('#power').popover('hide');
	plus.gallery.pick(function(e) {
		closepop(); //关闭裁剪

		//压缩图片 
		dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片路径

		//压缩图片,并重命名
		compressImage(e.files[0], dstname, function(status, src) {
			if(status) {
				$("#readyimg").hide().attr("src", src).load(function() {
					var imagewidth = $("#readyimg").width();
					var imageheight = $("#readyimg").height();

					if(totalheight > imageheight) {
						$("#readyimg").css("margin-top", (totalheight - imageheight) / 2 + "px");
					} else if(totalwidth > imagewidth) {
						$("#readyimg").css("margin-left", (totalwidth - imagewidth) / 2 + "px");
					} else {
						$("#readyimg").css({
							"width": "auto",
							"height": "auto"
						});
					}
					$("#readyimg").show();
				});
			}
		});
	}, function(e) {
		//outSet( "取消选择图片" ) 
	}, {
		filter: "image",
		maximum: 1,
		multiple: true,
		system: false
	});
}

//微篇相册
function Pic() {
	mui('#power').popover('hide');
	base.OpenWindow("mypic", "mypic.html", {});
}

//照片裁剪类  
function cutImg(callback) {
	base.Get("openpop").style.display = "none";
	base.Get("closepop").style.display = "inline-block";
	/*if(long > 0 && width > 0) {
		$("#readyimg").cropper({
			checkImageOrigin: true,
			aspectRatio: long / width,
			autoCropArea: 0.3,
			zoom: -0.2,
			build: function() {
				callback();
				iscutimging = true;
			}
		});
	}*/
		$("#readyimg").cropper({
			checkImageOrigin: true,
			autoCropArea: 0.3,
			zoom: -0.2,
			build: function() {
				callback();
				iscutimging = true;
			}
		});
}

//右旋转90度  
function rotateimgright() {
	if(base.IsNullOrEmpty(dstname)) {
		dstname = $("#readyimg").attr("src");
	}
	if(dstname.toLowerCase().startsWith("http://")) {
		if(iscutimging) {
			$("#readyimg").cropper('rotate', 90);
		} else {
			cutImg(function() {
				$("#readyimg").cropper('rotate', 90);
			});
		}
	} else {
		plus.zip.compressImage({
				src: dstname,
				dst: dstname,
				overwrite: true,
				rotate: 90 // 旋转90度
			},
			function(event) {
				dstname = event.target;
				$("#readyimg").attr("src", dstname + "?" + new Date().getTime());
			},
			function(error) {
				console.log("Compress error!");
			});
	}
}

//左旋转90度
function rotateimgleft() {
	if(iscutimging) {
		$("#readyimg").cropper('rotate', -90);
	} else {
		cutImg(function() {
			$("#readyimg").cropper('rotate', -90);
		});
	}
}

//打开裁剪窗口
function openpop() {
	cutImg(function() {

	})
}

//关闭裁剪窗口
function closepop() {
	base.Get("closepop").style.display = "none";
	base.Get("openpop").style.display = "inline-block";
	$("#readyimg").cropper('destroy');
	iscutimging = false;
}

//确认照片，展示效果  
function confirm(callback) {
	var imgurl = $("#readyimg").attr("src");
	if(base.IsNullOrEmpty(imgurl)) {
		if($.isFunction(callback)) {
			callback(imgurl);
		}
		return;
	}
	if(iscutimging) {
		mask.show();
		var dataURL = $("#readyimg").cropper("getCroppedCanvas");
		imgurl = dataURL.toDataURL("image/jpeg", 1);
		Upload(imgurl, callback);
	} else {
		if(imgurl.toLowerCase().indexOf("http") > -1) {
			if($.isFunction(callback)) {
				callback(imgurl);
			}
			return;
		} else {
			mask.show();
			var image = new Image();
			image.src = imgurl;
			image.onload = function() {
				var imgData = getBase64Image(image);
				Upload(imgData, callback);
			}
		}
	}
}

//请求上传图片
function Upload(imgurl, callback) {
	base.ShowWaiting("正在上传图片");
	HttpPost(base.RootUrl + "Upload/Upload", {
		str: imgurl,
		standard: Standard,
		Number: userinfo.Number
	}, function(data) {
		if(data != null) {
			if(data.result) {
				if($.isFunction(callback)) {
					callback(base.RootUrl + data.message);
				}
				base.Get("closepop").style.display = "none";
				base.Get("openpop").style.display = "inline-block";
				$("#readyimg").cropper('destroy');
				iscutimging = false;
			} else {
				mui.toast(data.message);
			}
			mask.close();
		}
	});
}

//压缩图片(src：压缩前原始路径,dstname：压缩后保存路径) 
function compressImage(src, newsrc, callback) {
	plus.zip.compressImage({
			src: src,
			dst: newsrc,
			overwrite: true,
			width: "640px",
			quality: 100
		},
		function(event) {
			if($.isFunction(callback)) {
				callback(true, event.target);
			}
		},
		function(error) {
			if($.isFunction(callback)) {
				mui.toast(error.message);
				callback(false, src);
			}
		});
}

//我的相册选择图片回调
function ConfirmImg(src) {
	var $readyimg = $("#readyimg");
	$readyimg.hide().attr("src", src).load(function() {
		var imagewidth = $readyimg.width();
		var imageheight = $readyimg.height();

		if(totalheight >= imageheight) {
			$readyimg.css("margin-top", (totalheight - imageheight) / 2 + "px");
		}
		if(totalwidth >= imagewidth) {
			$readyimg.css("margin-left", (totalwidth - imagewidth) / 2 + "px");
		}
		$readyimg.css({
			"max-width": totalwidth + "px",
			"max-height": totalheight + "px"
		});
		$readyimg.show();
	});
}

//将图片压缩转成base64 
function getBase64Image(img) {
	var canvas = document.createElement("canvas");
	var width = img.width;
	var height = img.height;
	canvas.width = width; /*设置新的图片的宽度*/
	canvas.height = height; /*设置新的图片的长度*/
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, width, height); /*绘图*/
	return canvas.toDataURL("image/jpeg", 1);
}
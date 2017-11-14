var iscutimging = false;
var dstname = "";

function InitImg(src) {
	$image.attr("src", src);
	var imagewidth = $image.width();
	var imageheight = $image.height();
	$image.css({
		"width": "auto",
		"height": "auto",
		"margin-top": "0px",
		"margin-left": "0px"
	});
	if(totalheight >= imageheight) {
		$image.css("margin-top", (totalheight - imageheight) / 2 + "px");
	}
	//用户封面、用户头像
	if(Standard == "UserCover" || Standard == "UserAvatar") {
		openpop();
	} else {
		$image.show();
		base.Get("openpop").style.display = "inline-block";
		mask.close();
	}
}

//拍照
function Camera() {
	mui('#upload').popover('hide');
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
					$image.attr("src", src);
				}
			});
		});
	});
}

//相册选取  
function Gallery() {
	mui('#upload').popover('hide');
	plus.gallery.pick(function(e) {
		closepop(); //关闭裁剪

		//压缩图片 
		dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片路径

		//压缩图片,并重命名
		compressImage(e.files[0], dstname, function(status, src) {
			if(status) {
				var img = new Image();
				img.src = src;
				if(img.complete) {
					InitImg(img.src);
				} else {
					img.onload = function() {
						InitImg(img.src);
					};
				}
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
	mui('#upload').popover('hide');
	base.OpenWindow("mypic", "mypic.html", {});
	//base.ShowTemplate("mypic", "mypic.html", "我的相册", "");
}

//照片裁剪类  
function cutImg(callback) {
	if(!iscutimging) {
		iscutimging = true;
		base.Get("rotateimgright").style.display = "none";
		base.Get("openpop").style.display = "none";
		base.Get("closepop").style.display = "none";

		//用户封面、用户头像
		if(Standard == "UserCover" || Standard == "UserAvatar") {
			var ratio = 1 / 1;
			switch(Standard) {
				case "UserCover":
					ratio = 4 / 3;
					break;
				case "UserAvatar":
					ratio = 1 / 1;
					break;
				default:
					break;
			}
			$image.cropper({
				checkImageOrigin: true,
				aspectRatio: ratio, //裁剪比例
				autoCropArea: 1, //裁剪框大小
				toggleDragModeOnDblclick: false,
				dragCrop: false, //是否允许移除当前的剪裁框，并通过拖动来新建一个剪裁框区域
				zoomable: true, //是否允许放大缩小图片
				movable: false, //是否允许移动剪裁框
				resizable: false, //是否允许改变裁剪框大小
				built: function() {
					callback();
					$image.show();
					base.Get("rotateimgright").style.display = "inline-block";
				}
			});
		} else {
			$image.cropper({
				checkImageOrigin: true,
				autoCropArea: 0.6, //裁剪框大小
				toggleDragModeOnDblclick: false,
				dragCrop: false, //是否允许移除当前的剪裁框，并通过拖动来新建一个剪裁框区域
				zoomable: true, //是否允许放大缩小图片
				movable: true, //是否允许移动剪裁框
				resizable: true, //是否允许改变裁剪框大小
				built: function() {
					callback();
					$image.show();
					base.Get("rotateimgright").style.display = "inline-block";
					base.Get("closepop").style.display = "inline-block";
				}
			});
		}
	}
}

//右旋转90度  
function rotateimgright() {
	if(base.IsNullOrEmpty(dstname)) {
		dstname = $image.attr("src");
	}
	if(dstname.toLowerCase().startsWith("http://")) {
		if(iscutimging) {
			$image.cropper('rotate', 90);
		} else {
			cutImg(function() {
				$image.cropper('rotate', 90);
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
				$image.cropper('rotate', 90);
				//$image.attr("src", dstname + "?" + new Date().getTime());
			},
			function(error) {
				console.log("Compress error!");
			});
	}
}

//左旋转90度
function rotateimgleft() {
	if(iscutimging) {
		$image.cropper('rotate', -90);
	} else {
		cutImg(function() {
			$image.cropper('rotate', -90);
		});
	}
}

//打开裁剪窗口
function openpop() {
	cutImg(function() {
		mask.close();
	})
}

//关闭裁剪窗口
function closepop() {
	base.Get("rotateimgright").style.display = "none";
	base.Get("closepop").style.display = "none";
	base.Get("openpop").style.display = "inline-block";
	$image.cropper('destroy');
	iscutimging = false;
}

//确认照片，展示效果  
function confirm(callback) {
	var imgurl = $image.attr("src");
	if(base.IsNullOrEmpty(imgurl)) {
		if($.isFunction(callback)) {
			callback(imgurl);
		}
		return;
	}
	if(iscutimging) {
		mask.show();
		var dataURL = $image.cropper("getCroppedCanvas");
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
	HttpPost(base.UploadUrl + "Upload/Upload", {
		str: imgurl,
		standard: Standard,
		Number: userinfo.Number
	}, function(data) {
		if(data != null) {
			if(data.result) {
				if(callback) {
					//callback(base.UploadUrl + data.message);
					callback(data.message);
				}
				base.Get("closepop").style.display = "none";
				base.Get("openpop").style.display = "inline-block";
				$image.cropper('destroy');
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
			quality: 90,
			width: "500px",
			format: "jpg"
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
	$image.hide().attr("src", src).load(function() {
		var imagewidth = $readyimg.width();
		var imageheight = $readyimg.height();

		if(totalheight >= imageheight) {
			$image.css("margin-top", (totalheight - imageheight) / 2 + "px");
		}
		if(totalwidth >= imagewidth) {
			$image.css("margin-left", (totalwidth - imagewidth) / 2 + "px");
		}
		$image.css({
			"max-width": totalwidth + "px",
			"max-height": totalheight + "px"
		});
		$image.cropper('replace', src)
		$image.show();
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
//相册选取
var length = 0;
var files = [];
var compressIndex = 0; //当前压缩图片索引
var compressTotal = 0; //需要压缩图片个数
var currUploadImg = [];

//选择图片
function ShowActionSheet() {
	var bts = [{
		title: "拍照"
	}, {
		title: "从手机相册选择"
	}, {
		title: "从微篇相册选择"
	}];
	plus.nativeUI.actionSheet({
			cancel: "取消",
			buttons: bts
		},
		function(e) {
			//相册选取
			length = 0;
			files = [];
			compressIndex = 0; //当前压缩图片索引
			compressTotal = 0; //需要压缩图片个数
			currUploadImg = [];
			if(e.index == 1) {
				Camera();
			} else if(e.index == 2) {
				Gallery();
			} else if(e.index == 3) {
				Pic();
			}
		}
	);
}

//拍照
function Camera() {
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			var localurl = entry.toLocalURL();
			compressIndex = 0;
			compressTotal = 1;
			length = 1;

			ShowMask(true, false, PageName);
			mask.show();
			base.ShowWaiting("正在上传图片");

			compressImage(localurl);
		});
	});
}

//相册
function Gallery() {
	plus.gallery.pick(function(e) {
		files = e.files;
		length = e.files.length;
		compressTotal = length;

		ShowMask(true, false, PageName);
		mask.show();
		base.ShowWaiting("正在上传图片");

		compressImage(e.files[0]);
	}, function(e) {

	}, {
		filter: "image",
		multiple: true,
		maximum: 20,
		system: false
	});
}

//微篇相册
function Pic() {
	base.OpenWindow("mypic", "mypic.html", {
		Source: PageName,
		Multiple: 1
	});
}

//加载图片
function LoadImage(status, src, len, callback) {
	if(!status) {
		length = len - 1;
	}
	if(length <= 0) {
		ShowMask(false, false, PageName);
		mask.close();
		return;
	}
	if(status) {
		var image = new Image();
		image.src = src;
		if(image.complete) {
			var imgData = getBase64Image(image);
			Upload(imgData, callback);
		} else {
			image.onload = function() {
				var imgData = getBase64Image(image);
				Upload(imgData, callback);
			}
		};
	}
}

//压缩图片(src：压缩前原始路径,dstname：压缩后保存路径) 
function compressImage(src) {
	var newsrc = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片路径
	plus.zip.compressImage({
			src: src,
			dst: newsrc,
			overwrite: true,
			width: "640px",
			quality: 100
		},
		function(event) {
			LoadImage(true, event.target, length, function() {
				compressIndex += 1;
				if(compressIndex < compressTotal) {
					compressImage(files[compressIndex]);
				}
			});
		},
		function(error) {
			LoadImage(false, src, length, function() {
				compressIndex += 1;
				if(compressIndex < compressTotal) {
					compressImage(files[compressIndex]);
				}
			});
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

//上传图片到服务器 
function Upload(imgurl, callback) {
	HttpPost(base.RootUrl + "Upload/Upload", {
		str: imgurl,
		Standard: "Article",
		Number: userinfo.Number
	}, function(data) {
		if(data != null) {
			if(data.result) {
				base.ShowWaiting("正在导入第" + (currUploadImg.length + 1) + "张图片...")
				if(base.IsNullOrEmpty(data.message)) {
					length = length - 1;
				} else {
					currUploadImg.push(base.RootUrl + data.message);
				}

				if(length <= 0) {
					ShowMask(false, false, PageName);
					mask.close();
					plus.nativeUI.alert("图片导入失败", null, "");
					return;
				}
				//图片上传完毕，创建文章
				if(currUploadImg.length >= length) {
					Import(currUploadImg.join(","));
				}
				if(callback) {
					callback();
				}
			}
		}
	});
}

//我的相册选择图片回调
function ConfirmImg(src) {
	if(base.IsNullOrEmpty(src)) {
		return false;
	}
	ShowMask(true, false, PageName);
	mask.show();
	base.ShowWaiting("正在上传图片");
	Import(src);
}

//创建文章
function Import(url) {
	var data = {
		ID: userinfo.ID,
		Cover: url,
		Title: "",
		Province: base.Province,
		City: base.City,
		District: base.District,
		Street: base.Street,
		DetailName: base.DetailName,
		CityCode: base.CityCode,
		Latitude: base.Latitude,
		Longitude: base.Longitude
	}
	HttpGet(base.RootUrl + "Article/Edit", data, function(data) {
		mui.later(function() {
			ShowMask(false, false, PageName);
			mask.close();
			if(data != null) {
				if(data.result) {
					base.OpenWindow("addarticle", "addarticle.html", {
						ArticleID: data.message.ID,
						ArticleNumber: data.message.Number,
						Source: "Add"
					});
				} else {
					mui.toast(data.message);
				}
			}
		}, 1000)
	});
}
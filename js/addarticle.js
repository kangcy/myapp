//相册选取
var length = 0;
var files = [];
var compressIndex = 0; //当前压缩图片索引
var compressTotal = 0; //需要压缩图片个数
var currUploadImg = [];

//拍照
function Camera() {
	mui('#upload').popover('hide');
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			var localurl = entry.toLocalURL();
			compressIndex = 0;
			compressTotal = 1;
			length = 1;

			mask.show();
			base.ShowWaiting("正在上传图片");

			compressImage(localurl);
		});
	});
}

//相册
function Gallery() {
	mui('#upload').popover('hide');
	plus.gallery.pick(function(e) {
		files = e.files;
		length = e.files.length;
		compressTotal = length;

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
	mui('#upload').popover('hide');
	var param = {
		Source: PageName,
		Multiple: 1
	}
	base.OpenWindow("mypic", "mypic.html", param);
}

//加载图片
function LoadImage(status, src, len, callback) {
	if(!status) {
		length = len - 1;
	}
	if(length <= 0) {
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
			width: "720px",
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
	mask.show();
	base.ShowWaiting("正在上传图片");
	Import(src);
}

//创建文章
function Import(url) {
	var position = base.GetCurrentPosition();
	var data = {
		ID: userinfo.ID,
		Cover: url,
		Title: "",
		Province: position.Province,
		City: position.City,
		District: position.District,
		Street: position.Street,
		DetailName: position.DetailName,
		CityCode: position.CityCode,
		Latitude: position.Latitude,
		Longitude: position.Longitude
	}
	HttpPost(base.RootUrl + "Article/Edit", data, function(data) {
		if(data != null) {
			if(data.result) {
				base.OpenWindow("addarticle", "addarticle.html", {
					ArticleID: data.message.ID,
					ArticleNumber: data.message.Number,
					Source: "Add"
				});
				mui.later(function() {
					mask.close();
				}, 1000);
			} else {
				mask.close();
				mui.toast(data.message);
			}
		} else {
			mask.close();
		}
	});
}
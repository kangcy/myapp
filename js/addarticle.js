/* "error:{\"code\":-4,\"message\":\"文件不存在\"}" at page/subindex.html:316
	 src:file:///storage/emulated/0/DidiScreenAd/httpsstatic.udache.comgulfstreamuploadrooster2017012414852244449565f3d30ef10fe32a1c5f6f98536cfab0cmaterial_1485224444960_1080_1920_400.jpg at page/subindex.html:270

	 "event:{\"target\":\"file:///storage/emulated/0/Android/data/io.dcloud.HBuilder/.HBuilder/downloads/1486525314259.jpg\",\"width\":393,\"height\":699,\"size\":48523}" at page/subindex.html:310
	 src:file:///storage/emulated/0/Android/data/io.dcloud.HBuilder/.HBuilder/downloads/1486525314259.jpg at page/subindex.html:270
	  */

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
			if(e.index == 1) {
				getImage();
			} else if(e.index == 2) {
				galleryImgs();
			} else if(e.index == 3) {
				base.OpenWindow("mypic", "mypic.html", {
					Source: "subindex"
				});
			}
		}
	);
}

//拍照
function getImage() {
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			var localurl = entry.toLocalURL();

			//压缩图片
			var dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片路径

			//压缩图片,并重命名
			compressIndex = 0;
			compressTotal = 1;
			compressImage(localurl);
		});
	});
}

//相册选取
var length = 0;
var files = [];
var compressIndex = 0; //当前压缩图片索引
var compressTotal = 0; //需要压缩图片个数
var currUploadImg = [];

function galleryImgs() {
	plus.gallery.pick(function(e) {
		files = e.files;
		length = e.files.length;
		compressTotal = length;
		base.ShowWaiting("正在同步文章内容");
		compressImage(e.files[0]);
	}, function(e) {

	}, {
		filter: "image",
		multiple: true,
		maximum: 20
	});
}

//加载图片
function LoadImage(status, src, len) {
	if(!status) {
		length = len - 1;
	}
	if(length <= 0) {
		base.CloseWaiting();
		return;
	}
	if(status) {
		var image = new Image();
		image.src = src;
		if(image.complete) {
			var imgData = getBase64Image(image);
			Upload(imgData, length);
		} else {
			image.onload = function() {
				var imgData = getBase64Image(image);
				Upload(imgData, length);
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
			width: window.innerWidth + "px",
			quality: 80
		},
		function(event) {
			LoadImage(true, event.target, length);
			compressIndex += 1;
			if(compressIndex < compressTotal) {
				compressImage(files[compressIndex]);
			}
		},
		function(error) {
			LoadImage(false, src, length);
			compressIndex += 1;
			if(compressIndex < compressTotal) {
				compressImage(files[compressIndex]);
			}
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
	return canvas.toDataURL("image/jpeg", 0.8);
}

//上传图片到服务器 
function Upload(imgurl) {
	mui.post(base.RootUrl + "Upload/Upload", {
		str: imgurl,
		Standard: "Article",
		Number: userinfo.Number
	}, function(data) {
		if(data != null) {
			if(data.result) {
				if(base.IsNullOrEmpty(data.message)) {
					length = length - 1;
				} else {
					currUploadImg.push(base.RootUrl + data.message);
				}
				if(length <= 0) {
					base.CloseWaiting();
					plus.nativeUI.alert("图片上传失败", null, "");
					return;
				}
				//图片上传完毕，创建文章
				if(currUploadImg.length == length) {
					//创建文章 
					var data = {
						ID: userinfo.ID,
						Cover: currUploadImg.join(","),
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
						base.CloseWaiting();
						currUploadImg = [];
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
					});
				}
			}
		}
	}, "json");
}

//我的相册选择图片回调
function ConfirmImg(src) {
	if(base.IsNullOrEmpty(src)) {
		return false;
	}
	base.ShowWaiting("正在同步文章内容");
	//创建文章 
	var data = {
		ID: userinfo.ID,
		Cover: src,
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
		setTimeout(function() {
			base.CloseWaiting();
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
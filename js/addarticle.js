//相册选取 
var currUploadImg = [];

function galleryImgs() {
	plus.gallery.pick(function(e) {
		var length = e.files.length;
		var index = 1;
		mask.show();
		base.ShowWaiting("正在同步文章内容");
		for(var i in e.files) {
			index += 1;
			//压缩图片 
			var dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片路径

			//压缩图片,并重命名 
			compressImage(e.files[i], dstname, function(status, src) {
				if(!status) {
					length = length - 1;
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
			});
		}
	}, function(e) {

	}, {
		filter: "image",
		multiple: true,
		maximum: 100
	});
}

//压缩图片(src：压缩前原始路径,dstname：压缩后保存路径) 
function compressImage(src, newsrc, callback) {
	plus.zip.compressImage({
			src: src,
			dst: newsrc,
			overwrite: true,
			width: window.innerWidth + "px",
			quality: 90
		},
		function(event) {
			callback(true, event.target);
		},
		function(error) {
			mui.toast(error.message);
			console.log(JSON.stringify("error:" + JSON.stringify(error)));
			callback(false, src);
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
	return canvas.toDataURL("image/jpeg", 0.9);
}

//上传图片到服务器 
function Upload(imgurl, length) {
	mui.post(base.RootUrl + "Upload/Upload", {
		str: imgurl,
		Standard: "Article",
		Number: userinfo.Number
	}, function(data) {
		if(data != null) {
			if(data.result) {
				currUploadImg.push(base.RootUrl + data.message);

				//图片上传完毕，创建文章
				if(currUploadImg.length == length) {
					//创建文章 
					var data = {
						ID: userinfo.ID,
						Cover: currUploadImg.join(","),
						Title: "",
						Province: Province,
						City: City
					}
					HttpGet(base.RootUrl + "Article/Edit", data, function(data) {
						base.CloseWaiting();
						mask.close();
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
			} else {
				mui.toast(data.message);
			}
		}
	}, "json");
}
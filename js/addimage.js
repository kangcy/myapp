var files = [];
var mask = base.CreateMask(false, function() {
	base.CloseWaiting();
});

// 上传文件
function upload() {
	plus.uploader.clear();
	var task = plus.uploader.createUpload(base.UploadUrl + "Upload/UploadImage", {
			method: "POST"
		},
		function(t, status) { //上传完成  
			if(status == 200) {
				clearInterval(i);
				var data = JSON.parse(t.responseText);
				//console.log(t.responseText);
				//t.responseText = {"result":true,"message":["Upload/Images/Article/20170703142059113_0jpg","Upload/Images/Article/201707031420592588_0jpg","Upload/Images/Article/201707031420594747_0jpg"]}

				Init();
				if(base.IsNullOrEmpty(data.message)) {
					mui.toast("上传失败");
					mask.close();
				} else {
					Import(data.message);
				}
			} else {
				mui.toast("上传失败");
				mask.close();
			}
		}
	);
	task.addData("standard", "Article");
	task.addData("folder", "Article");
	task.addData("number", userinfo.Number);
	mask.show();
	base.ShowWaiting("准备上传" + mui(".thirdfloor").length + "张图片");

	mui.each(mui(".thirdfloor"), function(index, item) {
		task.addFile(item.getAttribute("url"), {
			key: item.getAttribute("id")
		});
	});

	task.start();
	var i = setInterval(function() {
			var totalSize = task.totalSize;
			var downloadedSize = task.uploadedSize;
			if(totalSize > 0) {
				base.ShowWaiting("上传进度：" + parseFloat(100 * downloadedSize / totalSize).toFixed(2) + "%");
			}
		},
		100);
}

//拍照  
function Camera() {
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			mui('#upload').popover('hide');
			files = [entry.toLocalURL()]
			compressImage(0, files[0]);
		});
	}, function(e) {
		mui('#upload').popover('hide');
	});
}

// 从相册中选择图片
function Gallery() {
	plus.gallery.pick(function(e) {
		mui('#upload').popover('hide');
		files = e.files;
		compressImage(0, files[0]);
	}, function(e) {
		mui('#upload').popover('hide');
		console.log("取消选择图片");
	}, {
		filter: "image",
		multiple: true,
		maximum: 100,
		system: false
	});
}

//压缩图片 
function compressImage(i, src) {
	var newi = i + 1;
	var dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片的路径  
	plus.zip.compressImage({
			src: src,
			dst: dstname,
			overwrite: true,
			quality: 90,
			width: "720px",
			format: "jpg"
		},
		function(event) {
			AppendStart(event.target)
			if(newi < files.length) {
				compressImage(newi, files[newi]);
			} else {
				AppendEnd()
			}
		},
		function(error) {
			if(newi < files.length) {
				compressImage(newi, files[newi]);
			} else {
				AppendEnd()
			}
		});
}

//创建文章
function Import(url) {
	base.ShowWaiting("正在同步文章信息");
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
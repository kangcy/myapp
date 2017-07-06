var fileIndex = 0;
var fileTotal = 0;
var files = [];
var mask = base.CreateMask(false, function() {
	base.CloseWaiting();
});

//拍照  
function Camera() {
	mui('#upload').popover('hide');
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			mask.show();
			base.ShowWaiting("正在压缩图片");
			fileIndex = 0;
			fileTotal = 1;
			files = [];
			var localurl = entry.toLocalURL();
			var dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片的路径  
			compressImage(localurl, dstname);
		});
	});
}

// 从相册中选择图片
function Gallery() {
	mui('#upload').popover('hide');
	plus.gallery.pick(function(e) {
		mask.show();
		base.ShowWaiting("正在压缩图片");
		fileIndex = 0;
		fileTotal = e.files.length;
		files = [];
		for(var i = 0; i < e.files.length; i++) {
			var dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片的路径  
			compressImage(e.files[i], dstname);
		}
	}, function(e) {
		console.log("取消选择图片");
	}, {
		filter: "image",
		multiple: true,
		maximum: multiple == 0 ? 1 : 5,
		system: false
	});
}

//压缩图片 
function compressImage(src, dstname) {
	plus.zip.compressImage({
			src: src,
			dst: dstname,
			overwrite: true,
			quality: 100
		},
		function(event) {
			fileIndex++;
			files.push(event.target);
			if(fileIndex >= fileTotal) {
				base.OpenWindow("custom", "custom.html", {
					ArticleNumber: articleNumber,
					Url: files.join(',')
				});
			}
		},
		function(error) {
			if(fileTotal <= 1) {
				mask.close();
				return mui.toast("图片读取异常，换张别的试试吧");
			}
			fileIndex++;
			if(fileIndex >= fileTotal) {
				base.OpenWindow("custom", "custom.html", {
					ArticleNumber: articleNumber,
					Url: files.join(',')
				});
			}
		});
}

//创建段落 
function Import(url) {
	base.ShowWaiting("正在同步段落信息");
	var urls = url.split(',');
	var length = urls.length;
	for(var i = 0; i < length; i++) {
		AddPic(base.GetUid(), urls[i], 0);
		if(i >= length - 1) {
			mask.close();
		}
	}
}
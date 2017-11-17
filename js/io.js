/**
 * 获得sd卡根目录
 */
function getSDRoot() {
	// 导入android.os.Environment类对象
	var environment = plus.android.importClass("android.os.Environment");
	// 判断SD卡是否插入
	if(environment.getExternalStorageState() !== environment.MEDIA_MOUNTED) {
		plus.nativeUI.toast('没有找到SD卡');
		return "";
	}
	console.log(environment.getExternalStorageDirectory().toString())
	return environment.getExternalStorageDirectory().toString();
}

/**
 * 获取根目录文件夹
 */
function getRootDirectory() {
	var File = plus.android.importClass("java.io.File");

	var root = getSDRoot();
	console.log(root);
	// 得到sd卡内image文件夹的路径   File.separator(/)   
	var filePath = root + File.separator;
	console.log(File.separator);
	// 得到该路径文件夹下所有的文件  
	var fileAll = new File(filePath);
	var files = fileAll.listFiles();
	var names = [];
	
	//递归遍历文件夹，判断文件夹当前层级下是否有图片（不包含子文件夹）
	
	for(var i = 0; i < files.length; i++) {
		names.push(plus.android.invoke(files[i], "getName"));
	}
	console.log(names.join(","));
	// 将所有的文件存入ArrayList中,并过滤所有图片格式的文件  
	/*for(int i = 0; i < files.length; i++) { 
		File file = files[i];
		if(checkIsImageFile(file.getPath())) {
			imagePathList.add(file.getPath());
		}
	}*/
	// 返回得到的图片列表  
	//return imagePathList;
}

/**
 * 创建文件夹
 * @param {Object} path
 */
function creatFolder(path) {
	var File = plus.android.importClass("java.io.File");
	var fd = new File(path);
	if(!fd.exists()) {
		fd.mkdirs();
		plus.nativeUI.toast("创建成功");
	}
}

/**
 *  删除文件(文件夹)
 * @param {Object} path
 */
function deleteFile(path) {
	var File = plus.android.importClass("java.io.File");
	var fd = new File(path);
	if(fd != null && fd.exists()) {
		fd.delete();
		plus.nativeUI.toast("删除成功");
	}
}

/**
 * 读文件大小
 * @param {Object} file
 */
function readFileSize(file) {
	var FileInputStream = plus.android.importClass("java.io.FileInputStream");
	var fileSize = new FileInputStream(file);
	var size = fileSize.available();
	var fileSizeString;
	if(size == 0) {
		fileSizeString = "0B";
	} else if(size < 1024) {
		fileSizeString = size + "B";
	} else if(size < 1048576) {
		fileSizeString = (size / 1024).toFixed(2) + "KB";
	} else if(size < 1073741824) {
		fileSizeString = (size / 1048576).toFixed(2) + "MB";
	} else {
		fileSizeString = (size / 1073741824).toFixed(2) + "GB";
	}
	return fileSizeString;
}

/**
 * 读取文件夹下子文件夹及子文件数目
 * @param {Object} file
 */
function readSonFilenum(file) {
	var subFile = plus.android.invoke(file, "listFiles");
	var subLen = subFile.length;
	var obj = {
		subFolderNum: 0,
		subFileNum: 0
	};
	for(var k = 0; k < subLen; k++) {
		if(!plus.android.invoke(subFile[k], "isHidden")) {
			if(plus.android.invoke(subFile[k], "isDirectory")) {
				obj.subFolderNum++;
			} else {
				var name = plus.android.invoke(subFile[k], "getName"); //文件名称
				if(CheckImage(name)) {
					obj.subFileNum++;
				}
			}
		}
	}
	return obj;
}

//判断是否图片
function CheckImage(name) {
	if(base.IsNullOrEmpty(name)) {
		return false;
	}
	name = name.toLowerCase();
	if(name.indexOf(".") < 0) {
		return false;
	}
	return name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".gif");
}
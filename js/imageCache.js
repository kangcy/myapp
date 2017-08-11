/**
 * @description   移动开发框架
 * @author dailc  dailc 
 * @version 1.0
 * @time 2016-01-11 16:57:57
 * 功能模块:只依赖于plus系统
 * @see http://ask.dcloud.net.cn/people/%E6%92%92%E7%BD%91%E8%A6%81%E8%A7%81%E9%B1%BC
 * 图片本地缓存模块********************************
 * 1.本地缓存显示图片
 * 2.增加storage,增加每一个本地缓存的有效时间戳
 * 3.增加自定义设置方法,可以根据不同需求,对参数进行修改
 * 4.采用下载队列进行下载管理,增加最大并发请求数,防止一次性请求过多损耗性能
 * 5.修改了图片本地路径的获取方法,摆脱第三方依赖
 * 6.重构代码
 * 外部API：注意,需要显示的图片需要有data-img-localcache这个属性(用来放目标url)
 * 清除所有图片缓存:MobileFrame.ImageUtil.ImageLoaderFactory.clearLoaderImgsCache(successCb,errorCb)
 * 采取本地缓存显示所有图片:MobileFrame.ImageUtil.ImageLoaderFactory.setAllNetImgsWithLocalCache();
 * 清除某一张图片的本地缓存:MobileFrame.ImageUtil.ImageLoaderFactory.clearNetUrlImgCache(src);
 * 显示某一张图片:MobileFrame.ImageUtil.ImageLoaderFactory.setImgWidthLocalCache(dom,src);
 * 图片本地缓存模块完毕********************************
 */
(function(global) {
	/**
	 * 定义全局函数对象 define出来的
	 */
	var mapping = {};
	/**
	 * 缓存,正在用到的对象,函数中return 出来的,这样就不需要重复执行函数
	 */
	var cache = {};
	/**
	 * @description 模块定义
	 * @param {String} id id
	 * @param {Function} func 对应的函数对象
	 */
	global.define = function(id, func) {
		mapping[id] = func;
	};
	/**
	 * @description 生成模块对象,并采用本地缓存
	 * @param {String} id
	 */
	global.require = function(id) {
		if(!/\.js$/.test(id)) {
			id += '.js';
		}
		if(cache[id]) {
			return cache[id];
		} else {
			return cache[id] = mapping[id]({});
		}
	};
	/**
	 * @description 配置全局工具类以及一些需要用到的全局函数
	 */
	(function() {
		global.MobileFrame = {};
		/**
		 * 空函数
		 */
		MobileFrame.noop = function() {};
		/**
		 * @description each遍历操作
		 * @param {type} elements
		 * @param {type} callback
		 * @returns {global}
		 */
		MobileFrame.each = function(elements, callback, hasOwnProperty) {
			if(!elements) {
				return this;
			}
			if(typeof elements.length === 'number') {
				[].every.call(elements, function(el, idx) {
					return callback.call(el, idx, el) !== false;
				});
			} else {
				for(var key in elements) {
					if(hasOwnProperty) {
						if(elements.hasOwnProperty(key)) {
							if(callback.call(elements[key], key, elements[key]) === false) return elements;
						}
					} else {
						if(callback.call(elements[key], key, elements[key]) === false) return elements;
					}
				}
			}
			return global;
		};
		/**
		 * @description plusReady
		 * @param {Function} callback
		 * @returns {global} 返回的是global
		 */
		MobileFrame.plusReady = function(callback) {
			if(window.plus) {
				setTimeout(function() { //解决callback与plusready事件的执行时机问题(典型案例:showWaiting,closeWaiting)
					callback();
				}, 0);
			} else {
				document.addEventListener("plusready", function() {
					callback();
				}, false);
			}
			return global;
		};
		/**
		 * @description 得到相对路径对应的key,这个key可以使缓存池的或者是本地缓存键值
		 * 主要作用是去除非法字符
		 * @param {String} relativePath
		 */
		MobileFrame.getRelativePathKey = function(relativePath) {
			var finalKey = relativePath.replace(/[&\|\\\*^%$#@\-]/g, "");
			return finalKey;
		};
		/**
		 * @description 更改url类型,去除cache,因为cache会造成一些困扰
		 * @param {String} url 传入的url
		 */
		MobileFrame.changImgUrlTypeNoCache = function(url) {
			url = url || '';
			if(url.indexOf('?') != -1) {
				url += '&timeRandKey=' + Math.random();
			} else {
				url += '?timeRandKey=' + Math.random();
			}
			return url;
		};
		/**
		 * @description 删除指定路径的文件
		 * @param {String} relativePath  绝对路径或相对路径例如:  _downloads/imgs/test.jpg
		 * @param {Function} successCallback  删除成功回调
		 * @param {Function} errorCallback  失败回调
		 */
		MobileFrame.delFile = function(relativePath, successCallback, errorCallback) {
			if(!relativePath) {
				return;
			}
			MobileFrame.plusReady(function() {
				plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
					entry.remove(function(entry) {
						if(successCallback && typeof(successCallback) == 'function') {
							successCallback(true);
						}
					}, function(e) {
						if(errorCallback && typeof(errorCallback) == 'function') {
							errorCallback('删除文件失败!');
						}
					});
				}, function() {
					if(errorCallback && typeof(errorCallback) == 'function') {
						errorCallback('打开文件路径失败!');
					}
				});
			});
		};
		/**
		 * @description 判断网络状态
		 */
		function GetNetWorkState() {
			var NetStateStr = '未知';
			var types = {};
			types[plus.networkinfo.CONNECTION_UNKNOW] = "未知";
			types[plus.networkinfo.CONNECTION_NONE] = "未连接网络";
			types[plus.networkinfo.CONNECTION_ETHERNET] = "有线网络";
			types[plus.networkinfo.CONNECTION_WIFI] = "WiFi网络";
			types[plus.networkinfo.CONNECTION_CELL2G] = "2G蜂窝网络";
			types[plus.networkinfo.CONNECTION_CELL3G] = "3G蜂窝网络";
			types[plus.networkinfo.CONNECTION_CELL4G] = "4G蜂窝网络";
			NetStateStr = types[plus.networkinfo.getCurrentType()];

			return NetStateStr;
		};
		/**
		 * @description 判断是否有网络
		 */
		MobileFrame.IsNetWorkCanUse = function() {
			var IsCanUseNetWork = false;
			if(GetNetWorkState() == '未知' || GetNetWorkState() == '未连接网络') {
				IsCanUseNetWork = false;
			} else {
				IsCanUseNetWork = true;
			}
			return IsCanUseNetWork;
		};
	})();
	/**
	 * @description 定义模块功能-图片工具类
	 */
	define('scripts/Core/ImageUtil.js', function(exports) {
		/**
		 * @description 图片加载工厂,包含图片加载方法
		 * 例如:时间戳控制缓存,下载队列批次下载,默认图片,下载loading图片,下载失败图片
		 * 注意相对路径在Android:/sdcard/Android/data/io.dcloud.HBuilder/.HBuilder/...
		 * iOS:/Library/Pandora/...
		 */
		(function(ImgLoaderFactory) {
			/**
			 * 默认的options
			 */
			var defaultSettingOptions = {
				//默认的图片缓存目录-存到应用的downloads/imgs下
				'imgStoragePath': "_downloads/imgs/",
				//默认图片的基座路径
				'defaultImgBase': '../images/',
				//loading图片的名称
				'loadingImgName': 'default.png',
				//error图片名称
				'errorImgName': 'default.png',
				//图片缓存的时间戳,毫秒单位,默认为1天
				'imgsTimeStamp': 1000 * 60 * 60 * 24 * 1,
				//同时最多的downloader 并发下载数目,默认为3个
				'concurrentDownloadCount': 3,
				//单个下载任务最大的请求时间,防止一些机型上无法触发错误回调,单位毫秒,默认10秒
				'maxTimeSingleDownloadTaskSpend': 1000 * 10
			};

			//默认的下载图片临时变量
			var defaultLoadingImg = defaultSettingOptions['defaultImgBase'] + defaultSettingOptions['loadingImgName'];

			//默认的显示图片临时变量
			var defaultImg = defaultSettingOptions['defaultImgBase'] + defaultSettingOptions['errorImgName'];

			//图片缓存的session头部

			var imageSessionKey_header = 'imageSessionKey_util_imgs_';

			//图片缓存的session的管理者
			var imageSessionManagerKey = 'imageSessionKey_util_Manager';
			/**
			 * 图片缓存池,用来解决多张图片并发请求问题
			 * 默认是空的,当有多张图片是同一个请求时,缓存池子中会有数据
			 * 格式  {'url1':[dom1,dom2]}
			 */
			var requestImgsPool = {};
			//并发下载任务,包括下载队列,处理最大并发数下载
			var concurrentDownloadTask = {
				//任务池-还没有下载的任务
				Queue: [],
				//当前正在下载的任务数量
				CurrentTaskCount: 0
			};
			/**
			 * 当前的任务队列,包含任务的名称,以及时间戳-用来控制最大的超时时间,防止不能正常触发回调
			 * 包含:
			 * taskObj,timeBegin
			 * 格式:{url1:{task1,time1}}
			 */
			var currentDownloadTasks = {};
			/**
			 * @description 将对应的图片缓存键值添加进入图片缓存管理中
			 * @param {String} key 图片路径对应的key
			 */
			function addImageSessionKeyToManager(key) {
				//获取管理者
				var manager = plus.storage.getItem(imageSessionManagerKey);
				if(manager == null) {
					//如果以前的缓存为空,生成缓存
					manager = [];
				} else {
					try {
						manager = JSON.parse(manager);
					} catch(e) {}
				}
				if(manager.indexOf(key) == -1) {
					manager.push(key);
				}
				plus.storage.setItem(imageSessionManagerKey, JSON.stringify(manager));
			};
			/**
			 * @description 从缓存管理中移除相应的图片缓存
			 * @param {String} key 图片路径对应的key
			 */
			function removeImageSessionKeyFromManager(key) {
				//获取管理者
				var manager = plus.storage.getItem(imageSessionManagerKey);
				if(manager == null) {
					//这时候肯定没有离线缓存
					return;
				}
				try {
					manager = JSON.parse(manager);
				} catch(e) {}
				var index = -1;
				for(var i = 0; i < manager.length || 0; i++) {
					if(manager[i] == key) {
						index = i;
					}
				}
				if(index != -1) {
					//删除对应的index位置
					manager.splice(index, 1);
					//重新存储
					plus.storage.setItem(imageSessionManagerKey, JSON.stringify(manager));
				}
			};

			/**
			 * 设置图片缓存key
			 * @param {String} url
			 * @param {JSON} value 存进去的是图片相关的所有属性,包括时间戳,本地路径等
			 */
			function setImageSessionItem(url, value) {
				if(url == null) {
					return;
				}
				//然后添加进入缓存管理者中
				addImageSessionKeyToManager(url);
				url = imageSessionKey_header + MobileFrame.getRelativePathKey(url);
				value = (value != null) ? value : '';
				value = (typeof(value) == 'string') ? value : JSON.stringify(value);
				plus.storage.setItem(url, value);

			};
			/**
			 * 获取图片缓存key
			 * @param {String} url
			 * @return {JSON} item 返回的是一个json对象,包括图片相关的所有属性,包括时间戳,本地路径等
			 * @example 包含属性:time localPath
			 */
			function getImageSessionItem(url) {
				if(url == null) {
					return null;
				}
				//去除非法字符
				url = imageSessionKey_header + MobileFrame.getRelativePathKey(url);
				var item = plus.storage.getItem(url);
				try {
					if(item != null) {
						item = JSON.parse(item);
					}
				} catch(e) {}
				return item;
			};
			/**
			 * 移除图片缓存key
			 * @param {String} url
			 */
			function removeImageSessionItem(url) {
				if(url == null) {
					return null;
				}
				removeImageSessionKeyFromManager(url);
				//去除非法字符
				url = imageSessionKey_header + MobileFrame.getRelativePathKey(url);
				var items = plus.storage.removeItem(url);
			};
			/**
			 * @description 设置图片的src地址,根据一个url,为所有需要的图片赋值
			 * @param {HTMLElement} $img 图片的dom,这里为原生dom对象
			 * @param {String} srcUrl 图片的路径
			 * @param {String} relativePath 相对路径,用来判断缓存池的
			 */
			function setImgSrc($img, srcUrl, relativePath) {
				if(!srcUrl) {
					return;
				}
				setImgSrcByDom($img, srcUrl);
				//如果缓存池子中存在图片
				if(!relativePath) {
					return;
				}
				var relativePathKey = MobileFrame.getRelativePathKey(relativePath);
				if(requestImgsPool && requestImgsPool[relativePathKey]) {
					var imgsData = requestImgsPool[relativePathKey];
					//如果是数组
					if(Array.isArray(imgsData)) {
						for(var i = 0; i < imgsData.length; i++) {
							setImgSrcByDom(imgsData[i], srcUrl);
						}
					} else {
						//单条数据--单个dom对象
						setImgSrcByDom(imgsData, srcUrl);
					}
					if(srcUrl != defaultLoadingImg) {
						//如果不是loading图片就清空
						//清空图片池子中的该条键值
						requestImgsPool[relativePathKey] = null;
					}
				}
			};
			/**
			 * @description 设置图片的src地址,一个dom和一个 src一一对应
			 * @param {HTMLElement} $img 图片的dom,原生dom对象
			 * @param {String} srcUrl 图片的路径
			 */
			function setImgSrcByDom($img, srcUrl) {
				if(!$img || !($img instanceof HTMLElement)) {
					//console.log('该dom不是原生对象,url:' + srcUrl);
					return;
				}
				srcUrl = MobileFrame.changImgUrlTypeNoCache(srcUrl);
				$img.setAttribute('src', srcUrl);
			};
			/**
			 * @description 移除所有的图片缓存键
			 */
			function clearAllImageSessionKey() {
				MobileFrame.plusReady(function() {
					var manager = plus.storage.getItem(imageSessionManagerKey);
					if(manager == null) {
						//这时候肯定没有离线缓存
						return;
					}
					try {
						manager = JSON.parse(manager);
					} catch(e) {}
					if(Array.isArray(manager)) {
						for(var i = 0; i < manager.length; i++) {
							removeImageSessionItem(manager[i]);
						}
					}
				});

			};
			/**
			 * @description 设置图片加载工具的一些基本参数
			 * @param {JSON} options 参数
			 * @example 参数没传代表使用默认值,包括:
			 * imgStoragePath,string型,图片的默认路径
			 * defaultImgBase,string型,默认图片的基座路径
			 */
			ImgLoaderFactory.setOptions = function(options) {
				if(!options) {
					return;
				}
				//设置参数
				for(var key in defaultSettingOptions) {
					//如果设置的是有效的
					if(options[key] != null) {
						defaultSettingOptions[key] = options[key];
					}
				}
				//默认的下载图片临时变量
				defaultLoadingImg = defaultSettingOptions['defaultImgBase'] + defaultSettingOptions['loadingImgName'];
				//默认的显示图片临时变量
				defaultImg = defaultSettingOptions['defaultImgBase'] + defaultSettingOptions['errorImgName'];
			};
			/**
			 * @description 清除图片加载工厂的所有图片缓存
			 * @param {Function} successCallback 成功回调
			 * @param {Function} errorCallback 失败回调
			 */
			ImgLoaderFactory.clearLoaderImgsCache = function(successCallback, errorCallback) {
				MobileFrame.plusReady(function() {
					//遍历目录文件夹下的所有文件，然后删除
					var tmpUrl = plus.io.convertLocalFileSystemURL(defaultSettingOptions['imgStoragePath']);
					//需要手动加上 file://
					tmpUrl = 'file://' + tmpUrl;
					//同时清除所有的缓存键值
					clearAllImageSessionKey();
					plus.io.resolveLocalFileSystemURL(tmpUrl, function(entry) {
						entry.removeRecursively(function() {
							if(successCallback && typeof(successCallback) == 'function') {
								successCallback('清除图片缓存成功!');
							}
						}, function() {
							if(errorCallback && typeof(errorCallback) == 'function') {
								errorCallback('清除图片缓存失败!');
							}
						});
					}, function(e) {
						if(errorCallback && typeof(errorCallback) == 'function') {
							errorCallback('打开图片缓存目录失败!');
						}
					});
				});
			};
			/**
			 * @description 从一个网络URL中,获取本地图片缓存相对路径
			 * @param {String} loadUrl 图片的网络路径,如果为null,则返回一个null
			 * @return {String} 返回路径或者是 ***outOfTime***表示缓存时间戳过去
			 * @example 获取相对路径可以有很多种方法
			 * 比如可以用md5将url加密,或者其它字符串操作等等
			 * 我这里也是根据项目而进行自适应的
			 */
			ImgLoaderFactory.getRelativePathFromLoadUrl = function(loadUrl) {
				if(loadUrl == null) return null;
				//如果loadUrl以../开头,代表是相对路径,采用本地相对路径,这里就直接返回本地路径,这样就是直接赋值了
				console.log(loadUrl);
				if(loadUrl.substring(0, 5).indexOf('../') != -1) {
					return loadUrl;
				}
				//图片缓存如果存在,判断是否过期,默认为''
				var isOutOfTimeHeader = '';
				//如果存在本地缓存,并且没有过期,采用本地缓存中的图片
				var loacalImgSessionItem = getImageSessionItem(loadUrl);
				if(loacalImgSessionItem != null) {
					//判断是否过期  time localPath
					if(loacalImgSessionItem.time) {
						loacalImgSessionItem.time = parseInt(loacalImgSessionItem.time, 10);
						if((new Date()).valueOf() - loacalImgSessionItem.time > defaultSettingOptions['imgsTimeStamp']) {
							//console.log('当前缓存已经过期')
							//返回一个特殊字符,代表过期 
							isOutOfTimeHeader = '***outOfTime***';
						} else {
							//console.log('缓存未过期');
						}
					}
					if(loacalImgSessionItem.localPath) {
						return loacalImgSessionItem.localPath;
					}
				}
				//获取图片后缀,如果没有获取到后缀,默认是jpg
				var imgSuffix = loadUrl.substring(loadUrl.lastIndexOf(".") + 1, loadUrl.length);
				if(
					imgSuffix.toLocaleLowerCase() != ("jpg") &&
					imgSuffix.toLocaleLowerCase() != ("jpeg") &&
					imgSuffix.toLocaleLowerCase() != ("png") &&
					imgSuffix.toLocaleLowerCase() != ("bmp") &&
					imgSuffix.toLocaleLowerCase() != ("svg") &&
					imgSuffix.toLocaleLowerCase() != ("gif")
				) {
					//如果后缀没有包含以上图片,将后缀改为jpg
					imgSuffix = 'jpg';
				}
				//更换存储方式,变为将整个路径存储下来,然后去除非法字符
				var regIllegal = /[&\|\\\*^%$#@\-:.?\/=!]/g;
				//获取图片名字
				var imgName = loadUrl.replace(regIllegal, '');
				//最终的名字
				var filename = imgName + '.' + imgSuffix;
				//console.log('loadurl:'+loadUrl+',fileName:'+filename);
				var relativePath = defaultSettingOptions['imgStoragePath'] + filename;
				setImageSessionItem(loadUrl, {
					'localPath': relativePath,
					'time': (new Date()).valueOf()
				});
				//将是否过期标识传出
				return isOutOfTimeHeader + relativePath;
			};

			/**
			 * @description 删除某一张网络图片的本地缓存,同时也会删除缓存键值
			 */
			ImgLoaderFactory.clearNetUrlImgCache = function(netImgUrl, successCallback, errorCallback) {
				MobileFrame.plusReady(function() {
					//删除该键值对应的缓存
					removeImageSessionItem(netImgUrl);
					MobileFrame.delFile(ImgLoaderFactory.getRelativePathFromLoadUrl(netImgUrl), successCallback, errorCallback);
				});
			};

			/**
			 * @description 给指定的图片dom 设置本地图片属性
			 * @param {HTMLElement} $img 目标图片dom,这里为原生的dom对象
			 * @param {String} relativePath 本地图片路径
			 */
			function setImgFromLocalCache($img, relativePath) {
				/*例如:
				 * 本地相对路径("downloads/imgs/logo.jpg")转成SD卡绝对路径
				 * 例如相对路径:downloads/imgs/logo.jpg
				 * ("/storage/emulated/0/Android/data/io.dcloud.HBuilder/.HBuilder/downloads/imgs/logo.jpg");
				 * */
				if(!relativePath) {
					return;
				}
				MobileFrame.plusReady(function() {
					var sd_path = plus.io.convertLocalFileSystemURL(relativePath);
					setImgSrc($img, sd_path, relativePath);
				});
			};
			/**
			 * @description 通过本地缓存的方法显示网络图片
			 * @param {HTMLElement} $img 原生dom对象
			 * @param {String} loadUrl loadurl
			 */
			ImgLoaderFactory.setImgWidthLocalCache = function($img, loadUrl) {
				if($img == null || loadUrl == null) return;
				MobileFrame.plusReady(function() {
					var relativePath = ImgLoaderFactory.getRelativePathFromLoadUrl(loadUrl);
					//判断需不需要将路径进行编码,如果是中文路径,需要编码后才能下载
					var regChinese = /[\u4E00-\u9FA5]/g;
					var tmpLoadUrl = loadUrl.replace(regChinese, 'chineseRemoveAfter');
					if(tmpLoadUrl.indexOf('chineseRemoveAfter') != -1) {
						loadUrl = encodeURI(loadUrl);
					}
					//判断是否已经缓存过期
					var isCacheOutOfTime = false;
					if(relativePath.indexOf('***outOfTime***') != -1) {
						relativePath.replace('***outOfTime***', '');
						isCacheOutOfTime = true;
					}
					if(relativePath == 'default.jpg') {
						//设置默认图片
						setImgSrc($img, defaultImg);
					} else {
						if(isCacheOutOfTime == false) {
							//检查图片是否已存在
							plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
								//如果文件存在,则直接设置本地图片
								setImgFromLocalCache($img, relativePath);
							}, function(e) {
								readyToGetNetImg($img, loadUrl, relativePath);
							});
						} else {
							//否则,本地缓存已经过期,直接网络获取
							readyToGetNetImg($img, loadUrl, relativePath);
						}
					}
				});
			};
			/**
			 * @description 准备通过网络获取图片
			 * @param {HTMLElement} $img 原生dom对象
			 * @param {String} loadUrl loadurl
			 * @param {String} relativePath 本地相对路径
			 */
			function readyToGetNetImg($img, loadUrl, relativePath) {
				//如果文件不存在,上网下载
				if(MobileFrame.IsNetWorkCanUse() == true) {
					//添加进入图片缓存池中
					var relativePathKey = MobileFrame.getRelativePathKey(relativePath);
					if(requestImgsPool && requestImgsPool[relativePathKey] && Array.isArray(requestImgsPool[relativePathKey])) {
						//如果已经存在该条图片缓存池,代表这条资源已经进行请求了,只需要填进响应池子即可
						requestImgsPool[relativePathKey].push($img);
						return;
					} else {
						//新建缓存池
						requestImgsPool[relativePathKey] = [];
						requestImgsPool[relativePathKey].push($img);
					}
					//如果网络状态能用,联网下载图片
					setImgFromNet($img, loadUrl, relativePath);
				} else {
					//采用本地默认图片
					setImgSrc($img, defaultImg);
				}
			};
			/**
			 * @description 从网络下载图片,并给指定的img dom赋值
			 * @param {HTMLElement} $img 目标img 原生dom
			 * @param {String} loadUrl 网络图片路径
			 * @param {String} relativePath 图片下载后的本地路径,如果不指定,采用默认值 在_downloads/imgs/下
			 */
			function setImgFromNet($img, loadUrl, relativePath) {
				relativePath = (typeof(relativePath) == 'string' && relativePath != '') ? relativePath : ImgLoaderFactory.getRelativePathFromLoadUrl(loadUrl);
				//下载参数
				var options = {
					filename: relativePath,
					timeout: 3,
					retryInterval: 3
				};
				//解决ios的网络缓存问题
				loadUrl = MobileFrame.changImgUrlTypeNoCache(loadUrl);
				//1.将图片 设为默认的下载图片
				setImgSrc($img, defaultLoadingImg);
				//2.创建下载任务
				var dtask = plus.downloader.createDownload(loadUrl,
					options,
					function(d, status) {
						if(status == 200) {
							//下载成功
							//console.log('绝对路径:'+d.filename);
							//这里传入的是相对路径,方便缓存显示
							setImgFromLocalCache($img, relativePath);
						} else {
							//下载失败,需删除本地临时文件,否则下次进来时会检查到图片已存在
							//console.log("下载失败=" + status + "==" + relativePath);
							//dtask.abort();//文档描述:取消下载,删除临时文件;(但经测试临时文件没有删除,故使用delFile()方法删除);
							if(relativePath != null) {
								MobileFrame.delFile(relativePath);
							}
							setImgSrc($img, defaultImg);
						}
						//下载完成,当前任务数-1,并重新检查下载队列
						concurrentDownloadTask['CurrentTaskCount']--;
						//下载完成,从当前下载队列中去除
						currentDownloadTasks[dtask.url] = null;
						executeDownloadTasks();
					});
				//3.启动下载任务,添加进入下载队列中
				concurrentDownloadTask['Queue'].push(dtask);
				//执行并发下载队列
				executeDownloadTasks();
			};
			/**
			 * @description 执行下载任务,通过队列中一个一个的进行
			 */
			function executeDownloadTasks() {
				//console.log('检查下载队列');
				//先检查是否存在任务超时的
				for(var taskItem in currentDownloadTasks) {
					if(currentDownloadTasks[taskItem] &&
						currentDownloadTasks[taskItem].timeBegin && (new Date()).valueOf() - currentDownloadTasks[taskItem].timeBegin > defaultSettingOptions['maxTimeSingleDownloadTaskSpend']) {
						//如果当前下载人已经超时,并且没有自动触发回调
						//终止任务下载
						currentDownloadTasks[taskItem].taskObj && currentDownloadTasks[taskItem].taskObj.abort && currentDownloadTasks[taskItem].taskObj.abort();
						concurrentDownloadTask['CurrentTaskCount']--;
						//从当前任务队列中去除
						currentDownloadTasks[taskItem] = null;
						//console.log('存在超时的任务,手动剔除');
					}
				}
				//如果当前下载任务小于并发下载数       
				if(concurrentDownloadTask['CurrentTaskCount'] < defaultSettingOptions['concurrentDownloadCount']) {
					if(concurrentDownloadTask['Queue'].length > 0) {
						//开启一个下载任务
						var nowTask = concurrentDownloadTask['Queue'].shift();
						nowTask.start()
						//当前任务数++
						concurrentDownloadTask['CurrentTaskCount']++;
						currentDownloadTasks[nowTask.url] = {
							taskObj: nowTask,
							timeBegin: (new Date()).valueOf()
						}
						//console.log('添加一个下载任务');
					} else {
						//console.log('已经没有了下载任务');
					}
				} else {
					//console.log('已经达到最大下载数量,延迟下载');
				}
			};
			/**
			 * @description 设置页面中的所有图片(本地缓存方式)
			 * 注意,只有存在data-lazyload 标签的图片才会有效果
			 */
			ImgLoaderFactory.setAllNetImgsWithLocalCache = function() {
				//获取页面中所有的图片
				var imgs = document.querySelectorAll('img');
				console.log(imgs.length)
				MobileFrame.each(imgs, function(key, value) {
					var src = this.getAttribute('data-lazyload');
					//console.log('显示图片:' + src);
					if(src != null && src != '') {
						ImgLoaderFactory.setImgWidthLocalCache(this, src);
					}
				});
			};
		})(exports.ImageLoaderFactory = {});

		return exports;
	});
	/**
	 * 生成模块
	 */
	{
		MobileFrame.ImageUtil = require('scripts/Core/ImageUtil.js');
	}

})(this);
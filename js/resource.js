//遍历手机音频文件
function LoadMusic() {
	if(plus.os.name == "Android") {
		var Context = plus.android.importClass("android.content.Context");
		var ContentResolver = plus.android.importClass("android.content.ContentResolver");
		var Cursor = plus.android.importClass("android.database.Cursor");
		var Uri = plus.android.importClass("android.net.Uri");
		var MediaStore = plus.android.importClass("android.provider.MediaStore");
		var main = plus.android.runtimeMainActivity();

		var list = document.getElementById("list");
		var li;

		//创建一个游标对象
		var context = main;
		var Uri = new Uri();
		Uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
		var resolver = new ContentResolver();
		resolver = context.getContentResolver();
		var c = new Cursor();
		c = resolver.query(Uri, null, null, null, null);
		c.moveToFirst();

		if(c != null) {
			while(c.moveToNext()) {
				//扫描本地文件，得到歌曲的相关信息
				var music_name = c.getString(c.getColumnIndex(MediaStore.Audio.Media.TITLE));
				var music_singer = c.getString(c.getColumnIndex(MediaStore.Audio.Media.ARTIST));
				var music_time = c.getString(c.getColumnIndex(MediaStore.Audio.Media.DURATION));
				var music_path = c.getString(c.getColumnIndex(MediaStore.Audio.Media.DATA));

				console.log(music_name);
			}
		}
		c.close();
	}
}

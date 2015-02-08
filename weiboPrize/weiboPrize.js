(function(){
	var post = $('.post'), 
		gender = $('.gender'),
		reposters = $('.reposters'),
		postUrl = $('input[name=postUrl]'),
		getReposterBtn = $('.getReposters'),
		getLuckyBtn = $('.getLucky'),
		luckyNumInput = $('input[name=luckyNum]'),
		luckyReposters = $('.luckyReposters');
	
	var users = new Array(); //用户名列表
	var luckyNum; //抽奖数
	var luckyUsers = new Array();


	gender.hide();

	var host = "https://api.weibo.com/2/statuses/",
		TIMEOUT = 50000,
		ACCESS_TOKEN = "2.00XoPdmBkdWh2Cabdb08329dx3GzuD";

	// 绑定按钮事件
	bindBtnAction();

	function bindBtnAction() {
		getReposterBtn.on("click", "button", function(){
			go();
		});

		getLuckyBtn.on("click", "button", function(){
			selectLucky();

		});
	}

	function go() {
		originUrl = postUrl.val();
		mid = parseMidFromUrl(originUrl);
		if (typeof(mid) == "undefined") {
			return;
		}
		getPostIdFromMid(mid);
	}

	function parseMidFromUrl(url) {
		//url = "http://weibo.com/1454064140/C3cSEgndR?type=comment#_rnd1423297925257";
		var reg = new RegExp("http://weibo.com/[0-9]+/([^?]+)\?");
		var result = reg.exec(url);
		if (typeof(result) == "undefined" || !(result instanceof Array) || result.length!=2) {
			alert("请输入正确的链接");
			return;
		}
		return result[1];
	}

	function getPostIdFromMid(mid) {
		$.ajax({
			timeout: TIMEOUT,
			url: host + "queryid.json",
			dataType: "jsonp",
			data: {
				type: 1,
				mid: mid,
				isBase62: 1,
				access_token: ACCESS_TOKEN
			},
			success: function(json) {
				// alert(json.data.id)
				id = json.data.id;
				getRePosts(id, 1);         // TODO: refactor
			},
			error: function(data) {
				reposters.text("网络错误，请重新获取");	//
			}
		});
	}

	function getRePosts(id, page) {
		$.ajax({
			timeout: TIMEOUT,
			url: host+"repost_timeline.json",
			dataType: "jsonp",
			data: {
				id: id,
				count: 200,
				page: page,
				access_token: ACCESS_TOKEN
			},
			success: function(json) {
				var reposts = json.data.reposts;
				for (i=0, length = reposts.length; i< length; ++i) {
					users.push(reposts[i].user.name);
				}
				if (length > 180) {
					getRePosts(id, page+1);
				}
				reposters.text(users.join(", ")); // TODO: refator
			},
			error: function(json) {
				if (users.length > 0) {
					return;
				}
				reposters.text("网络错误，请重新获取"); //
			}
		});
	}

	function selectLucky() {
		luckyNum = luckyNumInput.val();
		if (!/[0-9]+/.test(luckyNum)) {
		alert("请输入数字");
		return;
	}
		// if (!(typeof(luckyNum) == "number")) {
		// 	alert("请输入数字");
		// }


		luckyUsers = new Array();
		length = users.length;
		if (length <= luckyNum) {
			alert("逗我?!");
			return;
		}
		indexArray = new Array();
		while (luckyUsers.length<luckyNum) {
			index = Math.floor(Math.random()*length);
			if (arrayContains(indexArray, index)) {
				continue;
			}
			indexArray.push(index);
			luckyUsers.push("@"+users[index]+" ");
		}
		luckyReposters.text(luckyUsers.join(", "));
	}

	function arrayContains(array, element) {
		if (!(array instanceof Array)) {
			return false;
		}
		for(i=0; i<array.length; ++i) {
			if (array[i] == element) {
				return true;
			}
		}
		return false;
	}

})();
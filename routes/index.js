var express = require('express');
var router = express.Router();

var apps = [
	{
		name: 'Snowchat',
		addr: 'http://45.76.220.134:3000/snowchat',
		descs: ['很粗糙的聊天室','最粗糙的那种']
	},
	{
		name: '东凤',
		addr: 'http://45.76.220.134:3000/touhou',
		descs: ['等待完工的麻将']
	}
];

router.get('/', function(req, res) {
	res.render('index',{apps: apps});
});

module.exports = router;

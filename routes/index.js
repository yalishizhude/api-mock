/*global module,require*/

(function() {
	'use strict';
	var express = require('express');
	var router = express.Router();
	var Mock = require('mockjs');
	var monk = require('monk');
	var db = monk('localhost:27017/api');
	var fs = require('fs');

	var cInt = db.get('interfaces');
	cInt.find({}, function(err, data){
		data.forEach(function(it){
			router[it.method](it.url, function(req, res){
				console.log(it.url,it.outObject);
				res.json(Mock.mock(JSON.parse(it.outObject)));
			});
		});
	});
	//通过重写文件引发服务器重启，从而重新加载接口
	router.all('/rewrite/:timestamp', function(req, res){
		fs.writeFile('./routes/timetamp.js', req.params.timestamp, 'utf8', function (err) {
		  if (err) throw err;
		});
		res.json({});
	});

	router.get('/', function(req, res){
		res.render('index',{title: 'api-mock-server'});
	});

	module.exports = router;
}).call(this);

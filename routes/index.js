/*global module,require*/
(function () {
  'use strict';
  var express = require('express'),
    router = express.Router(),
    Mock = require('mockjs'),
    monk = require('monk'),
    db = monk('localhost:27017/api'),
    fs = require('fs'),
    cInt = db.get('interfaces');
  cInt.find({}, {
    $ne: {
      valide: false
    }
  }, function (err, data) {
    if (err) {
      throw err;
    }
    console.log('------', 'load interfaces start...');
    var cnt = 0;
    data.forEach(function (it) {
      if (it.method) {
        cnt++;
        console.log(it.url, it.method);
        router[it.method](it.url, function (req, res) {
          console.log(new Date(), req.path);
          try {
            req.session.ifcs = req.session.ifcs || [];
            var obj = Mock.mock(JSON.parse(it.outObject));
            req.session.ifcs.push(req.path);
            res.json(obj);
          } catch (e) {
            res.json(e);
          }
        });
      }
    });
    console.log('------', 'loaded ' + cnt + ' interfaces~');
  });
  //通过重写文件引发服务器重启，从而重新加载接口
  router.all('/rewrite/:timestamp', function (req, res) {
    fs.writeFile('./routes/timestamp.js', req.params.timestamp, 'utf8', function (err) {
      if (err) {
        throw err;
      }
    });
    res.json({});
  });
  router.get('/', function (req, res) {
    res.render('index', {
      title: 'api-mock-server'
    });
  });
  module.exports = router;
}());

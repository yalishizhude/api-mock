/*global module,require*/
var express = require('express');
var router = express.Router();
var Validator = require('schema-validator');
var Mock = require('mockjs');
var monk = require('monk');
var request = require('superagent');
var _ = require('underscore');
var mock = require('superagent-mocker')(request);
var db = monk('localhost:27017/api');
var fs = require('fs');
var cInt = db.get('interfaces');
var routerObj = {};

function loadInterface(callback) {
  routerObj = {};
  mock.clearRoutes();
  cInt.find({}, {
    $ne: {
      valide: false
    },
    sort: {
      url: 1
    }
  }, function (err, data) {
    if (err) throw err;
    console.log('------', 'load interfaces start...');
    data.forEach(function (it) {
      var path = it.url.split('?')[0];
      var method = 'delete' === it.method ? 'del' : it.method;
      var key =  path + ' ' + method;
      routerObj[key] = routerObj[key] || [];
      routerObj[key].push(it);
      console.log(path, method);
    });
    for (var key in routerObj) {
      _registerRouter(key.split(' ')[0], key.split(' ')[1], routerObj[key]);
    }
    console.log('------', 'loaded ' + _.keys(routerObj).length + ' interfaces~');
    if (callback) callback();
  });
}

function _registerRouter(path, method, interfaceList) {
  mock[method](path, function (req) {
    var result = {};
    interfaceList.forEach(function (ifc) {
      try {
        var inSchema = ifc.inSchema ? JSON.parse(ifc.inSchema) : {};
        var outObject = Mock.mock(JSON.parse(ifc.outObject));
        var validate = new Validator(inSchema);
        var check = validate.check(req.body);
        if (_.isEmpty(result) || result._error) {
          result = check._error ? check : outObject;
        }
      } catch (e) {
        console.error('接口出错', e);
      }
    });
    return result;
  });
}
router.all('/rewrite/*', function (req, res) {
  loadInterface(function () {
    res.send('重启 mock服务器 成功!');
  });
}).get('', function (req, res) {
  res.render('index', {
    title: 'api-mock-server'
  });
}).all('*', function (req, res) {
  //send request to superagent-mock for rest api
  request[req.method.toLowerCase()](req.path).send(_.extend(req.body,req.query)).end(function (err, data) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(data);
    }
  });
});
loadInterface();
module.exports = router;

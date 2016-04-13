/*global module,require*/
var express = require('express');
var router = express.Router();
var jsen = require('jsen');
var Mock = require('mockjs');
var monk = require('monk');
var request = require('superagent');
var _ = require('underscore');
var mock = require('superagent-mocker')(request);
var db = monk('localhost:27017/api');
var fs = require('fs');
var cInt = db.get('interfaces');
mock.timeout = 5;

function loadInterface(callback) {
  var routerObj = {};
  mock.clearRoutes();
  cInt.find({}, {
    $ne: {
      valide: false
    },
    sort: {
      url: -1
    }
  }, function (err, data) {
    if (err) throw err;
    console.log('------', 'load interfaces start...');
    var cnt = 0;
    data.forEach(function (it) {
      var method = 'delete' === it.method ? 'del' : it.method;
      var path = it.url.split('?')[0];
      if (it.method && it.url) {
        if (!routerObj[path]) {
          console.log(it.url, it.method);
          routerObj[path] = [it];
          mock[method](path, function (req) {
            var result = {};
            routerObj[req.url].forEach(function (ifc) {
              try {
                var inSchema = ifc.inSchema ? JSON.parse(ifc.inSchema) : {};
                var outObject = Mock.mock(JSON.parse(ifc.outObject));
                var validate = jsen(inSchema);
                var check = validate(req.body);
                if (_.isEmpty(result) || !result) {
                  result = check ? outObject : validate.errors;
                }
              } catch (e) {
                console.error('接口出错', e);
              }
            });
            return result;
          });
        } else {
          routerObj[path].push(it);
        }
        cnt++;
      }
    });
    console.log('------', 'loaded ' + cnt + ' interfaces~');
    if (callback) callback();
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
  //send request to superagent-mock
  request[req.method.toLowerCase()](req.path).send(req.body).send(req.query).end(function (err, data) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(data);
    }
  });
});
loadInterface();
module.exports = router;

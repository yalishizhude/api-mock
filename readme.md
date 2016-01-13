# [中文文档](https://github.com/yalishizhude/api-mock/blob/master/readme_zh.md)

# HTTP mock server

A server which parse mockjs template from mongodb database to respond http request.

## Installation

1. Please make sure that you have installed [mongodb](https://www.mongodb.org/)
2. [Node.js](https://nodejs.org) also needs to be installed
3. Install the project
```
$ git clone https://github.com/yalishizhude/api-mock.git
```
4. install modules
```
$ npm install
```

## Quick Start

1. Start your mongodb
2. Install modules

```
$ npm install
```

3. Start the server

```
$ npm start
```

## Notice

* Maybe you need to config the mongodb's params in **routes/config.js** if you changed mongodb's default connection.
* All **delete** operation are **double left click**.

## Docs

mockjs (http://mockjs.com/)

mongodb (https://www.mongodb.org/)

express (http://expressjs.com/)

node (https://nodejs.org)

## License

  [MIT](LICENSE)

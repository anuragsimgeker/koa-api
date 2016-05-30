# koa-api

koa-api is a API backend boilerplate with authentication and db. 

### Prerequisites

koa-api requires [Node.js](https://nodejs.org/) v4+ and [MongoDB](https://mongodb.com/) to run.

* [node.js] - evented I/O for the backend
* [mongodb] - document-oriented database

### Installation

```sh
$ git clone git@github.com:anuragsimgeker/koa-api.git
$ cd koa-api
$ npm i
$ NODE_ENV=production npm start
```
Go to [localhost] and you should see "hello world!"

### Tech

koa-api uses a number of open source projects to work properly:

* [koa-js] - Expressive middleware for node.js using generators
* [mongoosejs] - elegant mongodb object modeling for node.js
* [koa-jwt] - Koa middleware for validating JSON Web Tokens
* And many more&hellip;

And of course koa-api itself is open source with a [public repository][koa-api] on GitHub.

### Tests
```sh
$ npm test
$ npm run-script coverage
```

### Author
[Anurag Simgeker](https://github.com/anuragsimgeker)


License
----

MIT

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [koa-api]: <https://github.com/anuragsimgeker/koa-api>
   [git-repo-url]: <git@github.com:anuragsimgeker/koa-api.git>
   [node.js]: <http://nodejs.org>
   [mongodb]: <http://mongodb.com>
   [localhost]: <http://localhost:8080/>
   [koa-js]: <http://koajs.com>
   [mongoosejs]: <http://mongoosejs.com>
   [koa-jwt]: <https://github.com/koajs/jwt>

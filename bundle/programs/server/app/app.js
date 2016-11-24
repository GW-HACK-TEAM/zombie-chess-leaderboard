var require = meteorInstall({"common":{"collections.js":["meteor/mongo",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
// common/collections.js                                                                    //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
module.export({Records:function(){return Records}});var Mongo;module.import('meteor/mongo',{"Mongo":function(v){Mongo=v}});
                                                                                            //
var Records = new Mongo.Collection('records');                                              // 3
                                                                                            //
Records.before.insert(function (userId, doc) {                                              // 5
  doc.createdAt = Date.now();                                                               // 6
});                                                                                         // 7
//////////////////////////////////////////////////////////////////////////////////////////////

}],"routes.js":["meteor/meteor","meteor/kadira:blaze-layout","meteor/kadira:flow-router",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
// common/routes.js                                                                         //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
var Meteor;module.import('meteor/meteor',{"Meteor":function(v){Meteor=v}});var BlazeLayout;module.import('meteor/kadira:blaze-layout',{"BlazeLayout":function(v){BlazeLayout=v}});var FlowRouter;module.import('meteor/kadira:flow-router',{"FlowRouter":function(v){FlowRouter=v}});
                                                                                            // 2
                                                                                            // 3
                                                                                            //
FlowRouter.route('/', {                                                                     // 5
  name: 'Output',                                                                           // 6
  action: function action(params, queryParams) {                                            // 7
    BlazeLayout.render('mainLayout', { content: 'output' });                                // 8
  }                                                                                         // 9
});                                                                                         // 5
//////////////////////////////////////////////////////////////////////////////////////////////

}]},"server":{"methods.js":["meteor/meteor","../common/collections",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
// server/methods.js                                                                        //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
var Meteor;module.import('meteor/meteor',{"Meteor":function(v){Meteor=v}});var Records;module.import('../common/collections',{"Records":function(v){Records=v}});
                                                                                            // 2
                                                                                            //
Meteor.methods({                                                                            // 4
  clearRecords: function clearRecords() {                                                   // 5
    Records.remove({});                                                                     // 6
  },                                                                                        // 7
  clearSingleRecord: function clearSingleRecord(id) {                                       // 8
    if (!id) return false;                                                                  // 9
    Records.remove({ _id: id });                                                            // 10
  }                                                                                         // 11
});                                                                                         // 4
//////////////////////////////////////////////////////////////////////////////////////////////

}],"utils.js":["babel-runtime/helpers/classCallCheck","../common/collections",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
// server/utils.js                                                                          //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
module.export({Utils:function(){return Utils}});var _classCallCheck;module.import('babel-runtime/helpers/classCallCheck',{"default":function(v){_classCallCheck=v}});var Records;module.import('../common/collections',{"Records":function(v){Records=v}});
                                                                                            // 1
                                                                                            //
var Utils = new (function () {                                                              // 3
  function _class() {                                                                       // 5
    _classCallCheck(this, _class);                                                          // 5
  }                                                                                         // 7
                                                                                            //
  /**                                                                                       //
   * Logs out the request                                                                   //
   * @param header                                                                          //
   * @param request                                                                         //
   */                                                                                       //
                                                                                            //
                                                                                            //
  _class.prototype.logOutput = function logOutput(header, request) {                        // 3
    console.log(header[['x-forwarded-for']]);                                               // 15
    console.log(request);                                                                   // 16
  };                                                                                        // 17
                                                                                            //
  /**                                                                                       //
   * Records the contents of the request to be output client side                           //
   * @param request                                                                         //
   * @returns {*}                                                                           //
   */                                                                                       //
                                                                                            //
  _class.prototype.recordRequest = function recordRequest(header, request) {                // 3
    var head = {                                                                            // 25
      source: header['x-forwarded-for']                                                     // 26
    };                                                                                      // 25
    return Records.insert({ header: head, bodyParams: request });                           // 28
  };                                                                                        // 29
                                                                                            //
  _class.prototype.retrieveData = function retrieveData() {                                 // 3
    var params = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
                                                                                            //
    var r = Records.find({}).fetch();                                                       // 32
    var filter = _.pluck(r, 'bodyParams');                                                  // 33
    return _.sortBy(filter, function (o) {                                                  // 34
      return -o.score;                                                                      // 34
    });                                                                                     // 34
  };                                                                                        // 35
                                                                                            //
  _class.prototype.getBattleScores = function getBattleScores() {                           // 3
    var r = Records.find({}).fetch();                                                       // 38
    var f = _.pluck(r, 'bodyParams');                                                       // 39
    var gr = _.groupBy(f, 'side');                                                          // 40
    // console.log(g);                                                                      //
    return _(gr).map(function (g, key) {                                                    // 42
      return { type: key,                                                                   // 43
        val: _(g).reduce(function (m, x) {                                                  // 44
          return m + +x.score;                                                              // 44
        }, 0) };                                                                            // 44
    });                                                                                     // 45
  };                                                                                        // 46
                                                                                            //
  return _class;                                                                            // 3
}())();                                                                                     // 3
//////////////////////////////////////////////////////////////////////////////////////////////

}],"main.js":["meteor/meteor","meteor/nimble:restivus","./utils",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
// server/main.js                                                                           //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
var Meteor;module.import('meteor/meteor',{"Meteor":function(v){Meteor=v}});var Restivus;module.import('meteor/nimble:restivus',{"Restivus":function(v){Restivus=v}});var u;module.import('./utils',{"Utils":function(v){u=v}});
                                                                                            // 2
                                                                                            // 3
// Listen to incoming HTTP requests, can only be used on the server                         //
WebApp.rawConnectHandlers.use(function (req, res, next) {                                   // 5
  res.setHeader("Access-Control-Allow-Origin", "*");                                        // 6
  return next();                                                                            // 7
});                                                                                         // 8
var Api = new Restivus();                                                                   // 9
                                                                                            //
Api.addRoute('postScore', {                                                                 // 11
                                                                                            //
  post: function post() {                                                                   // 13
                                                                                            //
    var h = this.request.headers;                                                           // 15
    var b = this.bodyParams;                                                                // 16
    if (b && _.isObject(b)) {                                                               // 17
      u.logOutput(b);                                                                       // 18
      b.reflectorID = u.recordRequest(h, b);                                                // 19
      return b;                                                                             // 20
    } else {                                                                                // 21
      return {                                                                              // 22
        message: 'Empty request received from ' + h['x-forwarded-for']                      // 23
      };                                                                                    // 22
    }                                                                                       // 25
  }                                                                                         // 26
});                                                                                         // 11
                                                                                            //
Api.addRoute('getBattleScores', { authRequired: false }, {                                  // 29
                                                                                            //
  get: function get() {                                                                     // 31
    return u.getBattleScores();                                                             // 32
  }                                                                                         // 33
});                                                                                         // 29
                                                                                            //
Api.addRoute('getLeaderBoard', { authRequired: false }, {                                   // 36
                                                                                            //
  post: function post() {                                                                   // 38
    return u.retrieveData();                                                                // 39
  },                                                                                        // 40
                                                                                            //
  get: function get() {                                                                     // 42
    return u.retrieveData();                                                                // 43
  }                                                                                         // 44
                                                                                            //
});                                                                                         // 36
//////////////////////////////////////////////////////////////////////////////////////////////

}]}},{"extensions":[".js",".json"]});
require("./common/collections.js");
require("./common/routes.js");
require("./server/methods.js");
require("./server/utils.js");
require("./server/main.js");
//# sourceMappingURL=app.js.map

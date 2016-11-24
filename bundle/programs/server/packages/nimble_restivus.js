(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var JsonRoutes = Package['simple:json-routes'].JsonRoutes;
var RestMiddleware = Package['simple:json-routes'].RestMiddleware;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Accounts = Package['accounts-base'].Accounts;

/* Package-scope variables */
var __coffeescriptShare, ironRouterSendErrorToResponse, msg, Restivus;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/nimble_restivus/lib/auth.coffee.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var getUserQuerySelector, userValidator;                                                                             // 1
                                                                                                                     //
this.Auth || (this.Auth = {});                                                                                       // 1
                                                                                                                     //
                                                                                                                     //
/*                                                                                                                   // 3
  A valid user will have exactly one of the following identification fields: id, username, or email                  //
 */                                                                                                                  //
                                                                                                                     //
userValidator = Match.Where(function(user) {                                                                         // 6
  check(user, {                                                                                                      //
    id: Match.Optional(String),                                                                                      //
    username: Match.Optional(String),                                                                                //
    email: Match.Optional(String)                                                                                    //
  });                                                                                                                //
  if (_.keys(user).length === !1) {                                                                                  //
    throw new Match.Error('User must have exactly one identifier field');                                            // 13
  }                                                                                                                  //
  return true;                                                                                                       // 15
});                                                                                                                  // 6
                                                                                                                     //
                                                                                                                     //
/*                                                                                                                   // 18
  Return a MongoDB query selector for finding the given user                                                         //
 */                                                                                                                  //
                                                                                                                     //
getUserQuerySelector = function(user) {                                                                              // 21
  if (user.id) {                                                                                                     //
    return {                                                                                                         // 23
      '_id': user.id                                                                                                 //
    };                                                                                                               //
  } else if (user.username) {                                                                                        //
    return {                                                                                                         // 25
      'username': user.username                                                                                      //
    };                                                                                                               //
  } else if (user.email) {                                                                                           //
    return {                                                                                                         // 27
      'emails.address': user.email                                                                                   //
    };                                                                                                               //
  }                                                                                                                  //
  throw new Error('Cannot create selector from invalid user');                                                       // 30
};                                                                                                                   // 21
                                                                                                                     //
                                                                                                                     //
/*                                                                                                                   // 33
  Log a user in with their password                                                                                  //
 */                                                                                                                  //
                                                                                                                     //
this.Auth.loginWithPassword = function(user, password) {                                                             // 36
  var authToken, authenticatingUser, authenticatingUserSelector, hashedToken, passwordVerification, ref;             // 37
  if (!user || !password) {                                                                                          //
    throw new Meteor.Error(401, 'Unauthorized');                                                                     // 38
  }                                                                                                                  //
  check(user, userValidator);                                                                                        //
  check(password, String);                                                                                           //
  authenticatingUserSelector = getUserQuerySelector(user);                                                           //
  authenticatingUser = Meteor.users.findOne(authenticatingUserSelector);                                             //
  if (!authenticatingUser) {                                                                                         //
    throw new Meteor.Error(401, 'Unauthorized');                                                                     // 49
  }                                                                                                                  //
  if (!((ref = authenticatingUser.services) != null ? ref.password : void 0)) {                                      //
    throw new Meteor.Error(401, 'Unauthorized');                                                                     // 51
  }                                                                                                                  //
  passwordVerification = Accounts._checkPassword(authenticatingUser, password);                                      //
  if (passwordVerification.error) {                                                                                  //
    throw new Meteor.Error(401, 'Unauthorized');                                                                     // 56
  }                                                                                                                  //
  authToken = Accounts._generateStampedLoginToken();                                                                 //
  hashedToken = Accounts._hashLoginToken(authToken.token);                                                           //
  Accounts._insertHashedLoginToken(authenticatingUser._id, {                                                         //
    hashedToken: hashedToken                                                                                         //
  });                                                                                                                //
  return {                                                                                                           // 63
    authToken: authToken.token,                                                                                      //
    userId: authenticatingUser._id                                                                                   //
  };                                                                                                                 //
};                                                                                                                   // 36
                                                                                                                     //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/nimble_restivus/lib/iron-router-error-to-response.js                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// We need a function that treats thrown errors exactly like Iron Router would.
// This file is written in JavaScript to enable copy-pasting Iron Router code.

// Taken from: https://github.com/iron-meteor/iron-router/blob/9c369499c98af9fd12ef9e68338dee3b1b1276aa/lib/router_server.js#L3
var env = process.env.NODE_ENV || 'development';

// Taken from: https://github.com/iron-meteor/iron-router/blob/9c369499c98af9fd12ef9e68338dee3b1b1276aa/lib/router_server.js#L47
ironRouterSendErrorToResponse = function (err, req, res) {
  if (res.statusCode < 400)
    res.statusCode = 500;

  if (err.status)
    res.statusCode = err.status;

  if (env === 'development')
    msg = (err.stack || err.toString()) + '\n';
  else
    //XXX get this from standard dict of error messages?
    msg = 'Server error.';

  console.error(err.stack || err.toString());

  if (res.headersSent)
    return req.socket.destroy();

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(msg));
  if (req.method === 'HEAD')
    return res.end();
  res.end(msg);
  return;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/nimble_restivus/lib/route.coffee.js                                                                      //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
share.Route = (function() {                                                                                          // 1
  function Route(api, path, options, endpoints1) {                                                                   //
    this.api = api;                                                                                                  //
    this.path = path;                                                                                                //
    this.options = options;                                                                                          //
    this.endpoints = endpoints1;                                                                                     //
    if (!this.endpoints) {                                                                                           //
      this.endpoints = this.options;                                                                                 //
      this.options = {};                                                                                             //
    }                                                                                                                //
  }                                                                                                                  //
                                                                                                                     //
  Route.prototype.addToApi = (function() {                                                                           //
    var availableMethods;                                                                                            // 11
    availableMethods = ['get', 'post', 'put', 'patch', 'delete', 'options'];                                         //
    return function() {                                                                                              // 13
      var allowedMethods, fullPath, rejectedMethods, self;                                                           // 14
      self = this;                                                                                                   //
      if (_.contains(this.api._config.paths, this.path)) {                                                           //
        throw new Error("Cannot add a route at an existing path: " + this.path);                                     // 19
      }                                                                                                              //
      this.endpoints = _.extend({                                                                                    //
        options: this.api._config.defaultOptionsEndpoint                                                             //
      }, this.endpoints);                                                                                            //
      this._resolveEndpoints();                                                                                      //
      this._configureEndpoints();                                                                                    //
      this.api._config.paths.push(this.path);                                                                        //
      allowedMethods = _.filter(availableMethods, function(method) {                                                 //
        return _.contains(_.keys(self.endpoints), method);                                                           //
      });                                                                                                            //
      rejectedMethods = _.reject(availableMethods, function(method) {                                                //
        return _.contains(_.keys(self.endpoints), method);                                                           //
      });                                                                                                            //
      fullPath = this.api._config.apiPath + this.path;                                                               //
      _.each(allowedMethods, function(method) {                                                                      //
        var endpoint;                                                                                                // 39
        endpoint = self.endpoints[method];                                                                           //
        return JsonRoutes.add(method, fullPath, function(req, res) {                                                 //
          var doneFunc, endpointContext, error, error1, responseData, responseInitiated;                             // 42
          responseInitiated = false;                                                                                 //
          doneFunc = function() {                                                                                    //
            return responseInitiated = true;                                                                         //
          };                                                                                                         //
          endpointContext = {                                                                                        //
            urlParams: req.params,                                                                                   //
            queryParams: req.query,                                                                                  //
            bodyParams: req.body,                                                                                    //
            request: req,                                                                                            //
            response: res,                                                                                           //
            done: doneFunc                                                                                           //
          };                                                                                                         //
          _.extend(endpointContext, endpoint);                                                                       //
          responseData = null;                                                                                       //
          try {                                                                                                      // 58
            responseData = self._callEndpoint(endpointContext, endpoint);                                            //
          } catch (error1) {                                                                                         //
            error = error1;                                                                                          //
            ironRouterSendErrorToResponse(error, req, res);                                                          //
            return;                                                                                                  // 63
          }                                                                                                          //
          if (responseInitiated) {                                                                                   //
            res.end();                                                                                               //
            return;                                                                                                  // 68
          } else {                                                                                                   //
            if (res.headersSent) {                                                                                   //
              throw new Error("Must call this.done() after handling endpoint response manually: " + method + " " + fullPath);
            } else if (responseData === null || responseData === void 0) {                                           //
              throw new Error("Cannot return null or undefined from an endpoint: " + method + " " + fullPath);       // 73
            }                                                                                                        //
          }                                                                                                          //
          if (responseData.body && (responseData.statusCode || responseData.headers)) {                              //
            return self._respond(res, responseData.body, responseData.statusCode, responseData.headers);             //
          } else {                                                                                                   //
            return self._respond(res, responseData);                                                                 //
          }                                                                                                          //
        });                                                                                                          //
      });                                                                                                            //
      return _.each(rejectedMethods, function(method) {                                                              //
        return JsonRoutes.add(method, fullPath, function(req, res) {                                                 //
          var headers, responseData;                                                                                 // 83
          responseData = {                                                                                           //
            status: 'error',                                                                                         //
            message: 'API endpoint does not exist'                                                                   //
          };                                                                                                         //
          headers = {                                                                                                //
            'Allow': allowedMethods.join(', ').toUpperCase()                                                         //
          };                                                                                                         //
          return self._respond(res, responseData, 405, headers);                                                     //
        });                                                                                                          //
      });                                                                                                            //
    };                                                                                                               //
  })();                                                                                                              //
                                                                                                                     //
                                                                                                                     //
  /*                                                                                                                 // 88
    Convert all endpoints on the given route into our expected endpoint object if it is a bare                       //
    function                                                                                                         //
                                                                                                                     //
    @param {Route} route The route the endpoints belong to                                                           //
   */                                                                                                                //
                                                                                                                     //
  Route.prototype._resolveEndpoints = function() {                                                                   //
    _.each(this.endpoints, function(endpoint, method, endpoints) {                                                   //
      if (_.isFunction(endpoint)) {                                                                                  //
        return endpoints[method] = {                                                                                 //
          action: endpoint                                                                                           //
        };                                                                                                           //
      }                                                                                                              //
    });                                                                                                              //
  };                                                                                                                 //
                                                                                                                     //
                                                                                                                     //
  /*                                                                                                                 // 101
    Configure the authentication and role requirement on all endpoints (except OPTIONS, which must                   //
    be configured directly on the endpoint)                                                                          //
                                                                                                                     //
    Authentication can be required on an entire route or individual endpoints. If required on an                     //
    entire route, that serves as the default. If required in any individual endpoints, that will                     //
    override the default.                                                                                            //
                                                                                                                     //
    After the endpoint is configured, all authentication and role requirements of an endpoint can be                 //
    accessed at <code>endpoint.authRequired</code> and <code>endpoint.roleRequired</code>,                           //
    respectively.                                                                                                    //
                                                                                                                     //
    @param {Route} route The route the endpoints belong to                                                           //
    @param {Endpoint} endpoint The endpoint to configure                                                             //
   */                                                                                                                //
                                                                                                                     //
  Route.prototype._configureEndpoints = function() {                                                                 //
    _.each(this.endpoints, function(endpoint, method) {                                                              //
      var ref, ref1;                                                                                                 // 118
      if (method !== 'options') {                                                                                    //
        if (!((ref = this.options) != null ? ref.roleRequired : void 0)) {                                           //
          this.options.roleRequired = [];                                                                            //
        }                                                                                                            //
        if (!endpoint.roleRequired) {                                                                                //
          endpoint.roleRequired = [];                                                                                //
        }                                                                                                            //
        endpoint.roleRequired = _.union(endpoint.roleRequired, this.options.roleRequired);                           //
        if (_.isEmpty(endpoint.roleRequired)) {                                                                      //
          endpoint.roleRequired = false;                                                                             //
        }                                                                                                            //
        if (endpoint.authRequired === void 0) {                                                                      //
          if (((ref1 = this.options) != null ? ref1.authRequired : void 0) || endpoint.roleRequired) {               //
            endpoint.authRequired = true;                                                                            //
          } else {                                                                                                   //
            endpoint.authRequired = false;                                                                           //
          }                                                                                                          //
        }                                                                                                            //
      }                                                                                                              //
    }, this);                                                                                                        //
  };                                                                                                                 //
                                                                                                                     //
                                                                                                                     //
  /*                                                                                                                 // 140
    Authenticate an endpoint if required, and return the result of calling it                                        //
                                                                                                                     //
    @returns The endpoint response or a 401 if authentication fails                                                  //
   */                                                                                                                //
                                                                                                                     //
  Route.prototype._callEndpoint = function(endpointContext, endpoint) {                                              //
    if (this._authAccepted(endpointContext, endpoint)) {                                                             //
      if (this._roleAccepted(endpointContext, endpoint)) {                                                           //
        return endpoint.action.call(endpointContext);                                                                //
      } else {                                                                                                       //
        return {                                                                                                     //
          statusCode: 403,                                                                                           //
          body: {                                                                                                    //
            status: 'error',                                                                                         //
            message: 'You do not have permission to do this.'                                                        //
          }                                                                                                          //
        };                                                                                                           //
      }                                                                                                              //
    } else {                                                                                                         //
      return {                                                                                                       //
        statusCode: 401,                                                                                             //
        body: {                                                                                                      //
          status: 'error',                                                                                           //
          message: 'You must be logged in to do this.'                                                               //
        }                                                                                                            //
      };                                                                                                             //
    }                                                                                                                //
  };                                                                                                                 //
                                                                                                                     //
                                                                                                                     //
  /*                                                                                                                 // 158
    Authenticate the given endpoint if required                                                                      //
                                                                                                                     //
    Once it's globally configured in the API, authentication can be required on an entire route or                   //
    individual endpoints. If required on an entire endpoint, that serves as the default. If required                 //
    in any individual endpoints, that will override the default.                                                     //
                                                                                                                     //
    @returns False if authentication fails, and true otherwise                                                       //
   */                                                                                                                //
                                                                                                                     //
  Route.prototype._authAccepted = function(endpointContext, endpoint) {                                              //
    if (endpoint.authRequired) {                                                                                     //
      return this._authenticate(endpointContext);                                                                    //
    } else {                                                                                                         //
      return true;                                                                                                   //
    }                                                                                                                //
  };                                                                                                                 //
                                                                                                                     //
                                                                                                                     //
  /*                                                                                                                 // 173
    Verify the request is being made by an actively logged in user                                                   //
                                                                                                                     //
    If verified, attach the authenticated user to the context.                                                       //
                                                                                                                     //
    @returns {Boolean} True if the authentication was successful                                                     //
   */                                                                                                                //
                                                                                                                     //
  Route.prototype._authenticate = function(endpointContext) {                                                        //
    var auth, userSelector;                                                                                          // 182
    auth = this.api._config.auth.user.call(endpointContext);                                                         //
    if ((auth != null ? auth.userId : void 0) && (auth != null ? auth.token : void 0) && !(auth != null ? auth.user : void 0)) {
      userSelector = {};                                                                                             //
      userSelector._id = auth.userId;                                                                                //
      userSelector[this.api._config.auth.token] = auth.token;                                                        //
      auth.user = Meteor.users.findOne(userSelector);                                                                //
    }                                                                                                                //
    if (auth != null ? auth.user : void 0) {                                                                         //
      endpointContext.user = auth.user;                                                                              //
      endpointContext.userId = auth.user._id;                                                                        //
      return true;                                                                                                   //
    } else {                                                                                                         //
      return false;                                                                                                  //
    }                                                                                                                //
  };                                                                                                                 //
                                                                                                                     //
                                                                                                                     //
  /*                                                                                                                 // 199
    Authenticate the user role if required                                                                           //
                                                                                                                     //
    Must be called after _authAccepted().                                                                            //
                                                                                                                     //
    @returns True if the authenticated user belongs to <i>any</i> of the acceptable roles on the                     //
             endpoint                                                                                                //
   */                                                                                                                //
                                                                                                                     //
  Route.prototype._roleAccepted = function(endpointContext, endpoint) {                                              //
    if (endpoint.roleRequired) {                                                                                     //
      if (_.isEmpty(_.intersection(endpoint.roleRequired, endpointContext.user.roles))) {                            //
        return false;                                                                                                // 210
      }                                                                                                              //
    }                                                                                                                //
    return true;                                                                                                     //
  };                                                                                                                 //
                                                                                                                     //
                                                                                                                     //
  /*                                                                                                                 // 214
    Respond to an HTTP request                                                                                       //
   */                                                                                                                //
                                                                                                                     //
  Route.prototype._respond = function(response, body, statusCode, headers) {                                         //
    var defaultHeaders, delayInMilliseconds, minimumDelayInMilliseconds, randomMultiplierBetweenOneAndTwo, sendResponse;
    if (statusCode == null) {                                                                                        //
      statusCode = 200;                                                                                              //
    }                                                                                                                //
    if (headers == null) {                                                                                           //
      headers = {};                                                                                                  //
    }                                                                                                                //
    defaultHeaders = this._lowerCaseKeys(this.api._config.defaultHeaders);                                           //
    headers = this._lowerCaseKeys(headers);                                                                          //
    headers = _.extend(defaultHeaders, headers);                                                                     //
    if (headers['content-type'].match(/json|javascript/) !== null) {                                                 //
      if (this.api._config.prettyJson) {                                                                             //
        body = JSON.stringify(body, void 0, 2);                                                                      //
      } else {                                                                                                       //
        body = JSON.stringify(body);                                                                                 //
      }                                                                                                              //
    }                                                                                                                //
    sendResponse = function() {                                                                                      //
      response.writeHead(statusCode, headers);                                                                       //
      response.write(body);                                                                                          //
      return response.end();                                                                                         //
    };                                                                                                               //
    if (statusCode === 401 || statusCode === 403) {                                                                  //
      minimumDelayInMilliseconds = 500;                                                                              //
      randomMultiplierBetweenOneAndTwo = 1 + Math.random();                                                          //
      delayInMilliseconds = minimumDelayInMilliseconds * randomMultiplierBetweenOneAndTwo;                           //
      return Meteor.setTimeout(sendResponse, delayInMilliseconds);                                                   //
    } else {                                                                                                         //
      return sendResponse();                                                                                         //
    }                                                                                                                //
  };                                                                                                                 //
                                                                                                                     //
                                                                                                                     //
  /*                                                                                                                 // 250
    Return the object with all of the keys converted to lowercase                                                    //
   */                                                                                                                //
                                                                                                                     //
  Route.prototype._lowerCaseKeys = function(object) {                                                                //
    return _.chain(object).pairs().map(function(attr) {                                                              //
      return [attr[0].toLowerCase(), attr[1]];                                                                       //
    }).object().value();                                                                                             //
  };                                                                                                                 //
                                                                                                                     //
  return Route;                                                                                                      //
                                                                                                                     //
})();                                                                                                                //
                                                                                                                     //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/nimble_restivus/lib/restivus.coffee.js                                                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var                                                                                                                  //
    indexOf = [].indexOf || function (item) {                                                                        //
  for (var i = 0, l = this.length; i < l; i++) {                                                                     //
    if (i in this && this[i] === item) return i;                                                                     //
  }return -1;                                                                                                        //
};                                                                                                                   //
                                                                                                                     //
this.Restivus = function () {                                                                                        //
  function Restivus(options) {                                                                                       //
    var corsHeaders;                                                                                                 //
    this._routes = [];                                                                                               //
    this._config = {                                                                                                 //
      paths: [],                                                                                                     //
      useDefaultAuth: false,                                                                                         //
      apiPath: 'api/',                                                                                               //
      version: null,                                                                                                 //
      prettyJson: false,                                                                                             //
      auth: {                                                                                                        //
        token: 'services.resume.loginTokens.hashedToken',                                                            //
        user: function user() {                                                                                      //
          var token;                                                                                                 //
          if (this.request.headers['x-auth-token']) {                                                                //
            token = Accounts._hashLoginToken(this.request.headers['x-auth-token']);                                  //
          }                                                                                                          //
          return {                                                                                                   //
            userId: this.request.headers['x-user-id'],                                                               //
            token: token                                                                                             //
          };                                                                                                         //
        }                                                                                                            //
      },                                                                                                             //
      defaultHeaders: {                                                                                              //
        'Content-Type': 'application/json'                                                                           //
      },                                                                                                             //
      enableCors: true                                                                                               //
    };                                                                                                               //
    _.extend(this._config, options);                                                                                 //
    if (this._config.enableCors) {                                                                                   //
      corsHeaders = {                                                                                                //
        'Access-Control-Allow-Origin': '*',                                                                          //
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'                             //
      };                                                                                                             //
      if (this._config.useDefaultAuth) {                                                                             //
        corsHeaders['Access-Control-Allow-Headers'] += ', X-User-Id, X-Auth-Token';                                  //
      }                                                                                                              //
      _.extend(this._config.defaultHeaders, corsHeaders);                                                            //
      if (!this._config.defaultOptionsEndpoint) {                                                                    //
        this._config.defaultOptionsEndpoint = function () {                                                          //
          this.response.writeHead(200, corsHeaders);                                                                 //
          return this.done();                                                                                        //
        };                                                                                                           //
      }                                                                                                              //
    }                                                                                                                //
    if (this._config.apiPath[0] === '/') {                                                                           //
      this._config.apiPath = this._config.apiPath.slice(1);                                                          //
    }                                                                                                                //
    if (_.last(this._config.apiPath) !== '/') {                                                                      //
      this._config.apiPath = this._config.apiPath + '/';                                                             //
    }                                                                                                                //
    if (this._config.version) {                                                                                      //
      this._config.apiPath += this._config.version + '/';                                                            //
    }                                                                                                                //
    if (this._config.useDefaultAuth) {                                                                               //
      this._initAuth();                                                                                              //
    } else if (this._config.useAuth) {                                                                               //
      this._initAuth();                                                                                              //
      console.warn('Warning: useAuth API config option will be removed in Restivus v1.0 ' + '\n    Use the useDefaultAuth option instead');
    }                                                                                                                //
    return this;                                                                                                     //
  }                                                                                                                  //
                                                                                                                     //
  /**                                                                                                                //
    Add endpoints for the given HTTP methods at the given path                                                       //
                                                                                                                     //
    @param path {String} The extended URL path (will be appended to base path of the API)                            //
    @param options {Object} Route configuration options                                                              //
    @param options.authRequired {Boolean} The default auth requirement for each endpoint on the route                //
    @param options.roleRequired {String or String[]} The default role required for each endpoint on the route        //
    @param endpoints {Object} A set of endpoints available on the new route (get, post, put, patch, delete, options)
    @param endpoints.<method> {Function or Object} If a function is provided, all default route                      //
        configuration options will be applied to the endpoint. Otherwise an object with an `action`                  //
        and all other route config options available. An `action` must be provided with the object.                  //
   */                                                                                                                //
                                                                                                                     //
  Restivus.prototype.addRoute = function (path, options, endpoints) {                                                //
    var route;                                                                                                       //
    route = new share.Route(this, path, options, endpoints);                                                         //
    this._routes.push(route);                                                                                        //
    route.addToApi();                                                                                                //
    return this;                                                                                                     //
  };                                                                                                                 //
                                                                                                                     //
  /**                                                                                                                //
    Generate routes for the Meteor Collection with the given name                                                    //
   */                                                                                                                //
                                                                                                                     //
  Restivus.prototype.addCollection = function (collection, options) {                                                //
    var collectionEndpoints, collectionRouteEndpoints, endpointsAwaitingConfiguration, entityRouteEndpoints, excludedEndpoints, methods, methodsOnCollection, path, routeOptions;
    if (options == null) {                                                                                           //
      options = {};                                                                                                  //
    }                                                                                                                //
    methods = ['get', 'post', 'put', 'delete', 'getAll'];                                                            //
    methodsOnCollection = ['post', 'getAll'];                                                                        //
    if (collection === Meteor.users) {                                                                               //
      collectionEndpoints = this._userCollectionEndpoints;                                                           //
    } else {                                                                                                         //
      collectionEndpoints = this._collectionEndpoints;                                                               //
    }                                                                                                                //
    endpointsAwaitingConfiguration = options.endpoints || {};                                                        //
    routeOptions = options.routeOptions || {};                                                                       //
    excludedEndpoints = options.excludedEndpoints || [];                                                             //
    path = options.path || collection._name;                                                                         //
    collectionRouteEndpoints = {};                                                                                   //
    entityRouteEndpoints = {};                                                                                       //
    if (_.isEmpty(endpointsAwaitingConfiguration) && _.isEmpty(excludedEndpoints)) {                                 //
      _.each(methods, function (method) {                                                                            //
        if (indexOf.call(methodsOnCollection, method) >= 0) {                                                        //
          _.extend(collectionRouteEndpoints, collectionEndpoints[method].call(this, collection));                    //
        } else {                                                                                                     //
          _.extend(entityRouteEndpoints, collectionEndpoints[method].call(this, collection));                        //
        }                                                                                                            //
      }, this);                                                                                                      //
    } else {                                                                                                         //
      _.each(methods, function (method) {                                                                            //
        var configuredEndpoint, endpointOptions;                                                                     //
        if (indexOf.call(excludedEndpoints, method) < 0 && endpointsAwaitingConfiguration[method] !== false) {       //
          endpointOptions = endpointsAwaitingConfiguration[method];                                                  //
          configuredEndpoint = {};                                                                                   //
          _.each(collectionEndpoints[method].call(this, collection), function (action, methodType) {                 //
            return configuredEndpoint[methodType] = _.chain(action).clone().extend(endpointOptions).value();         //
          });                                                                                                        //
          if (indexOf.call(methodsOnCollection, method) >= 0) {                                                      //
            _.extend(collectionRouteEndpoints, configuredEndpoint);                                                  //
          } else {                                                                                                   //
            _.extend(entityRouteEndpoints, configuredEndpoint);                                                      //
          }                                                                                                          //
        }                                                                                                            //
      }, this);                                                                                                      //
    }                                                                                                                //
    this.addRoute(path, routeOptions, collectionRouteEndpoints);                                                     //
    this.addRoute(path + "/:id", routeOptions, entityRouteEndpoints);                                                //
    return this;                                                                                                     //
  };                                                                                                                 //
                                                                                                                     //
  /**                                                                                                                //
    A set of endpoints that can be applied to a Collection Route                                                     //
   */                                                                                                                //
                                                                                                                     //
  Restivus.prototype._collectionEndpoints = {                                                                        //
    get: function get(collection) {                                                                                  //
      return {                                                                                                       //
        get: {                                                                                                       //
          action: function action() {                                                                                //
            var entity;                                                                                              //
            entity = collection.findOne(this.urlParams.id);                                                          //
            if (entity) {                                                                                            //
              return {                                                                                               //
                status: 'success',                                                                                   //
                data: entity                                                                                         //
              };                                                                                                     //
            } else {                                                                                                 //
              return {                                                                                               //
                statusCode: 404,                                                                                     //
                body: {                                                                                              //
                  status: 'fail',                                                                                    //
                  message: 'Item not found'                                                                          //
                }                                                                                                    //
              };                                                                                                     //
            }                                                                                                        //
          }                                                                                                          //
        }                                                                                                            //
      };                                                                                                             //
    },                                                                                                               //
    put: function put(collection) {                                                                                  //
      return {                                                                                                       //
        put: {                                                                                                       //
          action: function action() {                                                                                //
            var entity, entityIsUpdated;                                                                             //
            entityIsUpdated = collection.update(this.urlParams.id, this.bodyParams);                                 //
            if (entityIsUpdated) {                                                                                   //
              entity = collection.findOne(this.urlParams.id);                                                        //
              return {                                                                                               //
                status: 'success',                                                                                   //
                data: entity                                                                                         //
              };                                                                                                     //
            } else {                                                                                                 //
              return {                                                                                               //
                statusCode: 404,                                                                                     //
                body: {                                                                                              //
                  status: 'fail',                                                                                    //
                  message: 'Item not found'                                                                          //
                }                                                                                                    //
              };                                                                                                     //
            }                                                                                                        //
          }                                                                                                          //
        }                                                                                                            //
      };                                                                                                             //
    },                                                                                                               //
    "delete": function _delete(collection) {                                                                         //
      return {                                                                                                       //
        "delete": {                                                                                                  //
          action: function action() {                                                                                //
            if (collection.remove(this.urlParams.id)) {                                                              //
              return {                                                                                               //
                status: 'success',                                                                                   //
                data: {                                                                                              //
                  message: 'Item removed'                                                                            //
                }                                                                                                    //
              };                                                                                                     //
            } else {                                                                                                 //
              return {                                                                                               //
                statusCode: 404,                                                                                     //
                body: {                                                                                              //
                  status: 'fail',                                                                                    //
                  message: 'Item not found'                                                                          //
                }                                                                                                    //
              };                                                                                                     //
            }                                                                                                        //
          }                                                                                                          //
        }                                                                                                            //
      };                                                                                                             //
    },                                                                                                               //
    post: function post(collection) {                                                                                //
      return {                                                                                                       //
        post: {                                                                                                      //
          action: function action() {                                                                                //
            var entity, entityId;                                                                                    //
            entityId = collection.insert(this.bodyParams);                                                           //
            entity = collection.findOne(entityId);                                                                   //
            if (entity) {                                                                                            //
              return {                                                                                               //
                statusCode: 201,                                                                                     //
                body: {                                                                                              //
                  status: 'success',                                                                                 //
                  data: entity                                                                                       //
                }                                                                                                    //
              };                                                                                                     //
            } else {                                                                                                 //
              return {                                                                                               //
                statusCode: 400,                                                                                     //
                body: {                                                                                              //
                  status: 'fail',                                                                                    //
                  message: 'No item added'                                                                           //
                }                                                                                                    //
              };                                                                                                     //
            }                                                                                                        //
          }                                                                                                          //
        }                                                                                                            //
      };                                                                                                             //
    },                                                                                                               //
    getAll: function getAll(collection) {                                                                            //
      return {                                                                                                       //
        get: {                                                                                                       //
          action: function action() {                                                                                //
            var entities;                                                                                            //
            entities = collection.find().fetch();                                                                    //
            if (entities) {                                                                                          //
              return {                                                                                               //
                status: 'success',                                                                                   //
                data: entities                                                                                       //
              };                                                                                                     //
            } else {                                                                                                 //
              return {                                                                                               //
                statusCode: 404,                                                                                     //
                body: {                                                                                              //
                  status: 'fail',                                                                                    //
                  message: 'Unable to retrieve items from collection'                                                //
                }                                                                                                    //
              };                                                                                                     //
            }                                                                                                        //
          }                                                                                                          //
        }                                                                                                            //
      };                                                                                                             //
    }                                                                                                                //
  };                                                                                                                 //
                                                                                                                     //
  /**                                                                                                                //
    A set of endpoints that can be applied to a Meteor.users Collection Route                                        //
   */                                                                                                                //
                                                                                                                     //
  Restivus.prototype._userCollectionEndpoints = {                                                                    //
    get: function get(collection) {                                                                                  //
      return {                                                                                                       //
        get: {                                                                                                       //
          action: function action() {                                                                                //
            var entity;                                                                                              //
            entity = collection.findOne(this.urlParams.id, {                                                         //
              fields: {                                                                                              //
                profile: 1                                                                                           //
              }                                                                                                      //
            });                                                                                                      //
            if (entity) {                                                                                            //
              return {                                                                                               //
                status: 'success',                                                                                   //
                data: entity                                                                                         //
              };                                                                                                     //
            } else {                                                                                                 //
              return {                                                                                               //
                statusCode: 404,                                                                                     //
                body: {                                                                                              //
                  status: 'fail',                                                                                    //
                  message: 'User not found'                                                                          //
                }                                                                                                    //
              };                                                                                                     //
            }                                                                                                        //
          }                                                                                                          //
        }                                                                                                            //
      };                                                                                                             //
    },                                                                                                               //
    put: function put(collection) {                                                                                  //
      return {                                                                                                       //
        put: {                                                                                                       //
          action: function action() {                                                                                //
            var entity, entityIsUpdated;                                                                             //
            entityIsUpdated = collection.update(this.urlParams.id, {                                                 //
              $set: {                                                                                                //
                profile: this.bodyParams                                                                             //
              }                                                                                                      //
            });                                                                                                      //
            if (entityIsUpdated) {                                                                                   //
              entity = collection.findOne(this.urlParams.id, {                                                       //
                fields: {                                                                                            //
                  profile: 1                                                                                         //
                }                                                                                                    //
              });                                                                                                    //
              return {                                                                                               //
                status: "success",                                                                                   //
                data: entity                                                                                         //
              };                                                                                                     //
            } else {                                                                                                 //
              return {                                                                                               //
                statusCode: 404,                                                                                     //
                body: {                                                                                              //
                  status: 'fail',                                                                                    //
                  message: 'User not found'                                                                          //
                }                                                                                                    //
              };                                                                                                     //
            }                                                                                                        //
          }                                                                                                          //
        }                                                                                                            //
      };                                                                                                             //
    },                                                                                                               //
    "delete": function _delete(collection) {                                                                         //
      return {                                                                                                       //
        "delete": {                                                                                                  //
          action: function action() {                                                                                //
            if (collection.remove(this.urlParams.id)) {                                                              //
              return {                                                                                               //
                status: 'success',                                                                                   //
                data: {                                                                                              //
                  message: 'User removed'                                                                            //
                }                                                                                                    //
              };                                                                                                     //
            } else {                                                                                                 //
              return {                                                                                               //
                statusCode: 404,                                                                                     //
                body: {                                                                                              //
                  status: 'fail',                                                                                    //
                  message: 'User not found'                                                                          //
                }                                                                                                    //
              };                                                                                                     //
            }                                                                                                        //
          }                                                                                                          //
        }                                                                                                            //
      };                                                                                                             //
    },                                                                                                               //
    post: function post(collection) {                                                                                //
      return {                                                                                                       //
        post: {                                                                                                      //
          action: function action() {                                                                                //
            var entity, entityId;                                                                                    //
            entityId = Accounts.createUser(this.bodyParams);                                                         //
            entity = collection.findOne(entityId, {                                                                  //
              fields: {                                                                                              //
                profile: 1                                                                                           //
              }                                                                                                      //
            });                                                                                                      //
            if (entity) {                                                                                            //
              return {                                                                                               //
                statusCode: 201,                                                                                     //
                body: {                                                                                              //
                  status: 'success',                                                                                 //
                  data: entity                                                                                       //
                }                                                                                                    //
              };                                                                                                     //
            } else {                                                                                                 //
              ({                                                                                                     //
                statusCode: 400                                                                                      //
              });                                                                                                    //
              return {                                                                                               //
                status: 'fail',                                                                                      //
                message: 'No user added'                                                                             //
              };                                                                                                     //
            }                                                                                                        //
          }                                                                                                          //
        }                                                                                                            //
      };                                                                                                             //
    },                                                                                                               //
    getAll: function getAll(collection) {                                                                            //
      return {                                                                                                       //
        get: {                                                                                                       //
          action: function action() {                                                                                //
            var entities;                                                                                            //
            entities = collection.find({}, {                                                                         //
              fields: {                                                                                              //
                profile: 1                                                                                           //
              }                                                                                                      //
            }).fetch();                                                                                              //
            if (entities) {                                                                                          //
              return {                                                                                               //
                status: 'success',                                                                                   //
                data: entities                                                                                       //
              };                                                                                                     //
            } else {                                                                                                 //
              return {                                                                                               //
                statusCode: 404,                                                                                     //
                body: {                                                                                              //
                  status: 'fail',                                                                                    //
                  message: 'Unable to retrieve users'                                                                //
                }                                                                                                    //
              };                                                                                                     //
            }                                                                                                        //
          }                                                                                                          //
        }                                                                                                            //
      };                                                                                                             //
    }                                                                                                                //
  };                                                                                                                 //
                                                                                                                     //
  /*                                                                                                                 //
    Add /login and /logout endpoints to the API                                                                      //
   */                                                                                                                //
                                                                                                                     //
  Restivus.prototype._initAuth = function () {                                                                       //
    var logout, self;                                                                                                //
    self = this;                                                                                                     //
                                                                                                                     //
    /*                                                                                                               //
      Add a login endpoint to the API                                                                                //
                                                                                                                     //
      After the user is logged in, the onLoggedIn hook is called (see Restfully.configure() for                      //
      adding hook).                                                                                                  //
     */                                                                                                              //
    this.addRoute('login', {                                                                                         //
      authRequired: false                                                                                            //
    }, {                                                                                                             //
      post: function post() {                                                                                        //
        var auth, e, error, extraData, ref, ref1, response, searchQuery, user;                                       //
        user = {};                                                                                                   //
        if (this.bodyParams.user) {                                                                                  //
          if (this.bodyParams.user.indexOf('@') === -1) {                                                            //
            user.username = this.bodyParams.user;                                                                    //
          } else {                                                                                                   //
            user.email = this.bodyParams.user;                                                                       //
          }                                                                                                          //
        } else if (this.bodyParams.username) {                                                                       //
          user.username = this.bodyParams.username;                                                                  //
        } else if (this.bodyParams.email) {                                                                          //
          user.email = this.bodyParams.email;                                                                        //
        }                                                                                                            //
        try {                                                                                                        //
          auth = Auth.loginWithPassword(user, this.bodyParams.password);                                             //
        } catch (error) {                                                                                            //
          e = error;                                                                                                 //
          return {                                                                                                   //
            statusCode: e.error,                                                                                     //
            body: {                                                                                                  //
              status: 'error',                                                                                       //
              message: e.reason                                                                                      //
            }                                                                                                        //
          };                                                                                                         //
        }                                                                                                            //
        if (auth.userId && auth.authToken) {                                                                         //
          searchQuery = {};                                                                                          //
          searchQuery[self._config.auth.token] = Accounts._hashLoginToken(auth.authToken);                           //
          this.user = Meteor.users.findOne({                                                                         //
            '_id': auth.userId                                                                                       //
          }, searchQuery);                                                                                           //
          this.userId = (ref = this.user) != null ? ref._id : void 0;                                                //
        }                                                                                                            //
        response = {                                                                                                 //
          status: 'success',                                                                                         //
          data: auth                                                                                                 //
        };                                                                                                           //
        extraData = (ref1 = self._config.onLoggedIn) != null ? ref1.call(this) : void 0;                             //
        if (extraData != null) {                                                                                     //
          _.extend(response.data, {                                                                                  //
            extra: extraData                                                                                         //
          });                                                                                                        //
        }                                                                                                            //
        return response;                                                                                             //
      }                                                                                                              //
    });                                                                                                              //
    logout = function logout() {                                                                                     //
      var authToken, extraData, hashedToken, index, ref, response, tokenFieldName, tokenLocation, tokenPath, tokenRemovalQuery, tokenToRemove;
      authToken = this.request.headers['x-auth-token'];                                                              //
      hashedToken = Accounts._hashLoginToken(authToken);                                                             //
      tokenLocation = self._config.auth.token;                                                                       //
      index = tokenLocation.lastIndexOf('.');                                                                        //
      tokenPath = tokenLocation.substring(0, index);                                                                 //
      tokenFieldName = tokenLocation.substring(index + 1);                                                           //
      tokenToRemove = {};                                                                                            //
      tokenToRemove[tokenFieldName] = hashedToken;                                                                   //
      tokenRemovalQuery = {};                                                                                        //
      tokenRemovalQuery[tokenPath] = tokenToRemove;                                                                  //
      Meteor.users.update(this.user._id, {                                                                           //
        $pull: tokenRemovalQuery                                                                                     //
      });                                                                                                            //
      response = {                                                                                                   //
        status: 'success',                                                                                           //
        data: {                                                                                                      //
          message: 'You\'ve been logged out!'                                                                        //
        }                                                                                                            //
      };                                                                                                             //
      extraData = (ref = self._config.onLoggedOut) != null ? ref.call(this) : void 0;                                //
      if (extraData != null) {                                                                                       //
        _.extend(response.data, {                                                                                    //
          extra: extraData                                                                                           //
        });                                                                                                          //
      }                                                                                                              //
      return response;                                                                                               //
    };                                                                                                               //
                                                                                                                     //
    /*                                                                                                               //
      Add a logout endpoint to the API                                                                               //
                                                                                                                     //
      After the user is logged out, the onLoggedOut hook is called (see Restfully.configure() for                    //
      adding hook).                                                                                                  //
     */                                                                                                              //
    return this.addRoute('logout', {                                                                                 //
      authRequired: true                                                                                             //
    }, {                                                                                                             //
      get: function get() {                                                                                          //
        console.warn("Warning: Default logout via GET will be removed in Restivus v1.0. Use POST instead.");         //
        console.warn("    See https://github.com/kahmali/meteor-restivus/issues/100");                               //
        return logout.call(this);                                                                                    //
      },                                                                                                             //
      post: logout                                                                                                   //
    });                                                                                                              //
  };                                                                                                                 //
                                                                                                                     //
  return Restivus;                                                                                                   //
}();                                                                                                                 //
                                                                                                                     //
Restivus = this.Restivus;                                                                                            //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['nimble:restivus'] = {}, {
  Restivus: Restivus
});

})();

//# sourceMappingURL=nimble_restivus.js.map

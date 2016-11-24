import {Meteor} from 'meteor/meteor';
import {Restivus} from 'meteor/nimble:restivus';
import {Utils as u} from './utils';
// Listen to incoming HTTP requests, can only be used on the server
WebApp.rawConnectHandlers.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});
let Api = new Restivus();

Api.addRoute('postScore', {

  post: function () {

    let h = this.request.headers;
    let b = this.bodyParams;
    if (b && _.isObject(b)) {
      u.logOutput(b);
      b.reflectorID = u.recordRequest(h, b);
      return b;
    } else {
      return {
        message: 'Empty request received from ' + h['x-forwarded-for']
      }
    }
  }
});

Api.addRoute('getBattleScores',{authRequired: false}, {

  get: function () {
    return u.getBattleScores();
  }
});

Api.addRoute('getLeaderBoard', {authRequired: false}, {

  post: function () {
    return u.retrieveData();
  },

  get: function () {
    return u.retrieveData();
  }

});


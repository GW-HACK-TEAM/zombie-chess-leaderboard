import {Records} from '../common/collections';

export var Utils = new class {

  constructor() {

  }

  /**
   * Logs out the request
   * @param header
   * @param request
   */
  logOutput(header, request) {
    console.log(header[['x-forwarded-for']]);
    console.log(request);
  };

  /**
   * Records the contents of the request to be output client side
   * @param request
   * @returns {*}
   */
  recordRequest(header, request) {
    let head = {
      source: header['x-forwarded-for']
    };
    return Records.insert({header: head, bodyParams:request});
  };

  retrieveData(params = null){
    let r = Records.find({}).fetch();
    let filter = _.pluck(r, 'bodyParams');
    return _.sortBy(filter, function(o) { return -o.score; });
  }

  getBattleScores(){
    let r = Records.find({}).fetch();
    let f = _.pluck(r, 'bodyParams');
    let gr = _.groupBy(f, 'side');
    // console.log(g);
    return _(gr).map(function(g, key) {
      return { type: key,
        val: _(g).reduce(function(m,x) { return m + +x.score; }, 0) };
    });
  }

};
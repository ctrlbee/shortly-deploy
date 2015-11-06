var db = require('../config');
var crypto = require('crypto');

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function(){
//     this.on('creating', function(model, attrs, options){
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

var schema = db.Schema({
  url: 'string',
  base_url: 'string',
  code: 'string',
  title: 'string',
  visits: 'number', 
  userid: 'string'
});

schema.pre('save', function(next) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  next();
});

var Link = db.model('Link', schema);



module.exports = Link;

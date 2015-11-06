var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
//var Users = require('../app/collections/users');
//var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({userid: req.session.user.username}, function(err, links){
      console.log("linkys")
      res.send(200, links)
    })

  // Links.reset().fetch().then(function(links) {
  //   res.send(200, links.models);
  // })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.find({url:uri}, function(err, doc){
    console.log(doc)
    if(doc.length){
      res.send(200, doc);
    } else {
      util.getUrlTitle(uri, function(err, title){
        if(err){
          console.log("get title"); 
          return res.send(404); 
        }
        var link = new Link({url: uri, base_url: req.headers.origin, title: title, userid: req.session.user.username, visits:0})
        link.save() 
          .then(function(link){
            res.send(200, link); 
          })
      })
    }
  })


  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.send(200, found.attributes);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.log('Error reading URL heading: ', err);
  //         return res.send(404);
  //       }
  //       var newLink = new Link({
  //         url: uri,
  //         title: title,
  //         base_url: req.headers.origin
  //       });
  //       newLink.save().then(function(newLink) {
  //         Links.add(newLink);
  //         res.send(200, newLink);
  //       });
  //     });
  //   }
  // });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}).exec(function(err, user){
    if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      })
    }
  });

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       })
  //     }
  // });
};

exports.signupUser = function(req, res) {
  //console.log(req.session);
  var uname = req.body.username;
  var pass = req.body.password;

  var newUser = new User({username: uname, password: pass}); 
  newUser.save(function(err, newUser) {
      if(err){console.log(err)}
        util.createSession(req, res, newUser); 
      });

  // User.findOne({username: uname})
  //   .then(function(user) {
  //     util.createSession(req, res, user);
  //   })
  //   .catch(function(err) {
  //     User.create({username: uname, password: pass})
  //       .then(function(user) {
  //         user.save(function(err) {
  //           util.createSession(req, res, this);
  //         })
  //       })
  //   })



  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           Users.add(newUser);
  //           util.createSession(req, res, newUser);
  //         });
  //     } else 
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   });
};

exports.navToLink = function(req, res) {
  Link.findOne({code: req.params[0]}, function(err, link) {
    if (!link) {
      res.redirect("/"); 
    } else {
      link.visits = link.visits + 1; 
      link.save(function(err){
        if(!err){
          return res.redirect(link.url); 
        }
      })
    }
  });


  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};

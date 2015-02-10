var express = require('express');
var router = express.Router();
var async = require('async');

var graph = require('fbgraph');

var conf = {
  client_id: '1430156290609129'
  , client_secret: '6bde565f73874085b66a6d7add55dba4'
  , scope: 'email, user_about_me,user_likes'
  , redirect_uri: 'http://localhost:3000/auth/facebook'
};

router.get('/', function (req, res) {
  res.render("index", {
    picture: {
      data: {
        is_silhouette: false,
        url: 'http://lorempixel.com/400/200'
      }
    }
  });
});

router.get('/auth/facebook', function (req, res) {

  if (!req.query.code) {
    var authUrl = graph.getOauthUrl({
      "client_id": conf.client_id
      , "redirect_uri": conf.redirect_uri
      , "scope": conf.scope
    });

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('access denied');
    }
    return;
  }

  graph.authorize({
    "client_id": conf.client_id
    , "redirect_uri": conf.redirect_uri
    , "client_secret": conf.client_secret
    , "code": req.query.code
  }, function (err, facebookRes) {
    res.redirect('/UserHasLoggedIn');
  });

});


router.get('/UserHasLoggedIn', function (req, res) {
  var Categories = ["Likes", "Events", "Friends", "Interests", "Movies", "Music", "Television", "Books", "Videos", "Places"];
  var tree_object = {};
  tree_object.name = "Jagadeesh";
  tree_object.children = [];
  Categories.forEach(function (category) {
    var tree_object_one = {};
    tree_object_one.name = category;
    tree_object_one.children = [];
    var tree_object_two = {};
    tree_object_two.name = "something";
    tree_object_two.children = [];
    var tree_object_three = {};
    tree_object_three.name = "something";
    tree_object_two.children.push(tree_object_three);
    tree_object_two.children.push(tree_object_three);
    tree_object_two.children.push(tree_object_three);
    tree_object_two.children.push(tree_object_three);
    tree_object_one.children.push(tree_object_two);
    tree_object_one.children.push(tree_object_two);
    tree_object_one.children.push(tree_object_two);
    tree_object.children.push(tree_object_one);
  });
  var options = {
    timeout: 30000
    , pool: {maxSockets: Infinity}
    , headers: {connection: "keep-alive"}
  };
  var fb_likes = {};
  var fs = require('fs');

  async.series(
    [
      function (callback) {
        graph
          .setOptions(options)
          .get("me/likes", function (err, fb_likes) {

            var like_tree_object = {};
            like_tree_object.name = "Likes";
            like_tree_object.children = [];
            fb_likes.data.forEach(function (currentLike) {
              var tree_object_two = {};
              leaf_object = {};
              leaf_object.name = currentLike.name;
              tree_object_two.name = currentLike.category;
              tree_object_two.children = [];
              tree_object_two.children.push(leaf_object);
              var found = like_tree_object.children.filter(function (x) {
                return x.name == currentLike.category
              });
              like_tree_object.children = like_tree_object.children.filter(function (x) {
                return x.name != currentLike.category
              });
              if (found[0]) {
                found[0].children.push(leaf_object);
                like_tree_object.children.push(found[0]);
              } else {
                like_tree_object.children.push(tree_object_two);
              }
            });
            tree_object.children[0] = like_tree_object;
            callback(null, tree_object.children[0]);
          });
      },
      function (callback) {
        graph
          .setOptions(options)
          .get("me/movies", function (err, fb_movies) {
            movie_object = {};
            movie_object.name = "Movies";
            movie_object.children = [];
            fb_movies.data.forEach(function (movie) {
              movie_object_one = {};
              movie_object_one.name = movie.name;
              movie_object.children.push(movie_object_one);
            });
            callback(null, movie_object);
          });
      },
      function (callback) {
        graph
          .setOptions(options)
          .get("me/music", function (err, fb_music) {
            music_object = {};
            music_object.name = "Music";
            music_object.children = [];
            fb_music.data.forEach(function (music) {
              music_object_one = {};
              music_object_one.name = music.name;
              music_object.children.push(music_object_one);
            });
            callback(null, music_object);
          });
      },
      function (callback) {
        graph
          .setOptions(options)
          .get("me/television", function (err, fb_tv) {
            tv_object = {};
            tv_object.name = "Television";
            tv_object.children = [];
            fb_tv.data.forEach(function (tv) {
              tv_object_one = {};
              tv_object_one.name = tv.name;
              tv_object.children.push(tv_object_one);
            });
            callback(null, tv_object);
          });
      },
      function (callback) {
        graph
          .setOptions(options)
          .get("me/books", function (err, fb_books) {
            book_object = {};
            book_object.name = "Books";
            book_object.children = [];
            fb_books.data.forEach(function (book) {
              book_object_one = {};
              book_object_one.name = book.name;
              book_object.children.push(book_object_one);
            });
            callback(null, book_object);
          });
      },
      function (callback) {
        graph
          .setOptions(options)
          .get("me/interests", function (err, fb_int) {
            console.log(fb_int);
            int_object = {};
            int_object.name = "Interests";
            int_object.children = [];
            fb_int.data.forEach(function (int) {
              int_object_one = {};
              int_object_one.name = int.name;
              int_object.children.push(int_object_one);
            });
            callback(null, int_object);
          });
      }
    ],
    function (err, results) {
      tree_object.children[0] = results[0];
      tree_object.children[4] = results[1];
      tree_object.children[5] = results[2];
      tree_object.children[6] = results[3];
      tree_object.children[7] = results[4];
      tree_object.children[3] = results[5];
      fs.writeFile("public/tree.json", JSON.stringify(tree_object), function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("The file was saved!");
        }
      });
      res.send(tree_object);
    });
});

router.get('/bubbles', function (req, res) {
  res.render('bubbles');
});

router.get('/tree', function (req, res) {
  res.render('tree');
});

module.exports = router;

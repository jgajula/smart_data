var express = require('express');
var router = express.Router();

var graph = require('fbgraph');


var conf = {
    client_id:      '1430156290609129'
    , client_secret:  '6bde565f73874085b66a6d7add55dba4'
    , scope:          'email, user_about_me,user_likes'
    , redirect_uri:   'http://localhost:3000/auth/facebook'
};

router.get('/', function(req, res){


    res.render("index", { picture:
    { data:
    { is_silhouette: false,
        url: 'http://lorempixel.com/400/200'
    }}});
});



router.get('/auth/facebook', function(req, res) {

    // we don't have a code yet
    // so we'll redirect to the oauth dialog
    if (!req.query.code) {
        var authUrl = graph.getOauthUrl({
            "client_id":     conf.client_id
            , "redirect_uri":  conf.redirect_uri
            , "scope":         conf.scope
        });

        if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
            res.redirect(authUrl);
        } else {  //req.query.error == 'access_denied'
            res.send('access denied');
        }
        return;
    }

    // code is set
    // we'll send that and get the access token
    graph.authorize({
        "client_id":      conf.client_id
        , "redirect_uri":   conf.redirect_uri
        , "client_secret":  conf.client_secret
        , "code":           req.query.code
    }, function (err, facebookRes) {
        res.redirect('/UserHasLoggedIn');
    });


});


router.get('/UserHasLoggedIn', function(req, res) {
    var Categories = ["Likes","Events","Friends","Interests","Movies","Music","Television","Books","Videos","Places"];
    var tree_object = {};
    tree_object.name = "Jagadeesh";
    tree_object.children = [];
    Categories.forEach(function(category){
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
        timeout:  30000
        , pool:     { maxSockets:  Infinity }
        , headers:  { connection:  "keep-alive" }
    };
    var fb_likes = {};

    var fs = require('fs');


    graph
        .setOptions(options)
        .get("me/likes", function(err, fb_likes) {

            console.log(fb_likes);
            var like_tree_object = {};
            like_tree_object.name = "Likes";
            like_tree_object.children = [];
            fb_likes.data.forEach(function(currentLike) {
                var tree_object_two = {};
                leaf_object = {};
                leaf_object.name = currentLike.name;

                ////if (fb_likes.children) {
                //fb_likes.data.children.search(function (x) {
                //        return x.name == currentLike.category
                //    }).children.push(leaf_object);
                ////}else {
                ////    tree_object_two = {};
                ////}
                tree_object_two.name = currentLike.category;
                tree_object_two.children = [];

                tree_object_two.children.push(leaf_object);
               //like_tree_object.children.push(tree_object_two);

                var found = like_tree_object.children.filter(function(x){return x.name == currentLike.category});
                like_tree_object.children = like_tree_object.children.filter(function(x){return x.name != currentLike.category});

                if(found[0]){
                   found[0].children.push(leaf_object);
                   like_tree_object.children.push(found[0]);
               }else {
                   like_tree_object.children.push(tree_object_two);
               }
                //console.log("not found secanior found = "+found)
               // found[0].children.push(leaf_object);
               // like_tree_object.children.push(tree_object_two);

               // console.log("found from filter--"+currentLike.category);
               // console.log(found[0].children);
            });
            tree_object.children[0] = like_tree_object;
            fs.writeFile("public/tree.json", JSON.stringify(tree_object), function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("The file was saved!");
                }
            });
        res.render('loggedin');
        });



});


router.get('/bubbles',function(req,res){
   res.render('bubbles');
});

router.get('/tree',function(req,res){
    res.render('tree');
})


///* GET home page. */
//router.get('/', function(req, res, next) {
//    graph.get("zuck", function(err, graphres) {
//        console.log(graphres); // { id: '4', name: 'Mark Zuckerberg'... }
//        res.send(graphres);
//    });
//
//  // res.render('index', { title: 'Express' });
//});

module.exports = router;

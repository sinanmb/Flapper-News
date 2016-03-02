/**
 * Created by Sinan on 2/28/16.
 */
var app = angular.module('flapperNews', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: ['posts', function (posts) {
                        return posts.getAll();
                    }]
                }
            })

            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
            });

        $urlRouterProvider.otherwise('home');
    }
]);

app.factory('posts', ['$http', function ($http) {
    var o = {
        posts: [{title: 'Hello', link: '', upvotes: 0}]
    };
    o.getAll = function () {
        return $http.get('/posts')
            .success(function (data) {
            console.log('data: ', data);
            o.posts = data;
            //angular.copy(data, o.posts);
        });
    };


    o.get = function (id) {
        return $http.get('/posts/' + id)
            .then(function (res) {
                return res.data;
            })
    };

    o.create = function (post) {
        return $http.post('/posts', post)
            .success(function (data) {
                o.posts.push(data);
            });
    };

    o.upvote = function (post) {
        return $http.put('/post/' + post._id + '/upvote')
            .success(function () {
                post.upvotes++;
            });
    };

    o.addComment = function (post, comment) {
        return $http.post('/posts/'+post._id+'/comments', comment);
    };

    o.upvoteComment = function (post, comment) {
        return $http.put('/posts/'+post._id+'/comments/'+comment._id+'/upvote');
    };


    return o;
}]);

app.controller('MainCtrl', [
    '$scope', 'posts',
    function ($scope, posts) {

        $scope.posts = posts.posts;

        $scope.addPost = function () {
            if (!$scope.title || $scope.title === '') {
                return;
            }
            posts.create({
                title: $scope.title,
                link: $scope.link
            });
            $scope.title = '';
            $scope.link = '';
        };

        $scope.incrementUpvotes = function (post) {
            posts.upvote(post);
        };
    }]);

app.controller('PostsCtrl', ['$scope', '$stateParams', 'posts', 'post', function ($scope, $stateParams, posts, post) {
    $scope.post = post;
    console.log('post: ', post);

    $scope.addComment = function () {
        if (!$scope.body || $scope.body === '') {
            return;
        }

        var comment = {
            body: $scope.body,
            author: 'user'
        };

        posts.addComment(post, comment)
            .success(function (data){
                $scope.post.comments.push(data);
        });

        $scope.body = '';
    };

    $scope.incrementUpvotes = function (comment) {
        posts.upvoteComment(post, comment).success(function (){
            comment.upvotes++;
        })
    }
}]);
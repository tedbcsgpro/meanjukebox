//app.js

(function () {
    'use strict';

    angular.module('jukebox', ['ui.bootstrap'])
        .directive('tbAudioplayer', AudioPlaylist)
        .directive('tbAudio', AudioPlayer);
    
 
    function AudioPlaylist() {
return {
            restrict: 'E',
            template: '<div class="container"><div class="row" ng-repeat="folder in vm.folders | orderBy:\'folderTitle\':false"><div class="col-sm-12"><button ng-click="vm.openFolderPlayer(folder)" class="btn btn-default" style="width:100%;margin-top:10px;">{{ folder.folderTitle }}</button></div></div></div>',
            scope: {
                audiourl: '@audiourl'
            },
            controller: ['$scope', '$http', '$modal', function ($scope, $http, $modal) {
            var self = this;
            self.folders = [];
            self.predicate='folderTitle';
            
                    $http.get('http://' + $scope.audiourl)
                    .success(function (data) {
                        self.folders = data;
                    });
                    
                    self.openFolderPlayer = function (folder) {
                            self.modalInstance = $modal.open({
                            template: '<div class="modal-header"><div class="pull-right"><button class="btn btn-primary" ng-click="folderPlayerCtrl.ok()">X</button></div><h3 class="modal-title">{{folderPlayerCtrl.folder.folderTitle}}</h3></div><div class="modal-body"> <tb-audio></tb-audio><ul class="list-unstyled"><li ng-repeat="song in folderPlayerCtrl.folder.songs"> <button ng-click="folderPlayerCtrl.play(song)" ng-class="{active:folderPlayerCtrl.lastSongIdx === $index}"  class="btn btn-default" style="width:100%;margin-top:5px;">{{song.songTitle}}</button> </li> </ul> </div> <div class="modal-footer"> <button class="btn btn-primary" ng-click="folderPlayerCtrl.ok()">X</button> </div>',
                                controller: function ($scope, $modalInstance, folder) {
                                var self = this;
                                self.folder = folder;
                                self.lastSongIdx = 0;
                                
                                self.play = function (song) {
                                    self.lastSongIdx = findIndexByKeyValue(folder.songs, 'songFile', song.songFile);
                                    $scope.$broadcast('playSong');
                                }
                                self.ok = function () {
                                    $modalInstance.close();
                                };

                                $scope.$on('setSongIdx', function (event, args) { 
                                    self.lastSongIdx = args.idx;
                                });

                            },
                            controllerAs: 'folderPlayerCtrl',
                            resolve: {
                                    folder: function () {
                                        return folder;
                                    }
                                },
                                backdrop: 'static'
                            });
                        }

                }],
                controllerAs:'vm'
        };


    }
    
   
    function AudioPlayer() {
        return {
            restrict: 'E', 
            template: '<audio id="tb-audio" controls autoplay style="width:100%;line-height:100px;"></audio>',
            link: function (scope, element, attrs) {
                console.log('link invoked');
               
                var children = element.children(),
                    player = angular.element((children.length > 0 && children[0].id == 'tb-audio') ? children[0] : null);
                
                player[0].volume = .5;

                if (player.length>0) {
                    player.on('ended', playNextSong);
                }

                function playLastSong() {
                    if (player.length>0) {
                        player[0].src = scope.folderPlayerCtrl.folder.songs[scope.folderPlayerCtrl.lastSongIdx].songFile;
                        player[0].play();
                    }
                }
                
                function playNextSong(event){
                    
                    var nextIdx = 0;
                    if (scope.folderPlayerCtrl.lastSongIdx + 1 < scope.folderPlayerCtrl.folder.songs.length) {
                        nextIdx= scope.folderPlayerCtrl.lastSongIdx + 1
                    }
                    scope.$apply(function () {
                        scope.$emit('setSongIdx', {
                            idx : nextIdx
                        });
                        playLastSong();
                    });
                }
                
                scope.$on('playSong', function () {
                    playLastSong();
                });

                playLastSong();

            }

        }
    }
 
    function findIndexByKeyValue(obj, key, value) {
        for (var i = 0; i < obj.length; i++) {
            if (obj[i][key] == value) {
                return i;
            }
        }
        return null;
    }
 
})();


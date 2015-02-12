//app.js

(function () {
    'use strict';

    angular.module('jukebox', ['ui.bootstrap'])
        .directive('tbAudioplayer', AudioPlaylist)
        .directive('tbAudio', AudioPlayer);
    

    function AudioPlaylist() {
        return {
                restrict: 'E',
                template: '<div class="container"><div class="row" ng-repeat="folder in vm.folders | limitTo:10"><div class="col-sm-12"><button ng-click="vm.openFolderPlayer(folder)" class="btn btn-default" style="width:100%;margin-top:10px;">{{ folder.folderTitle }}</button></div></div></div>',
                scope: {
                audiourl: '@audiourl'
                },
                controller: ['$scope', '$http', '$modal', function ($scope, $http, $modal) {
                    var self = this;
                    self.folders = [];
            
                    $http.get('http://' + $scope.audiourl)
                    .success(function (data) {
                        self.folders = data;
                    });
                    
                    self.openFolderPlayer = function (folder) {
                            self.modalInstance = $modal.open({
                            template: '<div class="modal-header"> <center><h3 class="modal-title">{{folderPlayerCtrl.folder.folderTitle}}</h3></center> </div><div class="modal-body"> <tb-audio></tb-audio><ul class="list-unstyled"><li ng-repeat="song in folderPlayerCtrl.folder.songs"> <button ng-click="folderPlayerCtrl.play(song)" ng-class="{active:folderPlayerCtrl.lastSongIdx === $index}"  class="btn btn-default" style="width:100%;margin-top:5px;">{{song.songTitle}}</button> </li> </ul> </div> <div class="modal-footer"> <button class="btn btn-primary" ng-click="folderPlayerCtrl.ok()">OK</button> </div>',
                                controller: function ($scope, $modalInstance, folder) {
                                var self = this;
                                self.folder = folder;
                                self.lastSongIdx = 0;
                                
                                self.play = function (song) {
                                    var player = document.getElementById('tb-audio');
                                    self.lastSongIdx = findIndexByKeyValue(folder.songs, 'songFile', song.songFile);
                                    player.src = song.songFile;
                                    player.play();
                                }
                                self.ok = function () {
                                    $modalInstance.close();
                                };
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
                console.log(scope);
                element[0].children[0].src = scope.folderPlayerCtrl.folder.songs[scope.folderPlayerCtrl.lastSongIdx].songFile;
                element[0].children[0].play();
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


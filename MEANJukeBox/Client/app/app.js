//app.js

(function () {
    var app = angular.module('jukebox', ['ui.bootstrap']);
    
        
    app.directive('folderList', function() {
        return {
            restrict: 'E',
            template: '<button ng-click="folderListCtrl.openModal(folder)" ng-repeat="folder in folderListCtrl.folders | limitTo: 15" class="btn" style="margin:5px 2px 0px 2px;width:310px">{{ folder.folderTitle }}</button>',
            scope: {
                audiourl : '@audiourl'
            },
            controller: ['$scope', '$http', '$modal', function ($scope, $http, $modal) {
                    var self = this;
                    self.folders = [];
                    self.curFolderIdx = 0;
                    self.curSongIdx = 0;
                    console.log($scope.audiourl);
                    
                    $http.get('http://' + $scope.audiourl)
                    .success(function (data) {
                        self.folders = data;
                    });
                    
                    self.openModal = function (folder) {
                        
                        var modalInstance = $modal.open({
                            template: '<div class="modal-header"> <h4 class="modal-title">{{modalCtrl.folder.folderTitle}}</h4> </div> <div class="modal-body"> <tb-audioplayer></tb-audioplayer><ul class="list-unstyled"><li ng-repeat="song in modalCtrl.folder.songs"> <button ng-click="modalCtrl.play(song)" ng-class="{active:modalCtrl.lastSongIdx == $index}"  class="btn btn-default" style="width:100%;margin-top:5px;">{{song.songTitle}}</button> </li> </ul> </div> <div class="modal-footer"> <button class="btn btn-primary" ng-click="modalCtrl.ok()">OK</button> </div>',
                            controller: 'audioListCtrl as modalCtrl',
                            resolve: {
                                files: function () {
                                    return self.data;
                                },
                                folder: function () {
                                    return folder;
                                }
                            },
                            backdrop: 'static'
                        });
                    };

                }],
            controllerAs: 'folderListCtrl'
        };

    });
    
   
    app.directive('tbAudioplayer', ['$http', '$document', function ($http, $document) {
          
        return {
            template: '<audio id="audioPlayer" controls preload="metadata" autoplay" style="width:100%">Your browser does not suppor the audio element.</audio>',
            link: function (scope, element, attrs) {
                    var player = element[0].children[0];
                    
                    // play first song
                    player.volume = .5;
                    player.src = scope.modalCtrl.folder.songs[scope.modalCtrl.lastSongIdx].songFile;
                    player.play();
                    player.addEventListener('ended', function () {
                        if (scope.modalCtrl.lastSongIdx < scope.modalCtrl.folder.songs.length) {
                            scope.modalCtrl.lastSongIdx = scope.modalCtrl.lastSongIdx + 1;
                            player.src = scope.modalCtrl.folder.songs[scope.modalCtrl.lastSongIdx].songFile;
                            player.play();
                        }
                    });
                }

        };
    }]);
    
    app.controller('audioListCtrl', function ($scope, $modalInstance, files, folder) {
        var self = this;
        self.files = files;
        self.folder = folder;
        self.player;
        self.lastSongIdx = 0;
      
        
        self.ok = function () {
            $modalInstance.close();
        };
       
        self.play = function (song) {
            self.player = document.getElementById('audioPlayer');
            self.lastSongIdx = findIndexByKeyValue(folder.songs, 'songFile', song.songFile);
            self.player.src = song.songFile;
            self.player.play();
        };

        console.log(document.getElementById('audioPlayer'));
       
    });


   
})();

function findIndexByKeyValue(obj, key, value) {
    for (var i = 0; i < obj.length; i++) {
        if (obj[i][key] == value) {
            return i;
        }
    }
    return null;
}
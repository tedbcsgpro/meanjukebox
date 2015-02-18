(function () {
    'use strict';

    angular.module('jukebox', ['ui.bootstrap'])
    .config(function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://metated.net/audio/**']);
    })
    .controller('foldersCtrl', FoldersCtrl)
    .factory('httpService', ['$http', HTTPService])
    .directive('tbAudioPlayer', AudioPlayerDirective);
    
       
    AudioPlayerDirective.$inject = ['$timeout'];
    function AudioPlayerDirective($timeout) {
        return {
            restrict: 'E',
            template: '<span class="marquis" id="foldermarquis"></span><span class="marquis" id="songmarquis"></span><br /><audio controls></audio>',
            link: function (scope, iElem, iAttrs) {
                console.log('link');
               
                var player = angular.element(iElem.children()[iElem.children().length - 1]);
                // this is "sharing" the created marquis and audio elements via the global, root scope
                scope.player = player[0];
                scope.songmarquis = iElem.children()[iElem.children().length - 3];
                scope.foldermarquis = iElem.children()[iElem.children().length - 4];
            }
        }
    } 
    
    FoldersCtrl.$inject = ['$scope', '$http', '$timeout', 'httpService'];
    function FoldersCtrl($scope, $http, $timeout, httpService) {
        var self = this;
        self.restUrl = "metated.net/api/audiofiles",
        self.currentFolder,
        self.currentSong,
        // this is retreiving the marquis and audio elements via childScope, inheriting from rootscope
        self.songmarquis = $scope.songmarquis
        self.foldermarquis = $scope.foldermarquis
        self.player = $scope.player;

        console.log('FoldersCtrl')
        console.log($scope.songmarquis);
        angular.element(self.player).on('ended', ended);

        httpService.getSongList(self.restUrl).then(function (data){
            self.folders = data;
            //window.songdata = data;
        });
        
        self.playAll = function (folder) {
            self.currentFolder = folder;
            self.playSong(folder.songs[0]);
        };

        self.playSong = function (song) {
            self.currentSong = song;
            self.currentFolder = findFolderBySong(self.folders, self.currentSong)
            self.player.src = self.currentSong.songFile;
            self.player.play();
            self.foldermarquis.innerText = self.currentFolder.folderTitle
            self.songmarquis.innerText = self.currentSong.songTitle;
           
        };

        function ended(event, args) {
            $timeout(function (event, args) {
                var curIdx,
                    numSongs;
                if (self.currentFolder) {
                    numSongs = self.currentFolder.songs.length-1;
                    curIdx = findIndexByKeyValue(self.currentFolder.songs, "songTitle", self.currentSong.songTitle);
                    if ((curIdx + 1) < numSongs) {
                       self.playSong(self.currentFolder.songs[curIdx+1])
                    } else {
                        self.playAll(self.currentFolder);
                    }
                }
            
            },0);
        }

    }
    
  
    
    function HTTPService($http) {
        
        var factory = {};
        factory.getSongList = function (audiourl) {
            return $http.get('http://' + audiourl)
            .then(function (result) {
                return result.data;
            });
        };
        return factory;
    }

    function findIndexByKeyValue(obj, key, value) {
        for (var i = 0; i < obj.length; i++) {
            if (obj[i][key] == value) {
                return i;
            }
        }
        return null;
    }
 
    function findFolderBySong(folderCollection, song) {
        for (var i = 0; i < folderCollection.length; i++) {
            var songs = folderCollection[i].songs
            for (var t = 0; t < songs.length;t++)
                {
                     if (folderCollection[i].songs[t] === song) {
                        return folderCollection[i];
                    }
                }
        }
        return null;
    }
})();


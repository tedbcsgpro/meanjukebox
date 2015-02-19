// site.js
(function () {
    'use strict';

    angular.module('jukebox', ['ui.bootstrap'])
    .config(function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://metated.net/audio/**']);
    })
    .controller('playListCtrl', PlayListControl)
    .factory('httpService', ['$http', HTTPService])
    .factory('helperServices', ['$http', HelperServices])
    .directive('tbAudioPlayer', AudioPlayerDirective);
    
       
    AudioPlayerDirective.$inject = ['$timeout', 'helperServices'];
    function AudioPlayerDirective($timeout, helperServices) {
        return {
            restrict: 'E',
            template: '<span class="marquis" id="foldermarquis">{{playerVM.folder.folderTitle}}</span><span class="marquis" id="songmarquis">{{playerVM.song.songTitle}}</span><br /><audio src={{playerVM.song.songFile}} controls autoplay></audio>',
            controller: function ($scope) {
                console.log('playerVMController');
                console.log($scope);
                var self = this;
                self.song,
                self.songIdx = 0,
                self.folder,
                self.playNextSong = true; // TODO: bind to checkbox, default to checked, to allow specifying playing next song in list
                
                $scope.ended = function (event, args) {
                    console.log('ended')
                    if (self.playNextSong) {
                        var newIdx = self.songIdx + 1;
                        if (newIdx < self.folder.songs.length - 1) {
                            $timeout(function () {
                                self.song = self.folder.songs[newIdx]
                                self.songIdx = newIdx;
                                $scope.$broadcast('song-changed', { song: self.song, folder: self.folder });
                            },0)
                            
                        }
                    }
                };

                $scope.$on('play-song', function (event, args) {
                    if (args.folder) { 
                        self.folder = args.folder;
                        if (args.song) {
                            self.song = args.song;
                        } else {
                            self.song = folder.songs[0];
                        }
                        self.songIdx = helperServices.findIndexByKeyValue(self.folder.songs, "songTitle", self.song.songTitle);
                    }
                });

            },
            controllerAs:'playerVM',
            link: function (scope, iElem, iAttrs) {
                console.log('link');
                scope.player = angular.element(iElem.children()[iElem.children().length - 1]);
                scope.player.on('ended', scope.ended);
            }
        }
    } 
    
    
    // retrieves songs from httpService, manages playlist events, informs audioplayer what to play
    // hanldes playAll and playSong user events
    PlayListControl.$inject = ['$scope', '$http', '$timeout', 'httpService', 'helperServices'];
    function PlayListControl($scope, $http, $timeout, httpService, helperServices) {
        var self = this;
        self.restUrl = "metated.net/api/audiofiles",
        self.currentFolder,
        self.currentSong,
        self.folders = [];
        
        console.log('PlayListControl');

        // fetch audio json
        httpService.getSongList(self.restUrl).then(function (data) {
            self.folders = data;
        });
        
        self.playAll = function (folder) {
            self.currentFolder = folder;
            $scope.$emit('play-song', {song:null, folder:folder})
        };

        self.playSong = function (song) {
            self.currentSong = song;
            self.currentFolder = helperServices.findFolderBySong(self.folders, self.currentSong)
            $scope.$emit('play-song', { song:self.currentSong, folder:self.currentFolder })
        };

        $scope.$on('song-changed', function (event, args) {
            self.currentSong = args.song;
            self.currentFolder = args.folder;
        });
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
    
 
    function HelperServices() {
        var factory = {};
       
        factory.findIndexByKeyValue = function(obj, key, value) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i][key] == value) {
                    return i;
                }
            }
            return null;
        }

        factory.findFolderBySong = function(folderCollection, song) {
            for (var i = 0; i < folderCollection.length; i++) {
                var songs = folderCollection[i].songs
                for (var t = 0; t < songs.length; t++) {
                    if (folderCollection[i].songs[t] === song) {
                        return folderCollection[i];
                    }
                }
            }
            return null;
        }

        return factory;
    }
    

})();


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
                self.folder,
                self.currentSong,
                self.playNextSong = true; // TODO: bind to checkbox, default to checked, to allow specifying playing next song in list
                
                $scope.ended = function (event, args) {
                    if (self.playNextSong) {

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
                    }
                });

                

            },
            controllerAs:'playerVM',
            link: function (scope, iElem, iAttrs) {
                console.log('link');
                //console.log(scope);
                scope.player = angular.element(iElem.children()[iElem.children().length - 1]);
                scope.player.on('ended', scope.ended);
                //player.on('ended', function (event, args) {
                 //   scope.$broadcast('song-ended');
                //});
                //scope.player = player[0];
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
        
        angular.element(self.player).on('ended', ended);

        self.playAll = function (folder) {
            self.currentFolder = folder;
            $scope.$emit('play-song', {song:null, folder:folder})
        };

        self.playSong = function (song) {
            self.currentSong = song;
            self.currentFolder = helperServices.findFolderBySong(self.folders, self.currentSong)
            $scope.$emit('play-song', { song:self.currentSong, folder:self.currentFolder })
        };

        function ended(event, args) {
            $timeout(function (event, args) {
                var curIdx,
                    numSongs;
                if (self.currentFolder) {
                    numSongs = self.currentFolder.songs.length-1;
                    curIdx = helperServices.findIndexByKeyValue(self.currentFolder.songs, "songTitle", self.currentSong.songTitle);
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


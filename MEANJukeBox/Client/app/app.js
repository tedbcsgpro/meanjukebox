(function () {
    'use strict';

    angular.module('jukebox', ['ui.bootstrap'])
    .config(['$sceDelegateProvider', function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://metated.net/audio/**']);
    }])
    .controller('playListCtrl', PlayListControl)
    .factory('httpService', HTTPService)
    .factory('helperServices', HelperServices)
    .directive('tbAudioPlayer', AudioPlayerDirective)
    .directive('closeAllGroups', CloseAllGroupsDirective);

    
    CloseAllGroupsDirective.$inject = ['$timeout', 'helperServices'];
    function CloseAllGroupsDirective($timeout, helperServices) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                console.log('linked');
                angular.element(element).on('click', function (event, args) {
                    console.log('clicked');
                    helperServices.closeAllGroups();
                });
            }
        }
    }
    

    AudioPlayerDirective.$inject = ['$timeout', 'helperServices'];
    function AudioPlayerDirective($timeout, helperServices) {
        return {
            restrict: 'E',
            template: '<span class="marquis" id="foldermarquis">{{playerVM.folder.folderTitle}}</span><span class="marquis" id="songmarquis">{{playerVM.song.songTitle}}</span><br /><audio src={{playerVM.song.songFile}} controls autoplay></audio>',
            controller: ['$scope', function ($scope) {
                var self = this;
                self.song,
                self.songIdx = 0,
                self.folder,
                self.playNextSong = true; // TODO: bind to checkbox, default to checked, to allow specifying playing next song in list

                
                $scope.ended = function (event, args) {
                        console.log(event);
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

            }],
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

        
        $scope.$on('close-all', function (event, args) {
            console.log('close-all');
            self.groupOpen = !self.groupOpen;
        });
                
    }
    
    HTTPService.$inject = ['$http'];
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
        
        factory.closeAllGroups = function () {
            
            var ins = document.getElementsByClassName("in");
            var len = ins.length - 1;
            for (var i = len; i >= 0; i--) {
                angular.element(ins[i]).removeClass("in");
            }
        }
        return factory;
    }
    

})();


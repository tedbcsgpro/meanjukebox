(function () {
    'use strict';

    angular.module('jukebox', ['ui.bootstrap'])
    .config(function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://metated.net/audio/**']);
    })
    .controller('foldersCtrl', FoldersCtrl)
    .factory('httpService', ['$http', HTTPService]);
    
    
    FoldersCtrl.$inject = ['$scope', '$http', 'httpService'];
    function FoldersCtrl($scope, $http, httpService) {

        var self = this;
        self.restUrl = "metated.net/api/audiofiles",
        self.currentFolder,
        self.currentSong,
        self.player = document.getElementById('audioplayer');
        
        angular.element(self.player).on('ended', ended);

        httpService.getSongList(self.restUrl).then(function (data){
            self.folders = data;
        });
        
        self.playAll = function (folder) {
            self.currentFolder = folder;
            self.currentSong = folder.songs[0].songFile;
            self.player.src = self.currentSong;
            self.player.play();
        };

        self.playSong = function (song) {
            self.currentSong = song.songFile;
            self.player.src = self.currentSong;
            self.player.play();
        };

        function ended(event, args) {
            if (self.currentFolder) {
                

            }
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

 
})();


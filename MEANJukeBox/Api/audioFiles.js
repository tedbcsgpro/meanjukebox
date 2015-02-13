// GetFiles
// generates a flattened array of parent-child Folder -> Songs objects for any given nested set of audio files in a file structure
var audioFiles = function () {
    
    
    var fs = require('fs');
    var self = this;
    
    self.getFiles = function (audioFolderPath, audioBaseUrl) {
        if (!audioFolderPath || !audioBaseUrl) {
            throw new Error('audioFiles.getFiles method requires audioFolderPath and audioBaseUrl arguments');
        }
        self.AUDIO_FOLDERPATH = audioFolderPath;
        self.AUDIO_BASEURL = audioBaseUrl;
        return getFiles_(self.AUDIO_FOLDERPATH);
    };
    
    var getFiles_ = function (folder, files_, parentFolder_) {
        var hasFiles = false, 
            name = '';
        
        files_ = files_ || [];
        
        var files = fs.readdirSync(folder).filter(function (file) {
            return (file.substr(-4) === ".mp3" || fs.statSync(folder + "/" + file).isDirectory());
        });
        
        
        for (var i in files) {
            name = folder + '/' + files[i];
            if (!fs.statSync(name).isDirectory()) {
                hasFiles = true;
                break;
            }
        }
        
        if (hasFiles) {
            name = folder.replace((self.AUDIO_FOLDERPATH + '/'), '');
            name = name.replace('/', ' ')
            parentFolder_ = { folderPath: folder.replace(self.AUDIO_FOLDERPATH, ''), folderTitle: name, songs: [] };
            files_.push(parentFolder_);
        }
        
        for (var i in files) {
            name = folder + '/' + files[i];
            songUrl = folder.replace(self.AUDIO_FOLDERPATH, self.AUDIO_BASEURL) + '/' + files[i];
            if (fs.statSync(name).isDirectory()) {
                getFiles_(name, files_);
            } else {
                parentFolder_.songs.push({ songTitle: files[i].replace('.mp3', ''), songFile: songUrl });
            }
        }
        
        return files_;
    };
};

module.exports = audioFiles;



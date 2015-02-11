

// GetFiles
// generates a flattened array of parent-child Folder -> Songs objects for any given nested set of audio files in a file structure
var audioFiles = function () {
    
    var fs = require('fs');
    var self = this;
    var AUDIO_DIRPATH = '';
   

    self.getFiles = function (path) {
        AUDIO_DIRPATH = path;
        var files = getFiles_(path);
        //var ret = { files: [] };
        //ret.files.push(files);
        return files;
    };
    
    var getFiles_ = function(folder, files_, parentFolder_) {
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
            var arNames = folder.split("/")
            name = arNames[arNames.length - 1];
            name = name.replace('/', '-');
            parentFolder_ = { folderPath: folder.replace(AUDIO_DIRPATH,''), folderTitle: name, songs: [] };
            files_.push(parentFolder_);
        }
        
        for (var i in files) {
            
            name = folder + '/' + files[i];
            
            if (fs.statSync(name).isDirectory()) {
                getFiles_(name, files_);
            } else {
                parentFolder_.songs.push({ songTitle: files[i].replace('.mp3',''), songFile:files[i]});
            }
        }
        
        return files_;
    };
 
   

};

module.exports = audioFiles;



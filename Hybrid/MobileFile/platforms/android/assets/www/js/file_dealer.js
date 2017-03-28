/**
 * Created by linkang on 17/03/2017.
 */
function FileDealer() {

}

var  fileDealer = new FileDealer();

function errorHandler(e) {
    var msg = '';

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    }

    console.log('Error: ' + msg);
}

/*笔记*/
function toArray(list) {
    return Array.prototype.slice.call(list || [], 0);
}
//笔记
FileDealer.prototype.openEntry = function (entry,callBack) {
    var dirReader = entry.createReader();
    var entries = [];
    // Call the reader.readEntries() until no more results are returned.
    var readEntries = function() {
        dirReader.readEntries (function(results) {
                // listResults(entries.sort());
                //笔记
            if (!results.length ){
                fileDealer.sortFils(entries);
                callBack(entries);
            }else{
                entries = entries.concat(toArray(results));
                readEntries();
            }

        }, errorHandler);
    };

    readEntries(); // Start reading dirs
}

/*文件操作方法*/
FileDealer.prototype.openSDCard = function (callBack) {

    /*** 笔记Uncaught RangeError: Maximum call stack size exceeded
     ****/
    function onInitFs(fileRootEntry) {
       fileDealer.openEntry(fileRootEntry,function (entries) {
           //笔记callBack
           callBack(entries,fileRootEntry);
       });
    }
    window.resolveLocalFileSystemURI(cordova.file.externalRootDirectory,  onInitFs, errorHandler);
};

//将文件和文件夹分离
FileDealer.prototype.sortFils = function sortEntrise(entries) {
    entries.sort(function (a, b) {
        if (a.isFile && !b.isFile) {
            return 1;
        } else if (!a.isFile && b.isFile) {
            return -1;
        } else {
            return a.name > b.name;
        }
    })
};
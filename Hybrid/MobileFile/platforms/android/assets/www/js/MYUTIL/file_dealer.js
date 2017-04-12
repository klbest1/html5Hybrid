/**
 * Created by linkang on 17/03/2017.
 */

function FileDealer() {
    /**本地文件创建名字,可以为文件,或者目录**/
    this.localFileSystemCreateName = {
        userData: "mobile.data",
        safeBox: 'safeBox'
    };
    this.safeBoxFileType = {
        audio:"audio",
        video: "video",
        image: "image",
        office:"office",
        ppt:'ppt',
        pdf: 'pdf'
    };
    this.key = '&@^$*@&$JGG(#$$&#$';
}

var fileDealer = new FileDealer();

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
FileDealer.prototype.openEntry = function (entry, callBack) {
    var dirReader = entry.createReader();
    var entries = [];
    // Call the reader.readEntries() until no more results are returned.
    var readEntries = function () {
        dirReader.readEntries(function (results) {
            // listResults(entries.sort());
            //笔记
            if (!results.length) {
                fileDealer.sortFils(entries);
                // entries.sort();
                callBack(entries);
            } else {
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
        fileDealer.openEntry(fileRootEntry, function (entries) {
            //笔记callBack
            callBack(entries, fileRootEntry);
        });
    }

    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, onInitFs, errorHandler);
};

//将文件和文件夹分离
FileDealer.prototype.sortFils = function sortEntrise(entries) {
    entries.sort(function (a, b) {
        if (a.isFile && !b.isFile) {
            return 1;
        } else if (!a.isFile && b.isFile) {
            return -1;
        } else if(a.name.toUpperCase() < b.name.toUpperCase()){
            return -1;
        }else  if(a.name.toUpperCase() > b.name.toUpperCase()){
            return 1;
        }
        return 0;
    })

};

//写文件
FileDealer.prototype.writeDataToFile = function (fileName, key, value, callBack) {
    var _this = this;
    var onInitFs = function (fs) {
        fs.getFile(fileName, {create: true}, function (fileEntry) {
//"file:///data/user/0/io.cordova.hellocordova/files/mobile.data"
            // Get a File object representing the file,
            // then use FileReader to read its contents.
            fileEntry.file(function (file) {
                //先读
                var userDataString = null;
                var reader = new FileReader();

                reader.onloadend = function (e) {
                    if (this.result.length > 0) {
                        userDataString = this.result;
                        //解密
                        userDataString = CryptoJS.AES.decrypt(userDataString, _this.key).toString(CryptoJS.enc.Utf8);
                    }
                    if (userDataString == null
                        || userDataString == undefined
                        || userDataString.length == 0) {
                        userDataString = "{}";
                    }

                    //后写
                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = function (e) {
                            console.log('Write completed.');
                            callBack();
                        };

                        fileWriter.onerror = function (e) {
                            console.log('Write failed: ' + e.toString());
                        };

                        var userDataObject = JSON.parse(userDataString);
                        userDataObject[key] = value;
                        userDataString = JSON.stringify(userDataObject);
                        //加密
                        userDataString = CryptoJS.AES.encrypt(userDataString, _this.key).toString();
                        console.log("要写入文件的用户数据:" + userDataString);
                        // Create a new Blob and write it to log.txt.
                        var blob = new Blob([userDataString], {type: "text/plain;charset=utf-8"});
                        fileWriter.write(blob);

                    }, errorHandler);

                };

                reader.readAsText(file);


            }, errorHandler);


        }, errorHandler);
    };
    //写入到sandBox中.....
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, onInitFs, errorHandler);
};

//读文件
FileDealer.prototype.getDataFromFile = function (fileName, key, callBack) {
    var _this = this;
    var onInitFs = function (fs) {
        fs.getFile(fileName, {create: true}, function (fileEntry) {
            console.log(fileEntry.nativeURL);
            // Get a File object representing the file,
            // then use FileReader to read its contents.

            fileEntry.file(function (file) {
                //先读
                var userDataObject = {};
                var userDataString = "";
                var reader = new FileReader();

                reader.onloadend = function (e) {
                    if (this.result.length > 0) {
                        userDataString = this.result;
                        userDataString = CryptoJS.AES.decrypt(userDataString, _this.key).toString(CryptoJS.enc.Utf8);
                        if (userDataString != undefined && userDataString.length > 0){
                            userDataObject = JSON.parse(userDataString);
                        }
                    }
                    callBack(userDataObject[key]);
                };

                reader.readAsText(file);

            }, errorHandler);


        }, errorHandler);
    };
    //写入到sandBox中.....
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, onInitFs, errorHandler);
};

FileDealer.prototype.getFileEntryWithPath = function (path,callBack) {
    function onInitFs(entry) {
        // fileDataDiretoryEntry.getFile();
        callBack(entry);
    }
    window.resolveLocalFileSystemURI(path, onInitFs, errorHandler);
};

/**
 *
 * 移动到Sandbox中的文件夹
 * */
FileDealer.prototype.moveToSandBoxDataDirectory = function (originEntry, destinationPath, callBack) {
    var onInitFs = function (fs) {
        console.log(cordova.file.dataDirectory);
        fs.getDirectory(destinationPath, {create: true}, function (dirEntry) {
            originEntry.moveTo(dirEntry, null, function (newEntry) {
                callBack(newEntry);
            }, function (error) {
                console.log(error.message + "移动文件到目录失败" + destinationPath );
                // htmlUtil.showNotifyView(error);
            });
        }, errorHandler);
    };
    //写入到sandBox中.....
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, onInitFs, errorHandler);

};

/**
 * 删除文件夹
 * **/

FileDealer.prototype.deleteFile =function (path,callBack) {
    var removeSuccess = function () {
        console.log("删除成功!" + path);
        callBack(true);
    };
    var removeFailed = function (error) {
        console.log('删除失败' + path);
    };
    function onInitFs(entry) {
        // fileDataDiretoryEntry.getFile();
        if (entry.isFile){
            entry.remove(removeSuccess,removeFailed);
        }else {
            entry.removeRecursively(removeSuccess,removeFailed);
        }

    }

    window.resolveLocalFileSystemURI(path, onInitFs, errorHandler);

};
/** 获取文件的FileMIMEType
 * **/

FileDealer.prototype.getMiMeType = function (fileName) {
    var _this = this;
    var re = /(?:\.([^.]+))?$/;
    var extenion = re.exec(fileName)[1];
    var nameWioutExtention = fileName.replace(/'.'+ extenion/i, '');
    // mp4v mpg4
    var forMate = {};
    //audio/mpeg					mpga mp2 mp2a mp3 m2a m3a
    forMate.mp3 = {mimeType: "audio/mpeg", type:_this.safeBoxFileType.audio , imageName: _this.safeBoxFileType.audio};
//audio/x-wav					wav
    forMate.wav = {mimeType: "audio/x-wav", type:_this.safeBoxFileType.audio , imageName: _this.safeBoxFileType.audio};

    forMate.mp4 = {mimeType: "video/mp4", type: _this.safeBoxFileType.video, imageName: nameWioutExtention};
    forMate.mp4v = {mimeType: "video/mp4", type: _this.safeBoxFileType.video, imageName: nameWioutExtention};
    forMate.mpg4 = {mimeType: "video/mp4", type: _this.safeBoxFileType.video, imageName: nameWioutExtention};
    forMate.avi = {mimeType: "video/x-msvideo", type: _this.safeBoxFileType.video, imageName: nameWioutExtention};
    forMate.rmvb = {mimeType: "application/vnd.rn-realmedia-vbr", type: _this.safeBoxFileType.video, imageName: nameWioutExtention};
    forMate.rm = {mimeType: "application/vnd.rn-realmedia", type:_this.safeBoxFileType.video, imageName: nameWioutExtention};
    forMate.wmv = {mimeType: "video/x-ms-wmv", type: _this.safeBoxFileType.video, imageName: nameWioutExtention};

    //image/jpeg					jpeg jpg jpe
    forMate.jpeg = {mimeType: "image/jpeg", type: _this.safeBoxFileType.image, imageName: nameWioutExtention};
    forMate.jpg = {mimeType: "image/jpeg", type: _this.safeBoxFileType.image, imageName: nameWioutExtention};
    forMate.jpe = {mimeType: "image/jpeg", type: _this.safeBoxFileType.image, imageName: nameWioutExtention};
//image/png					png
    forMate.png = {mimeType: "image/png", type: _this.safeBoxFileType.image, imageName: nameWioutExtention};

    //application/msword				doc dot
    forMate.doc = {mimeType: "application/msword", type: _this.safeBoxFileType.office, imageName: _this.safeBoxFileType.office};
    forMate.dot = {mimeType: "application/msword", type: _this.safeBoxFileType.office, imageName: _this.safeBoxFileType.office};
    // application/vnd.openxmlformats-officedocument.wordprocessingml.document	docx
    forMate.docx = {
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        type: "office",
        imageName: "office"
    };
    //application/vnd.ms-works			wps wks wcm wdb
    forMate.wps = {mimeType: "application/vnd.ms-works", type: _this.safeBoxFileType.office, imageName: _this.safeBoxFileType.office};

    //application/vnd.ms-powerpoint			ppt pps pot
    forMate.ppt = {mimeType: "application/vnd.ms-powerpoint", type: _this.safeBoxFileType.ppt, imageName: _this.safeBoxFileType.ppt};
    forMate.pps = {mimeType: "application/vnd.ms-powerpoint", type: _this.safeBoxFileType.ppt, imageName: _this.safeBoxFileType.ppt};
    forMate.pot = {mimeType: "application/vnd.ms-powerpoint", type: _this.safeBoxFileType.ppt, imageName: _this.safeBoxFileType.ppt};

    //application/vnd.openxmlformats-officedocument.presentationml.presentation	pptx
    forMate.pptx = {
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        type: _this.safeBoxFileType.ppt,
        imageName: _this.safeBoxFileType.ppt
    };

    //application/pdf					pdf
    forMate.pdf = {mimeType: "application/pdf", type: _this.safeBoxFileType.pdf, imageName: _this.safeBoxFileType.pdf};


    return forMate[extenion];
};


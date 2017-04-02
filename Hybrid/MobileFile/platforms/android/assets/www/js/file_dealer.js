/**
 * Created by linkang on 17/03/2017.
 */

function FileDealer() {
    this.fileType = {
        userData: "mobile.data",
        safeBox:'safeBox'
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

    window.resolveLocalFileSystemURI(cordova.file.externalRootDirectory, onInitFs, errorHandler);
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

//写文件
FileDealer.prototype.writeDataToFile = function (fileType, key, value, callBack) {
    var _this = this;
    var onInitFs = function (fs) {
        fs.getFile(fileType, {create: true}, function (fileEntry) {
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
FileDealer.prototype.getDataFromFile = function (fileType, key, callBack) {
    var _this = this;
    var onInitFs = function (fs) {
        fs.getFile(fileType, {create: true}, function (fileEntry) {
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
                        userDataObject = JSON.parse(userDataString);
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

/**
 *
 * 移动到文件夹
 * */
FileDealer.prototype.moveToDirectory = function (originEntry,destinationPath,callBack) {
    var onInitFs = function (fs) {
        fs.getDirectory(destinationPath, {create: true}, function(dirEntry) {
            originEntry.moveTo(dirEntry, null, function (newEntry) {
                callBack(newEntry);
            }, function (error) {
                htmlUtil.showNotifyView(error);
            });
        }, errorHandler);
    };
    //写入到sandBox中.....
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, onInitFs, errorHandler);

};

/** 获取文件的FileMIMEType
 * **/

FileDealer.prototype.getMiMeType = function (fileName) {
    var re = /(?:\.([^.]+))?$/;
    var extenion = re.exec(fileName)[1];
    var nameWioutExtention = fileName.replace(/'.'+ extenion/i, '');
    // mp4v mpg4
    var forMate = {};
    forMate.mp4 = {mimeType:"video/mp4",type:"vedio",imageName:nameWioutExtention};
    forMate.mp4v = {mimeType:"video/mp4",type:"vedio",imageName:nameWioutExtention};
    forMate.mpg4 = {mimeType:"video/mp4",type:"vedio",imageName:nameWioutExtention};
    forMate.avi = {mimeType:"video/x-msvideo",type:"vedio",imageName:nameWioutExtention};
    forMate.rmvb = {mimeType:"application/vnd.rn-realmedia-vbr",type:"vedio",imageName:nameWioutExtention};
    forMate.rm = {mimeType:"application/vnd.rn-realmedia",type:"vedio",imageName:nameWioutExtention};
    forMate.wmv = {mimeType:"video/x-ms-wmv",type:"vedio",imageName:nameWioutExtention};

    //image/jpeg					jpeg jpg jpe
    forMate.jpeg = {mimeType:"image/jpeg",type:"image",imageName:nameWioutExtention};
    forMate.jpg = {mimeType:"image/jpeg",type:"image",imageName:nameWioutExtention};
    forMate.jpe = {mimeType:"image/jpeg",type:"image",imageName:nameWioutExtention};
//image/png					png
    forMate.png = {mimeType:"image/png",type:"image",imageName:nameWioutExtention};

    //application/msword				doc dot
    forMate.doc = {mimeType:"application/msword",type:"office",imageName:"office"};
    forMate.dot = {mimeType:"application/msword",type:"office",imageName:"office"};
   // application/vnd.openxmlformats-officedocument.wordprocessingml.document	docx
    forMate.docx = {mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",type:"office",imageName:"office"};
    //application/vnd.ms-works			wps wks wcm wdb
    forMate.wps = {mimeType:"application/vnd.ms-works",type:"office",imageName:"office"};

    //application/vnd.ms-powerpoint			ppt pps pot
    forMate.ppt = {mimeType:"application/vnd.ms-powerpoint",type:"ppt",imageName:"ppt"};
    forMate.pps = {mimeType:"application/vnd.ms-powerpoint",type:"ppt",imageName:"ppt"};
    forMate.pot = {mimeType:"application/vnd.ms-powerpoint",type:"ppt",imageName:"ppt"};

    //application/vnd.openxmlformats-officedocument.presentationml.presentation	pptx
    forMate.pptx = {mimeType:"application/vnd.openxmlformats-officedocument.presentationml.presentation",type:"ppt",imageName:"ppt"};

    //application/pdf					pdf
    forMate.pdf = {mimeType:"application/pdf",type:"pdf",imageName:"pdf"};


    return forMate[extenion];
};


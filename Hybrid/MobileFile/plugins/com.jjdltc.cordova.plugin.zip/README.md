Zip / UnZip plugin
===

A simple compress plugin that allow zip/unzip files and folders

Platforms supported

* android

Installation
---

`cordova plugin add cordova-zip-plugin`

Easy Use  
---  
  
The object `JJzip` is expose in the `window`:

### Methonds

* `zip(file [, options, successCallback, errorCallback])` - Allow to zip a file or folder
    * `file` - Path/To/File/Or/Folder
    * `options` - Compression options in a JS object format (Key:"value")
        * __target__: Path/To/Place/Result
        * __name__: Name of the resulted zip (without the .zip)
    * `successCallback` - Function to call in plugin success
    * `errorCallback` - Function to call in plugin error
* `unzip(file [, options, successCallback, errorCallback])` - Allow to unzip a zip file
    * `file` - Path/To/File.zip (Expect a cordova style path file://)
    * `options` - Extra options in a JS object format (Key:"value")
        * __target__: Path/To/Place/Result
    * `successCallback` - Function to call in plugin success
    * `errorCallback` - Function to call in plugin error  

### Use Example  

To Zip a folder
```
    var PathToFileInString  = cordova.file.externalRootDirectory+"HereIsMyFolder",
        PathToResultZip     = cordova.file.externalRootDirectory;
    JJzip.zip(PathToFileInString, {target:PathToResultZip,name:"SuperZip"},function(data){
        /* Wow everiting goes good, but just in case verify data.success*/
    },function(error){
        /* Wow something goes wrong, check the error.message */
    })
```  

Or To UnZip  

```
    var PathToFileInString  = cordova.file.externalRootDirectory+"HereIsMyFile.zip",
        PathToResultZip     = cordova.file.externalRootDirectory;
    JJzip.unzip(PathToFileInString, {target:PathToResultZip},function(data){
        /* Wow everything goes good, but just in case verify data.success */
    },function(error){
        /* Wow something goes wrong, check the error.message */
    })
```

There is a big TODO list, but in resume  
  
* Write a better documentation
* Add iOS Support (Be Patient)
* Should handle some file manipulation (Like remove after zip the file?)
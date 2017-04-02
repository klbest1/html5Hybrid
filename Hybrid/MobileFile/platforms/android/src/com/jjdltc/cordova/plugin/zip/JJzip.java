/*
 * The MIT License (MIT)
 * Copyright (c) 2015 Joel De La Torriente - jjdltc - http://www.jjdltc.com/
 * See a full copy of license in the root folder of the project
 */
package com.jjdltc.cordova.plugin.zip;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class JJzip extends CordovaPlugin {

    private enum ACTIONS {
          zip
        , unzip
    };
    
    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArry of arguments for the plugin.
     * @param callbackContext   The callback id used when calling back into JavaScript.
     * @return                  True if the action was valid, false if not.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        boolean result          = true;
        String actionType       = "";
        JSONObject validOptions = validOptions(args);
        
        if(validOptions==null){
            this.processResponse(callbackContext, false, "Some parameters were missed - Missed file path -");
        }
        
        switch (ACTIONS.valueOf(action)) {
            case zip:
                actionType              = "compress";
                compressZip makeZip     = new compressZip(validOptions);
                result                  = makeZip.zip();
            break;
            case unzip:
                actionType              = "decompress";
                decompressZip unZip     = new decompressZip(validOptions);
                result                  = unZip.unZip();
            break;
            default:
                this.processResponse(callbackContext, false, "Some parameters were missed - Action not found -");
                result = false;
            break;
        }

        String msg  = (result)?actionType+" Operation success":actionType+" Operation fail";
        this.processResponse(callbackContext, result, msg);
        return result;
    }

    /**
     * 
     * @param ctx               The plugin CallbackContext
     * @param success           boolean that define if the JS plugin should fire the success or error function
     * @param msg               The String msg to by send
     * @throws JSONException
     */
    private void processResponse(CallbackContext ctx, boolean success, String msg) throws JSONException{
        JSONObject response = new JSONObject();
        response.put("success", success);
        response.put("message", msg);
        if(success){
            ctx.success(response);
        }
        else{
            ctx.error(response);
        }
    }
    
    /**
     * 
     * @param args              The JSONArray sent by the client
     * @return                  A Valid JSONObject with the need it options to execute or null if the file option path is not set
     * @throws JSONException
     */
    private JSONObject validOptions(JSONArray args) throws JSONException{
        
        JSONObject options  = new JSONObject();
        String source       = args.optString(0);
        
        if(source == null || source.isEmpty()){
            return null;
        }
        
        options.put("source", source);
        
        JSONObject extraOptObj  = args.optJSONObject(1);
        String[] extraOptArr    = new String[]{"target","name"};
                
        for (int i = 0; i < extraOptArr.length; i++) {
            String strOpt   = extraOptObj.optString(extraOptArr[i]);
            if(strOpt!=null && !strOpt.isEmpty()){
                options.put(extraOptArr[i], strOpt);
                options.put("useExtra", true);
            }
        }
        options = validPaths(options);
        
        return options;
    }
    
    /**
     * 
     * @param options The passed options merges with the extra params
     * @return A Valid JSONObject with the need it options to execute and the merge paths or null some of the paths are empty
     * @throws JSONException
     */
    private JSONObject validPaths(JSONObject options) throws JSONException{
        String sourceEntry  = options.optString("source");
        String targetPath   = options.optString("target");
        
        if(targetPath.isEmpty()){
            targetPath      = sourceEntry.substring(0, sourceEntry.lastIndexOf("/")+1);
        }

        sourceEntry         = sourceEntry.replace("file://", "");
        targetPath          = targetPath.replace("file://", "");
        String sourcePath   = sourceEntry.substring(0, sourceEntry.lastIndexOf("/")+1);
        String sourceName   = sourceEntry.replace(sourcePath, "");
        sourceName          = (sourceName.lastIndexOf(".")==-1)?sourceName:sourceName.substring(0, sourceName.lastIndexOf("."));
        
        if(sourceEntry.isEmpty() || targetPath.isEmpty() || sourcePath.isEmpty() || sourceName.isEmpty()){
            return null;
        }
        
        options.put("sourceEntry", sourceEntry);
        options.put("sourcePath", sourcePath);
        options.put("targetPath", targetPath);
        options.put("sourceName", sourceName);

        return options;
    }
}

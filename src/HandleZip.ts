import JSZip from "@progress/jszip-esm";
import {IuploadfileList} from "./ICommon";
import {getBinaryContent} from "./common/method";
import { debug } from "./utils/debug";


export class HandleZip{
    uploadFile:File; 
    workBook:JSZip; 
    
    constructor(file?:any){
        // Support nodejs fs to read files
        // if(file instanceof File){
            this.uploadFile = file;
        // }
    }

    unzipFile(successFunc:(file:IuploadfileList)=>void, errorFunc:(err:Error)=>void):void { 
        debug.log('🗜️ [ZIP] Starting unzip operation...');
        const startTime = Date.now();
        
        var new_zip:JSZip = new JSZip();
        debug.log('🗜️ [ZIP] Loading file into JSZip...');
        
        new_zip.loadAsync(this.uploadFile)                                   // 1) read the Blob
        .then(function(zip:any) {
            debug.log('🗜️ [ZIP] File loaded successfully', {
                fileCount: Object.keys(zip.files).length,
                elapsed: `${Date.now() - startTime}ms`
            });
            
            let fileList:IuploadfileList = <IuploadfileList>{}, lastIndex:number = Object.keys(zip.files).length, index:number=0;
            let processedFiles:string[] = [];
            
            zip.forEach(function (relativePath:any, zipEntry:any) {  // 2) print entries
                let fileName = zipEntry.name;
                debug.log(`🗜️ [ZIP] Processing: ${fileName}`);
                
                let fileNameArr = fileName.split(".");
                let suffix = fileNameArr[fileNameArr.length-1].toLowerCase();
                let fileType = "string";
                if(suffix in {"png":1, "jpeg":1, "jpg":1, "gif":1,"bmp":1,"tif":1,"webp":1,}){
                    fileType = "base64";
                }
                else if(suffix=="emf"){
                    fileType = "arraybuffer";
                }
                
                zipEntry.async(fileType).then(function (data:string) {
                    if(fileType=="base64"){
                        data = "data:image/"+ suffix +";base64," + data;
                    }
                    fileList[zipEntry.name] = data;
                    processedFiles.push(fileName);
                    
                    debug.log(`🗜️ [ZIP] Processed ${index + 1}/${lastIndex}: ${fileName}`);
                    
                    if(lastIndex==index+1){
                        debug.log('✅ [ZIP] All files processed', {
                            totalFiles: lastIndex,
                            processedFiles,
                            totalTime: `${Date.now() - startTime}ms`
                        });
                        successFunc(fileList);
                    }
                    index++;
                }).catch(function(err:Error) {
                    debug.error(`❌ [ZIP] Error processing ${fileName}:`, err);
                });
            });
            
        }, function (e:Error) {
            debug.error('❌ [ZIP] Error loading file:', {
                error: e.message,
                elapsed: `${Date.now() - startTime}ms`
            });
            errorFunc(e);
        });
    }

    unzipFileByUrl(url:string,successFunc:(file:IuploadfileList)=>void, errorFunc:(err:Error)=>void):void { 
        var new_zip:JSZip = new JSZip();
        getBinaryContent(url, function(err:any, data:any) {
            if(err) {
                throw err; // or handle err
            }
        
            new_zip.loadAsync(data).then(function(zip:any) {
                let fileList:IuploadfileList = <IuploadfileList>{}, lastIndex:number = Object.keys(zip.files).length, index:number=0;
                zip.forEach(function (relativePath:any, zipEntry:any) {  // 2) print entries
                    let fileName = zipEntry.name;
                    let fileNameArr = fileName.split(".");
                    let suffix = fileNameArr[fileNameArr.length-1].toLowerCase();
                    let fileType = "string";
                    if(suffix in {"png":1, "jpeg":1, "jpg":1, "gif":1,"bmp":1,"tif":1,"webp":1,}){
                        fileType = "base64";
                    }
                    else if(suffix=="emf"){
                        fileType = "arraybuffer";
                    }
                    zipEntry.async(fileType).then(function (data:any) {
                        if(fileType=="base64"){
                            data = "data:image/"+ suffix +";base64," + data;
                        }
                        fileList[zipEntry.name] = data;
                        // debug.log(lastIndex, index);
                        if(lastIndex==index+1){
                            successFunc(fileList);
                        }
                        index++;
                    });
                });
                
            }, function (e:Error) {
                errorFunc(e);
            });
        });
        
    }

    newZipFile():void { 
        var zip = new JSZip();
        this.workBook =  zip;
    }

    //title:"nested/hello.txt", content:"Hello Worldasdfasfasdfasfasfasfasfasdfas"
    addToZipFile(title:string,content:string):void { 
        if(this.workBook==null){
            var zip = new JSZip();
            this.workBook =  zip;
        }
        this.workBook.file(title, content);
    }
}
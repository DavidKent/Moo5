var walk = require('walk');
var cons = require('../utils/console.js');
var fs = require('fs');
var image_fileTypes = ['jpg','bmp','gif','png'], html_fileTypes = ['htm','html','xml'],
css_fileType = "css", script_fileType = "js";
var file_urls = [], files   = [];
var cut_off = "./client/static";
exports.loadResources = function(){
var resource_Dir = "./client";

var walker  = walk.walk(resource_Dir, { followLinks: false });
    walker.on('file', function(root, stat, next) {
        appendFile(root+'/'+stat.name);
        next();
    });
    var self = this;
    walker.on('end', function() {
        cons.alert('Found ' + files.length + ' files in ' + resource_Dir + '.');
        cons.alert('Resources loaded successfully.');
            self.test();
    });

}
exports.getPage = function(url){
    return files[file_urls.indexOf(cut_off+url)];
}
exports.test = function(){
    cons.alert(file_urls[0]);
}
exports.getContentType = function(url){
    var h = getExtensionType(url);
    if(image_fileTypes.indexOf(h) != -1)
        return 'image/'+h;
    if(html_fileTypes.indexOf(h) != -1)
        return 'text/html';
    if(css_fileType.indexOf(h) != -1)
        return 'text/css';
    if(script_fileType.indexOf(h) != -1)
        return 'text/javascript';
    return "text/html";
}
function getExtensionType(url){
    try{
        var regEx = /\.([^\.]+)$/g;
        var match = regEx.exec(url);
        return match[1];
    }
    catch(err){
        return "html";
    }
}
function appendFile(url){
    fs.readFile(url, function (err, data) {
      if (err) throw err;
      file_urls.push(url);
      files.push(data);
    });
}

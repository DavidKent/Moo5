exports.getMessages = function(user, database, hasdocs, nodocs) { 
    database.setModel('messages', function(){
        var cursor = database._model.find( { to : user }, {sentby : -1});
        cursor.toArray(function(err, docs) {
            database.setModel('users', function(){
                if(docs.length >= 1)
                    hasdocs(docs);
                else
                    nodocs();
            });
        });
    });
}
exports.sendMessage = function(database, info, callback) {
    database.setModel('messages', function() {
        database._model.insert(info, function() {
            database.setModel('users', function(){
                callback();
                console.log('message sent: ' + info);
            });
        });
    });
}
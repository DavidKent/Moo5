exports.getMessages = function(database, user, hasdocs, nodocs) { 
    database.setModel('messages', function(){
            
        var onfind = function(err, cursor) {
            cursor.sort({sentby: -1}).limit(30)
            .toArray( function(err, docs) {
                database.setModel('users', function(){
                    if(docs.length >= 1)
                        hasdocs(docs);
                    else
                        nodocs();
                });
            });
        };
        database._model.find( {  }, onfind);
    });
}

exports.clearMessages = function(database) { 
    database.setModel('messages', function(){
        var cursor = database._model.remove({});
        database.setModel('users', function(){
        });
    });
}

exports.removeMessage = function(database, query) { 
    database.setModel('messages', function(){
        database._model.remove(query, function(){
           database.setModel('users', function(){
            });
        });
    });
}

exports.sendMessage = function(database, info, callback) {
    database.setModel('messages', function() {
        database._model.insert(info, {safe:true}, function(err, docs) {
            if(err)
            console.log(err);
            database.setModel('users', function(){
                callback();
            });
        });
    });
}
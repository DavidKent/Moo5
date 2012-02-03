exports.alreadyLoggedIn = function(response) {
    response.setStatusCode(401);
    response.setContent("Already Logged In");
    response.send();
}
exports.success = function(response){
    response.setStatusCode(200);
    response.setContent("Success");
    response.send();
}
exports.restricted = function(response){
    response.setStatusCode(401);
    response.setContent("You cannot access this page!");
    response.send();
}
exports.cantRegister = function(response) {
    response.setStatusCode(401);
    response.setContent("You cannot register any more accounts");
    response.send();
}
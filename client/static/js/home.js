$(document).ready(doc_onReady);
function doc_onReady(){
    var h = $.cookie('session');
    if(h == undefined) {
        $.cookie('session', GenerateSessionID());
    }
}
function login(){
    var user = $('#suser').val();
    var pass = $('#spass').val();
    var data = 'user=' + user + "&pass=" + pass;
    $.ajax({
      url: window.location.origin+"/main/login?"+data,
      success: function(data){
        alert(data);
      }
    });
}
function register(){
    var user = $('#ruser').val();
    var pass = $('#rpass').val();
    var pass2 = $('#rpass2').val();
    var email = $('#remail').val();
    var error = "";
    if(!user.match(/[a-zA-Z0-9]{4,12}/))
        {
            error += "Invalid username\n";
            error += "\tUsername must be atleast 4 characters and at max 12 characters in length\n";
        }
    if(pass != pass2)
        {
            error+= "Passwords do not match\n";
        }
    if(pass.match(/[\\w\\W]{4,12}/))
        {
            error += "Invalid password\n";
            error += "\tPassword must be atleast 4 characters and at max 12 characters in length\n";
        }
    if(!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/))
        {
            error += "Invalid email address\n";
        }
      if(error.length > 1) {
        alert(error);
        return;
        }
    var data = 'user=' + user + "&pass=" + pass + "&email="+email;
    $.ajax({
      url: window.location.origin+"/main/register?" + data,
      success: function(data){
        alert(data);
      }
    });
}
function GenerateSessionID() {
    var chars = '-_?!@#$%^&*():;{}[]<>,.0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
    var length = 60;
    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
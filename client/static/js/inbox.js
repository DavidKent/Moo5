var message_code, messages = [];
$(document).ready(onReady);

function onReady(){
    $('.well').click(message_onClick);
    $('h4').click(toggleHeader_onClick);
    $('a').click(aTag_onClick);
    $("#SendMessage").click(sendMessage);
    closeAllMessages();
}
function closeAllMessages(){
    var u = $('.well');
    $.each( u, function(index, item) {
        if($(item).attr('id') != undefined)
            hide($(item).attr('id'));
    });
}

function aTag_onClick(e) {
    var target = e.target || e.srcElement;
    var button = $(target).attr('class');
    if(button === undefined)
    return;
    if(button === 'reply')
    {
        $(".send").show();
    }
    if(button === 'delete'){
        var parents = $(target).parents();
        $.each(parents, function(index, item) {
            if($(item).attr('id') != null && $(item).attr('class') != null)
            {
                if($(item).attr('class') === 'well')
                {
                    deleteMessage($(item).attr('id'));
                    console.log($(item).attr('id'));
                }
            }
        });
    }
}

function deleteMessage(id) {
var data = "id=" + id;
  $.ajax({
      url: window.location.origin+"/inbox/deleteMessage?"+data,
      success: function(data){
        $('.messages').remove('#'+id);
      }
    });
}

function sendMessage() {
    var subject = getEscape($("#subject").val(), true);
    var body = getEscape($("#body").val(), true);
    var to = getEscape($("#to").val(), true);
    console.log(subject);
    $(".send").hide();
    var data ="message="+body+"&to="+to+"&description="+subject;
      $.ajax({
          url: window.location.origin+"/inbox/sendMessage?"+data,
          success: function(data){
                        console.log('sent successfully');
                }
                });
}

function toggleHeader_onClick(e){
  var target = e.target || e.srcElement;
  var pwell = $(target).parent().parent();
  if(pwell == undefined || $(pwell).attr('id') == undefined  || $(pwell).attr('class') == undefined || $(pwell).attr('class') == 'well')
  return;
  mToggle($(pwell).attr('id'));
}
function message_onClick(e){ 
    var target = e.target || e.srcElement;
    if($(target).attr('id') == undefined) return;
    var id = $(target).attr('id');
    mToggle(id);
}
function getEscape(str, forward){ 
    var h = [
                { a : "$", b : "%24" },
                { a : "&", b : "%26" },
                { a : "+", b : "%2B" },
                { a : ",", b : "%2C" },
                { a : "/", b : "%2F" },
                { a : ":", b : "%3A" },
                { a : ";", b : "%3B" },
                { a : "=", b : "%3D" },
                { a : "?", b : "%3F" },
                { a : "@", b : "%40" }
            ]
    var newStr = str;
    for(i in h) {
        if(forward) 
            newStr = newStr.replace( h[i].a, h[i].b );
        else
            newStr = newStr.replace( h[i].b, h[i].a );
    }
    return newStr;
}
function hide(id){
    $("#"+id).find('.top_desc').fadeIn(300);
    $("#"+id).find('.message_body').hide();
    $("#"+id).addClass('hidden');
}
function show(id){
    $("#"+id).find('.top_desc').hide();
    $("#"+id).find('.message_body').fadeIn(300);
    $("#"+id).removeClass('hidden');
}
function mToggle(id){
    if($("#"+id).attr('class').indexOf('hidden') != -1)
        show(id);
    else
        hide(id);
}
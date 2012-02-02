var message_code, messages = [];
function get_code(){
	$.ajax({
  url: 'modules/message.html',
  beforeSend: function( xhr ) {
    xhr.overrideMimeType( 'text/plain; charset=x-user-defined' );
  },
  success: function(data) {
    message_code = data;
    console.log(message_code);
	setup_messages();
	$('.well').click(message_onClick);
  }
});
}

function Message (args)
{
	this.select = function(){
		for(var i = 0; i < messages.length; i++)
		{
			if(messages[i].id != this.id)
				messages[i].hide();
			else
				messages[i].show();
			
		}
	}
	this.hide = function(start){
		var time = start?0:300;
		$("#"+this.id).find('.top_desc').fadeIn(time);
		$("#"+this.id).find('.message_body').hide();
	}
	this.show = function(){
		$("#"+this.id).find('.top_desc').hide();
		$("#"+this.id).find('.message_body').fadeIn(300);
		
	}
	this.id = args.id;
	this.html;
	this.output = function(){
		if(message_code == undefined)
			get_code();
		this.html = message_code.replace('{|message|}', args.message)
						   .replace('{|user|}', args.user)
						   .replace('{|id|}', args.id)
						   .replace(/\{\|description\|\}/g, args.description);
		$(".hero-unit").html(this.html+$(".hero-unit").html());
		this.hide(true);
	}
	this.add = function(){
		messages.push(this);
		this.output();
	}
	
}
var m;
function setup_messages(){
    // "[\/]{2}[\{]
    //{{{ FOR I<12{
	 m = new Message ({
		id:"asbasd", 
		description:"Test Description", 
		message:"test Message hi asdasd asdijasdjisjdiasjdiasdj",
		user: "batman"}
	);
	m.add();
    //} }}}
	 m = new Message ({
		id:"asbasd1", 
		description:"Test Description", 
		message:"test Message hi asdasd asdijasdjisjdiasjdiasdj",
		user: "batman"}
	);
	m.add();
	 m = new Message ({
		id:"asbasd2", 
		description:"Test Description", 
		message:"test Message hi asdasd asdijasdjisjdiasjdiasdj",
		user: "batman"}
	);
	m.add();
}
function message_onClick(e){
	var h = $(this).attr('id');
	for(var i = 0; i < messages.length; i++)
	{
		if(messages[i].id == h)
			messages[i].select();
	}
}
get_code();
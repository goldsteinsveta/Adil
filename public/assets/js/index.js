$(window).ready(function() {

  //menu
  $("body").delay(200).fadeIn();

  $("#continue").click(function(event){
    $("#log_in").css({ left: "100%" });
  });

  $(".menuDiv").click(function() {
    clearInterval(upd_lines);
  });
  $("#collect").click(function(event){
    $(this).addClass("active");
    $("#neutralize").removeClass("active");
    $("#exchange").removeClass("active");
    $(".item").css({ marginLeft: "0%" });
  });
  $("#neutralize").click(function(event){
    $(this).addClass("active");
    $("#collect").removeClass("active");
    $("#exchange").removeClass("active");
    $(".item").css({ marginLeft: "-100%" });
  });
  $("#exchange").click(function(event){
    $(this).addClass("active");
    $("#neutralize").removeClass("active");
    $("#collect").removeClass("active");
    $(".item").css({ marginLeft: "-200%" });
    $("#counter_div").delay(0).fadeIn(0);
    setInterval(upd_lines, 500);
  });

  //menu
  $("#dropdown_menu").click(function(event){
    $("#dropdown_content").css({ left: "0%" });
    $("#dropdown_content #menu").css({ left: "70px" });
  });
  $("#close_menu").click(function(event){
    $("#dropdown_content").css({ left: "-100%" });
    $("#dropdown_content #menu").css({ left: "0px" });
  });

  //receive data from Server
  var counter_div = $('#counter_div');
	counter_div.append('<div id="counter">');
	var counter = $("#counter");

  var lines = "";
	function upd_lines() {
		$.ajax({
	  		crossDomain: true,
		    crossOrigin: true,
		    url: 'http://adilines.eu-gb.mybluemix.net/',
		    type: "GET",
		    dataType: 'json',
		    success: function (data) {
          if (lines != data.lines) {
            lines = data.lines;
            var counterString = "-> " + lines.toString() + " lines of data were already collected by all users of Adil.";
            counter.empty();
            exchangeWrite(counterString);
          }
		    }
		});
	}

  //monitor data lines
  function exchangeWrite(data) {
    // $("#counter_div #lines").empty();
    var d = 0;
    var monitor = '#counter_div #lines';

    function monitorWrite_line() {
      if (d < data.length) {
        $(monitor).append('<div></div>');

        // string index
        var i = 0;
        var interval = setInterval(monitorWrite_char, 10);

        function monitorWrite_char() {
            $(monitor + '> div:last-child').addClass('monitor_msg')
            if(data[i].match(/^[0-9]+$/) == null){
              $(monitor + '> div:last-child').append(data[i]);
            }else{
              $(monitor + '> div:last-child').append('<span class="number">' + data[i] + '</span>')
            }
            $('.item_inner_top').scrollTop(1000000000000);
            i++;

            if (i >= data.length) {
              clearInterval(interval);
            };
        }

      }
    }
    monitorWrite_line();
  }

});



//driver
var btn_driver = $('button#driver');
btn_driver.click(function(){
  $('#faker').prop('disabled', false);
});

jQuery.get("../data/data.json", undefined, function(data) {
  $('#statsBox .boxInner').prepend(data);
}, "html");

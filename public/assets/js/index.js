

$(window).ready(function() {

  //menu
  $("body").delay(200).fadeIn();

  $("#continue").click(function(event){
    //$("#arrow").css({ left: "103%" });
    //$("#confirmation").fadeOut(0);
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
    setInterval(upd_lines, 1000);
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
		    	console.log(data);
          if (lines != data.lines) {
            lines = data.lines;
            var counterString = "-> " + lines.toString() + " lines of data were already collected by all users of Adil.";
            counter.empty();
            exchangeWrite(counterString);
          }
		    	// counter.empty();
		        // counter.append("-> " + data.lines + " lines" + " <span> of data were already collected by all users of Adil.<br><br> In the future users will have the possibility to trade produced data and its parts with interested companies, institutions and organizations for an exchange rate they find acceptable. </span>");
            // var counterString = data.lines.toString();
            // exchangeWrite(counterString);
		    }
		});
	}

	// setInterval(upd_lines, 1000);


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
            $(monitor + '> div:last-child')
              .addClass('monitor_msg')
              .append(data[i]);
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

// $.getJSON( "../data/data.json", function( json ) {
//   $('#statsBox .boxInner').prepend(JSON.stringify(json));
// });

jQuery.get("../data/data.json", undefined, function(data) {
  $('#statsBox .boxInner').prepend(data);
}, "html");

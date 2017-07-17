

$(window).ready(function() {

  //menu
  $("body").delay(200).fadeIn();

  $("#continue").click(function(event){
    //$("#arrow").css({ left: "103%" });
    //$("#confirmation").fadeOut(0);
    $("#log_in").css({ left: "100%" });
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
  });
  //menu dropdown
  $("#dropdown_menu").hover(function(event){
    $("#dropdown_content").show();
    $("#dropdown_menu").css('background-color', '#DCDBCF');
  });
  $("#main, .menu, .content").hover(function(event){
    $("#dropdown_content").hide();
    $("#dropdown_menu").css('background-color', 'transparent');
  });


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

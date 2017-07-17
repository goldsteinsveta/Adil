const remote = require('electron').remote;
const shell = require('electron').shell;
const ipcRenderer = require('electron').ipcRenderer;

// type char by char and line by line in monitor, data can be array or string
function monitorWrite(data, collect) {

  var dClass = ['monitor_date', 'monitor_url', 'monitor_search'];
  var d = 0;

  var monitor;
  if (collect == true) {
    monitor = '#monitor_true';
  }
  else {
   monitor = '#monitor_fake';
   for (var i = 1; i < data.length; i++) {
    data[i] = decodeURI(data[i]);
   };
  }
  console.log(data);

  function monitorWrite_line() {
    if (d < data.length) {
      $(monitor).append('<div></div>');

      // string index
      var i = 0;
      var interval = setInterval(monitorWrite_char, 10);

      function monitorWrite_char() {
        if (data.constructor === Array) {
          console.log('array!');
          $(monitor + '> div:last-child')
            .addClass(dClass[d])
            .append(data[d][i]);

            //$(".item_inner_top").scrollTop($(".item_inner_top")[0].scrollHeight);
            $('.item_inner_top').scrollTop(1000000000000);
          i++;

          if (i >= data[d].length) {
            clearInterval(interval);
            d++;
            monitorWrite_line();
          };
        }
        else {
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
  }
  monitorWrite_line();
}

$('document').ready(function(){

  // mesure screen for main
  var screenSize = [screen.width, screen.height];
  // call driver from main
  ipcRenderer.send('driver', screenSize);

  // typing
  //monitorWrite('hello ' + remote.getGlobal('username'));
  ipcRenderer.on('newData', function(event, data) {
    monitorWrite(data, true);
  });
  ipcRenderer.on('fakeData', function(event, data) {
    monitorWrite(data, false);
  });

  // ipc btns
  var ipcBtn = $('.ipcBtn');
  ipcBtn.click(function() {
    ipcRenderer.send($(this).attr('value'));
    console.log($(this).attr('value'));
  });

});

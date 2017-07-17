const electron = require('electron');
const {app, BrowserWindow, Menu} = require('electron');

const ipcMain = require('electron').ipcMain;
const ipcRenderer = require('electron').ipcRenderer;

// neutro starts
const opn = require('opn');

var refreshIntervalId;
var randomIndex;
var randomString;



var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

//chromedriver
var chrome = require('selenium-webdriver/chrome');
var path = require('chromedriver').path;
var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);


// neutro ends

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({backgroundColor: '#000000', minWidth: 370, minHeight: 500, x: 650, y: 20, width: 370, height: 600, titleBarStyle: 'hidden', maximizable: false, fullscreen: false, alwaysOnTop: true});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/public/index.html');

  //open devtools
  //mainWindow.webContents.openDevTools();

  // selenium
  ipcMain.on('driver', function() {


    var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();
    driver.manage().window().setSize(600, 600);


    function gotowebsite(link){
      driver.get(link);
    }
    gotowebsite('https://accounts.google.com/signin/v2/sl/pwd?hl=de&passive=true&continue=https%3A%2F%2Fwww.google.de%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin&cid=1');


    // selenium-related ipcMain requests
    ipcMain.on('about', function() {
      console.log('about');
    });

  });

  // pages
  ipcMain.on('yo', function() {
    console.log('yo');
  });

  ipcMain.on('go', function() {
    console.log('go');
  });


  // ipcMain.on('data_0', function(event, arg) {
  //   console.log(arg);
  //   event.sender.send('data_1','data_1');
  // });

  global.something = 'value';








  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

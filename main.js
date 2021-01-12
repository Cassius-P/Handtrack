

const { app, shell, BrowserWindow, globalShortcut } = require('electron');
const Nav = require('electron').Menu;
const ipc = require('electron').ipcMain;
let onlineStatusWindow, mainWindow;


/*à
=========================================================================
=========================== Fenêtre de départ ===========================
=========================================================================
 */

function createWindow () {

// Electron Screen calculator
    const screenElectron = require('electron').screen;

    let mainScreen = screenElectron.getPrimaryDisplay();
    let dimensions = mainScreen.size;
    let height = dimensions.width/4;

    if (dimensions.width < 1000) {
        height = dimensions.height;
    } else if (dimensions.width >= 1000 && dimensions.width < 2500) {
        height = dimensions.width/2;
    }

    /*-----Chargement de la vue-----*/
    mainWindow = new BrowserWindow({
        width: dimensions.width,
        height: height,
        show: true,
        frame: true,
        transparent: false,
        fullscreenable:true,
        resizable: true,
        webPreferences: {
            // 2. Enable Node.js integration
            devTools: true,
            nodeIntegration: true
        }
    });

    mainWindow.webContents.on("new-window", function(event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });

    mainWindow.loadURL(`file://${__dirname}/assets/views/index.html`);

    const menuTemplate = [
        {
            label: 'QS-IHM',
            submenu: [
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { type: "separator" },
                { label: "Cut",  accelerator: "CmdOrCtrl+X",  selector: "cut:" },
                { label: "Copy",  accelerator: "CmdOrCtrl+C",  selector: "copy:" },
                { label: "Paste",  accelerator: "CmdOrCtrl+V",  selector: "paste:" },
                { type: "separator" },
                { label: 'Reload', accelerator:'CmdOrCtrl+R', click: () => { app.relaunch(); app.exit(0); }},
                { type: "separator" },
                { label: 'Debug console', accelerator:'CmdOrCtrl+D', click: () => { mainWindow.openDevTools(); }},
                { label: 'Quit', accelerator:'CmdOrCtrl+Q', click: () => { app.quit(); }}
            ]
        }
    ];

    const menuMain = Nav.buildFromTemplate(menuTemplate);
    Nav.setApplicationMenu(menuMain);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    /*-----SplashScreen-----*/
    var splash = new BrowserWindow({
        width: dimensions.width,
        height: (dimensions.height > dimensions.width/4) ? dimensions.width/4 : dimensions.height,
        frame:false,
        show: false,
        transparent: true,
        resizable: false,
        fullscreenable:false,
        webPreferences: {
            // 2. Enable Node.js integration
            devTools: true,
            nodeIntegration: true
        }
    });

    splash.webContents.on("new-window", function(event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });

    //splash.webContents.openDevTools();
    //splash.loadURL(`file://${__dirname}/src/views/splashScreen.html`);

    var mess = 'IHM R&D';
    ipc.on('invokeAction', function(event){
        setTimeout(function(){
            mainWindow.loadURL(`file://${__dirname}/src/views/index.html`);
            mainWindow.once('ready-to-show', () => {
                splash.close();
                app.dock.show();
                mainWindow.show();
            });
        }, 2000);
        event.sender.send('actionReply', mess);
    });
}

//Créer la fenêtre si l'app est démarée
app.on('ready', () => {
    onlineStatusWindow = new BrowserWindow({ width: 0, height: 0, show: false, webPreferences: { nodeIntegration: true } });
    //onlineStatusWindow.loadURL(`file://${__dirname}/online-status.html`);
    createWindow();
    //app.dock.hide();
    globalShortcut.unregister('F11');
});

//Fermer l'appli si la fenêtre est fermée
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.dock.hide();
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
        //app.dock.hide();
    }
});

/*
=========================================================================
=========================== Paramètres POP-UP ===========================
=========================================================================
*/

let newWindow = null;

function popUps(type, width, height) {

    if (newWindow) {
        newWindow.focus();
        return
    }

    newWindow = new BrowserWindow({
        modal:false,
        height: height,
        resizable: false,
        width: width,
        title: type,
        minimizable: false,
        fullscreenable: false,
        frame:true,
        draggable: true,
        webPreferences: {
            nodeIntegration: true,
            devTools: true
        }
    });

    newWindow.webContents.openDevTools();
    newWindow.loadURL(`file://${__dirname}/res/views/` + type.toLowerCase() + `.html`);

    newWindow.on('closed', () => {
        newWindow = null;
    });

    newWindow.on('ready', () => {
        generateMenu();
    });
};

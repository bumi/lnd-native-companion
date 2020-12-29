# LND Companion

Native companion app for the [lightning browser extension](https://github.com/bumi/lightning-browser-extension) to connect to an LND node. 

Under development!


## Development

### 1. Setup Electron

I am currently not sure what's the best development setup for this.

The [native messaging host application](https://developer.chrome.com/docs/apps/nativeMessaging/#native-messaging-host-manifest) requires 
a `path` to an executable to be specified. The browser communicates via stdin/stdout with the native companion. 

Currenty I am using [prebuilt electron binaries](https://www.electronjs.org/docs/tutorial/application-distribution#with-prebuilt-binaries) to run it in development

Download the [prebuild binaries](https://github.com/electron/electron/releases) and clone this repository in a folder named `app` in the Electron's `resources` folder.

OSX: 
```
electron/Electron.app/Contents/Resources/app/
├── package.json
├── index.js
└── ...
```

Windows and Linux:
```
electron/resources/app
├── package.json
├── index.js
└── ...
```

Then use the absolute path to Electron.app on macOS, electron on Linux, or electron.exe on Windows in your host JSON file (joule.json).

### 2. Configure native messaging host

Currently I've only used Chrome for development.

Copy or link the `joule.json` to `/etc/opt/chrome/native-messaging-hosts/joule.json` and configure the `path` as described above.


### 3. Run local react.js server

    $ npm start

This should serve the frontend app on port 3000. 

Do not open the app in the browser. (it opens by default, just close it... it does not work in the browser)


### Install the browser extension

Now install the [lightning-browser-extension](https://github.com/bumi/lightning-browser-extension)


## HELP?

The setup and everything is still very rough. Please reach out or create an issue, I am happy to help. 


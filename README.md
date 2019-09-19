# dusty-plasma-molecular-dynamics-ajp-2019

## Package overview

The attached source is an npm (Node Package Manager) package which has a minimal http server as its dependency and _electron_ along with _eslint_ as its so called developer dependencies, but it does not necessarily depend on [NodeJS](https://nodejs.org), as it can be hosted on any web server. The code itself is object oriented on the higher level, separated into multiple ES6 modules containing classes, which themselves mostly have methods implemented with functional constructs, such as avoiding explicit loops where possible and using maps instead.

## Launching the application

### Running in a browser

Loading modern ES6 modules through the use of the _file://_ protocol is prohibited for security reasons, which makes opening the `index.html` file directly in a browser insufficient, rather the sources need to be returned as a proper response from a host.

If you already have a suitable web server installed, you can point an alias to the `www` folder and access it through that, but in case you don't have one, a minimal http server can be launched with the following command: `npm start`

When it completes successfully and the port `8080` is free, the application should be available at the following url:
http://localhost:8080/www/

If it is inaccessible, check the output of the command, as it contains the bound address, which may differ in some cases.

### Running in electron

The application can be run in electron

`npm run electron:start`

## Build instructions

1. Install **NodeJS** and **npm** from [https://nodejs.org](https://nodejs.org)
2. Download the dependencies: `npm install`
3. Execute the build command for your operating system:
    - mac: `npm run electron:build-mac`
    - linux: `npm run electron:build-linux`
    - win: `npm run electron:build-win`
4. If all operations completed correctly, the packaged executable can be found in the `dist` folder

## Implementation details

### Worker implementation

From a technical standpoint these threads are implemented via so called Web Workers that can be spawned from the main process and afterwards communicate with via messages passed back and forth. Shared memory is not available in this context because of security concerns, but an alternative solution for handling data is through so called [Transferables](https://developer.mozilla.org/en-US/docs/Web/API/Transferable), which are sent by reference, thus no copying is necessary, but once the message is delivered, the sender loses ownership and can no longer access the data. What makes this attractive is that this capability is not only useful for passing large amounts of information without the copying overhead, but safe access can also be granted to any resource that requires mutual exclusivity in a way that presumably makes avoiding deadlocks easier than conventional access barriers. Currently the application has three implemented features that make use of the Transferable interface:

- The communication of the worker threads is accomplished through [MessageChannel](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel) objects specifically created for them, so the information can travel directly between them without the need to be sent back to the main thread and forwarded from there.

- The wave dispersion heat map is displayed using a so called [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas), which presents a way to transfer ownership of a foreground canvas object to another thread, and thus give up control of its contents. This is the actual way in which the _Wave dispersion thread_ displays its results, by not explicitly sending the data back through a message, but rather drawing it directly onto the canvas instance that it gets from the main thread during the initialization phase.

- When 

The application is structured in such a way that the main thread is essentially unaware of the existence of the workers. It only interfaces with wrapper classes which obtain the required information by communicating with their assigned workers, executing the requested operations remotely, retrieving the results and making them available to be accessed by the functions responsible for displaying the user interface.

## Notes

As it has already been noted, the loading of the modern ES6 modules conflicts with the use of the _file://_ protocol.
This makes using them in an electron application more complicated, but one workaround is to server them through a different (fake) protocol.
You can see, that at the bottom of the `index.js` file we define the _es6://_ protocol, which behaves the same as _file://_, but is not blocked by the Chromium browser. This also explains the double inclusion of the main found in the header of the html file:

```
  <script type="module" src="es6://./scripts/index.js"></script>
  <script type="module" src="./scripts/index.js"></script>
```

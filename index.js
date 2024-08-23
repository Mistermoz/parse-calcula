// Example express application adding the parse-server module to expose Parse
// compatible API routes.

import express from 'express';
import { ParseServer } from 'parse-server';
import http from 'http';
import cloud from "./cloud/main.js";

export const config = {
  databaseURI:
    process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017',
  cloud: process.env.CLOUD_CODE_MAIN || cloud,
  appId: process.env.APP_ID || 'parse-server-calcula',
  masterKey: process.env.MASTER_KEY || 'YOUR_APP_MASTER_KEY', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
  emailAdapter: {
    module: "parse-server-generic-email-adapter",
    options: {
       service: "Gmail", // Could be anything like yahoo, hotmail, etc, Full list - see below 
       email: "metabolicaschile@gmail.com",
       password: process.env.EMAIL_PASSWORD || '',
    }
  },
  appName: 'Metabolicas Chile CalculAAA',
  publicServerURL: process.env.PUBLIC_SERVER_URL,
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

export const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static('public'));

// Serve the Parse API on the /parse URL prefix
if (!process.env.TESTING) {
  const mountPath = process.env.PARSE_MOUNT || '/parse';
  const server = new ParseServer(config);
  await server.start();
  app.use(mountPath, server.app);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function (req, res) {
  res.sendFile('/public/test.html', { root: '.' });
});

if (!process.env.TESTING) {
  const port = process.env.PORT || 1337;
  const httpServer = http.createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  await ParseServer.createLiveQueryServer(httpServer);
}
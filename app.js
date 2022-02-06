const fs = require('fs');
const qrcode = require('qrcode-terminal');
const SESSION_FILE_PATH = './session.json';
const { Client, MessageMedia  } = require('whatsapp-web.js');
const path    = require('path');
const pdf2img = require('pdf2img');

var DSAB = require("./Classes/DSAB.js");

pdf2img.setOptions({
    type: 'png',                                // png or jpg, default jpg
    size: 1024,                                 // default 1024
    density: 600,                               // default 600
    outputdir: __dirname + path.sep + 'output', // output folder, default null (if null given, then it will create folder name same as file name)
    outputname: 'test',                         // output file name, dafault null (if null given, then it will create image name same as input name)
    page: null,                                 // convert selected page, default null (if null given, then it will convert all pages)
    quality: 100                                // jpg compression quality, default: 100
  });

var inst = new DSAB();

let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

const client = new Client({
    session: sessionData,
    puppeteer: {
        browserWSEndpoint: `ws://browser:3000?timeout=120000`
    }
});

client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    if (message.body === '!plan') {
        let SeasonId = await inst.getCurrentSeasonId();
        let LeagueId = await inst.getLeagueId(SeasonId);
        let path = await inst.getGamePlan(SeasonId, LeagueId);

        let media = MessageMedia.fromFilePath(path);

        client.sendMessage(message.from, media);
    }

    if (message.body === '!rang') {
        let SeasonId = await inst.getCurrentSeasonId();
        let LeaugeId = await inst.getLeagueId(SeasonId);
        let path1 = await inst.getRanking(SeasonId, LeaugeId);

        pdf2img.convert(path.resolve(path1), function (err, info) {
            if (err) console.log(err);
            else console.log(info);
        
            let media = MessageMedia.fromFilePath(info.message[0].path);
        
            client.sendMessage(message.from, media);
          });


    }

});

  client.initialize();

// (async () => {
//   client.initialize();

//   let SeasonId = await inst.getCurrentSeasonId();
//   let LeaugeId = await inst.getLeagueId(SeasonId);
//   let path1 = await inst.getRanking(SeasonId, LeaugeId);

//   pdf2img.convert(path.resolve(path1), function (err, info) {
//     if (err) console.log(err);
//     else console.log(info);

//     let media = MessageMedia.fromFilePath(info.message[0].path);

//     client.sendMessage(message.from, media);
//   });
// })();

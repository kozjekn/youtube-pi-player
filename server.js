//CONSTS
const PORT_WEB = 3000;
const PORT_SOCKET = 6969;
//IMPORTS
const express = require('express')
const fs = require('fs');
const cors = require('cors');
const VideoQueue = require('./VideoQueue.js');
//const puppeteer = require('puppeteer');

const httpServer = require("http").createServer(function (req, res) {;
    
    fs.readFile('./wwwroot/streamer.html', function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
});



const io = require("socket.io")(httpServer, {
    cors: {
        origin: '*',
    }
});

let videoQueue = new VideoQueue();
let storedVideos = {}
  
fs.readFile('./storedData.json', function (err,data) {
    if (err) {
        return;
    }
    storedVideos = JSON.parse(data);

});

io.on("connection", (socket) => {
    try{
        // Identifies mani socket (socket that plays music)
        socket.on("main_auth",(arg) => {
            socket.join("main_sockets");
        });

        // Identifies mani socket (socket that plays music)
        socket.on("client_auth",(arg) => {
            socket.join("clients");
        });

        //CLIENT MTHODS
        socket.on("requestData", (arg) =>{ socket.emit('data', JSON.stringify(videoQueue)); });
        socket.on("addVideo", (url) =>{
            let video = videoQueue.addVideo(url);
            if(video != null)
            {
                storedVideos[video.videoCode] = video;
                fs.writeFile('./storedData.json', JSON.stringify(storedVideos),() =>{

                });
            }            
            io.local.emit('data', JSON.stringify(videoQueue)); 
        });

        socket.on("addRandomVideos", (num) =>{
            addRandomVideos(num);
            io.local.emit('data', JSON.stringify(videoQueue)); 
            
        });

        function addRandomVideos(num){
            let keys = Object.keys(storedVideos);
            if(Number(num) > keys.length){
                num = keys.length;
            }
            if(keys.length > 0)
            {
                let addedVideos = []
                while(addedVideos.length < Number(num))
                {
                    let r = getRandom(0, keys.length - 1);
                    if(!addedVideos.includes(r))
                    {
                        let rndVideo = storedVideos[keys[r]];
                        rndVideo.videoID = videoQueue.getNextVideoID();
                        videoQueue.videos.push(rndVideo);
                        addedVideos.push(r);
                    }                   
                }
            }
        }
        

        socket.on("removeVideo", (videoID) =>{ 
            videoQueue.removeVideo(videoID); 
            io.local.emit('data', JSON.stringify(videoQueue)); 
            if(videoQueue.videos.length == 0){
                addRandomVideos(1);
                io.local.emit('data', JSON.stringify(videoQueue));
            }
        });
        socket.on("stop", (arg) => { io.local.emit('stop',''); })
        socket.on("start", (arg) => { io.local.emit('start',''); })
        socket.on("mute", (arg) => { io.local.emit('mute',''); })
        socket.on("unmute", (arg) => { io.local.emit('unmute',''); })
        socket.on("move", (arg) => { io.local.emit('move',arg); })
        socket.on("volume", (arg) => { io.local.emit('volume',arg); })
        socket.on("next", (arg) => { io.local.emit('next',''); })

        //MAIN SOCKET METHODS
        socket.on("currData", (_currVideo) =>{ 
            const currVideo = JSON.parse(_currVideo);
            videoQueue.state = currVideo.state;
            videoQueue.currTime = currVideo.currTime;
            videoQueue.currDuration = currVideo.currDuration;
            videoQueue.currVideo = currVideo;
            videoQueue.currVolume = currVideo.currVolume;

            io.local.emit("newCurrData", _currVideo);
        });
    }catch(e){ console.log(e); }
});

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }


//STATIC SITES
let server = express();
server.use(cors());
server.use('/', express.static('./wwwroot/client/'));


//EXPRESS STARTUP
server.listen(PORT_WEB);
console.log('Listening on port '+ PORT_WEB);

//SOCKET STARTUP
httpServer.listen(PORT_SOCKET);
console.log('Listening on port '+ PORT_SOCKET);


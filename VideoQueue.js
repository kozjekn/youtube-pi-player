class VideoQueue{
    constructor(){
        this.videos = [];
        // -1 – unstarted
        // 0 – ended
        // 1 – playing
        // 2 – paused
        // 3 – buffering
        // 5 – video cued
        this.state = 0;
        this.currTime = 0;
        this.currDuration = -1;
        this.currVideo = null;
        this.currVolume = 100;

        this.nextVideoID = 1;
    }

    addVideo(url){
        this.videos.push(new Video(this.nextVideoID, url));
        this.nextVideoID ++;
    }

    removeVideo(videoID){
        this.videos = this.videos.filter( (video) =>{ return video.videoID != videoID; });
    }
}


class Video{
    constructor(videoID, url){
        this.videoID = videoID;
        this.url = url;
        
        this.videoCode = url.split('watch?v=')[1];
    }
}

//EXPORTS
module.exports = VideoQueue;
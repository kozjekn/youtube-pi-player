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

    getNextVideoID(){
        this.nextVideoID ++;
        return this.nextVideoID;
    }

    addVideo(url){
        try{
            if(url.split('watch?v=').length > 1)
            {
                let video = new Video(this.getNextVideoID(), url);
                this.videos.push(video);
                return video;
            }
            return null;
        }
        catch(e){
            return null;
        }
    }

    removeVideo(videoID){
        this.videos = this.videos.filter( (video) =>{ return video.videoID != videoID; });
    }
}


class Video{
    constructor(videoID, url){
        this.videoID = videoID;
        this.url = url;

        this.videoCode = url.split('watch?v=')[1].split('&')[0];
        this.iFrameUrl = 'https://www.youtube.com/embed/' + this.videoCode;
    }
}

//EXPORTS
module.exports = VideoQueue;

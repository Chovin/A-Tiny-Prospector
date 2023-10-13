class Sfx {
  constructor() {
    
  }
  play() {
    
  }
  stop() {
    
  }
}
window.Sfx = Sfx

class BGM {
  constructor(path, loop=false) {
    this.player = new Tone.Player({url: path, loop: loop}).toDestination();
  }
  play() {
    Tone.loaded().then(() => {
    	this.player.start();
    });
  }
  stop(at_time) {
    this.player.stop(at_time)
  }
}
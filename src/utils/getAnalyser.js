import isEmpty from './isEmpty';

var ctx = new (window.AudioContext || window.webkitAudioContext)(); // creates audioNode
var analyser = ctx.createAnalyser(); // creates analyserNode

// Required to patch getFloatTimeDomainData for Safari
if (AnalyserNode && isEmpty(AnalyserNode.prototype.getFloatTimeDomainData)) {
  var uint8 = new Uint8Array(2048);
  AnalyserNode.prototype.getFloatTimeDomainData = function(array) {
    this.getByteTimeDomainData(uint8);
    for (var i = 0, imax = array.length; i < imax; i++) {
      array[i] = (uint8[i] - 128) * 0.0078125;
    }
  };
}
export { ctx, analyser };

var context = new AudioContext();

var osc = context.createOscillator();

osc.connect(context.destination);

var frequenceStart = 200;
var frequenceStep = 20;
var frequenceCurrent = frequenceStart;

window.setInterval(function() {
	osc.frequency.value = frequenceCurrent;
	frequenceCurrent += frequenceStep;
	console.log(osc.frequency.value);
}, 200);


osc.start(0);
var context = new AudioContext();

var osc = context.createOscillator();

osc.connect(context.destination);

var frequenceStart = 200;
var frequenceStep = 5;
var frequenceCurrent = frequenceStart;

window.setInterval(function() {
	osc.frequency.value = frequenceCurrent;
	frequenceCurrent += frequenceStep;
	console.log(osc.frequency.value);
	if(frequenceCurrent == 1000) frequenceCurrent = frequenceStart;
}, 20);


osc.start(0);
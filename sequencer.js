var context = new AudioContext();

var osc = context.createOscillator();
var gain = context.createGain();

osc.connect(gain);
gain.connect(context.destination);

gain.gain.value = 0.5;

var frequenceStart = 200;
var frequenceStep = 100;
var frequenceCurrent = frequenceStart;

var attackTime = 0.25;
var sustainTime = 0.25;
var decayTime = 0.25;
var releaseTime = 0.25;

window.setInterval(function() {
	var now = context.currentTime;

	gain.gain.cancelScheduledValues(now);

	gain.gain.setValueAtTime(0, now);

	//attack
	gain.gain.linearRampToValueAtTime(0.8, now + attackTime);

	//decay
	gain.gain.linearRampToValueAtTime(1, now + attackTime + decayTime);

	//sustain
	gain.gain.linearRampToValueAtTime(1, now + attackTime + decayTime + sustainTime);

	//release
	gain.gain.linearRampToValueAtTime(0, now + attackTime + decayTime + sustainTime + releaseTime);

	osc.frequency.value = frequenceCurrent;
	frequenceCurrent += frequenceStep;
	console.log(osc.frequency.value);
	if(frequenceCurrent == 1000) frequenceCurrent = frequenceStart;
}, 1200);


osc.start(0);
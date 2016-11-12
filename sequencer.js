var context = new AudioContext();

var osc = context.createOscillator();
var gain = context.createGain();

osc.connect(gain);
gain.connect(context.destination);

osc.type = "square";

var attackTime = 0.1;
var sustainTime = 0.1;
var decayTime = 0;
var releaseTime = 0.1;

function playOsc(frequency, waveType) {
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

	osc.frequency.value = frequency;

	osc.type = waveType;

	console.log(osc.frequency.value, osc.type);
}


var sequenceTimeout;
var tact = 1;
var beat = 1;

//Sequencer
function sequence() {
	$('.currentBeat').removeClass('currentBeat');
	$('[data-beattop-' + tact + '-' + beat + ']').addClass('currentBeat');

	var bpm = $('[data-bpm]').val();

	if($('[data-sample-' + tact + '-' + beat + ']').is(':checked'))
		playOsc($('[data-osc-freq]').val(), $('[data-osc-wavetype]').val());
	
	beat++;
	if(beat > 4) {
		beat = 1;
		tact++;
	}
	if(tact > 4) {
		tact = 1;
	}

	sequenceTimeout = window.setTimeout(sequence, 60 / bpm * 1000);
}

$('[data-start]').on('click', function() {
	sequence();
	osc.start(0);
});

$('[data-stop]').on('click', function() {
	osc.stop();
	window.clearTimeout(sequenceTimeout);
});







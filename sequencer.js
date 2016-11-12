navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

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

/*  */

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

var clapBuffer;

function loadClap() {
	var audioURL='http://audiojam.diin.io/sounds/CP.mp3';
	var request = new XMLHttpRequest();
	request.open("GET",audioURL,true);
	request.responseType='arraybuffer';
	request.addEventListener('load', function() {
		context.decodeAudioData(request.response, function(buffer){ 
			clapBuffer = buffer;
			console.log('audio geladen');
		});

	});
	request.send();
}
loadClap();

function playClap() {
	var source = context.createBufferSource();
	source.connect(context.destination);
	source.buffer = clapBuffer;
	source.start(0);
}


// micro recorder

var recordedSource;
function record() {
	navigator.getUserMedia({ audio: true }, function(stream) {
		recordStream = stream;
		console.log('recording');
		var input = context.createMediaStreamSource(stream);
		var rec = new Recorder(input);
		rec.record();
		window.setTimeout(function() {
			rec.stop();
			rec.getBuffer(function(buffers) {
				var recordedSource = context.createBufferSource();
			    var newBuffer = context.createBuffer( 2, buffers[0].length, context.sampleRate );
			    newBuffer.getChannelData(0).set(buffers[0]);
			    newBuffer.getChannelData(1).set(buffers[1]);
			    recordedSource.buffer = newBuffer;

			    newSource.connect( context.destination );
			    newSource.start(0);
			});
		}, 1000);
	}, function() {
		console.log('recording error');
	})
}
record();


//Sequencer

var sequenceTimeout;
var tact = 1;
var beat = 1;

function sequence() {
	$('.currentBeat').removeClass('currentBeat');
	$('[data-beattop-' + tact + '-' + beat + ']').addClass('currentBeat');

	var bpm = $('[data-bpm]').val();

	console.log($('[data-osc] [data-sample-' + tact + '-' + beat + ']').is(':checked'));
	// freq track
	if($('[data-osc] [data-sample-' + tact + '-' + beat + ']').is(':checked'))
		playOsc($('[data-osc-freq]').val(), $('[data-osc-wavetype]').val());

	// clap track
	if($('[data-clap] [data-sample-' + tact + '-' + beat + ']').is(':checked'))
		playClap();
	
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
});

$('[data-stop]').on('click', function() {
	gain.gain.setValueAtTime(0, context.currentTime);
	window.clearTimeout(sequenceTimeout);
});

osc.start(0);
gain.gain.setValueAtTime(0, context.currentTime);


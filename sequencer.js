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

var fileBuffer = [];

function loadFile(file, index) {
	console.log(file);
	var audioURL='http://audiojam.diin.io/sounds/' + file;
	var request = new XMLHttpRequest();
	request.open("GET",audioURL,true);
	request.responseType='arraybuffer';
	request.addEventListener('load', function() {
		context.decodeAudioData(request.response, function(buffer){ 
			fileBuffer[index] = buffer;
			console.log('audio geladen');
		});
	});
	request.send();
}
function playFile(index) {
	console.log(index);
	var source = context.createBufferSource();
	source.connect(context.destination);
	source.buffer = fileBuffer[index];
	source.start(0);
}
function initFile(element, index) {
	element.data('file', index);
	element.find('select').on('change', function() {
		loadFile(this.value, index);
	});
	loadFile(element.find('select').val(), index);
}
$('[data-file]').each(function(index, element){
	initFile($(element), index);
});


// micro recorder

var recordedBuffer;
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
			    recordedBuffer = context.createBuffer( 2, buffers[0].length, context.sampleRate );
			    recordedBuffer.getChannelData(0).set(buffers[0]);
			    recordedBuffer.getChannelData(1).set(buffers[1]);
			    playRecorded();
			});
		}, $('[data-record-duration]').val());
	}, function() {
		console.log('recording error');
	})
}
function playRecorded() {
	var recordedSource = context.createBufferSource();
    recordedSource.buffer = recordedBuffer;

    recordedSource.connect( context.destination );
    recordedSource.start(0);	
}
$('[data-record-start]').on('click', function() {
	record();
});


//Sequencer

var sequenceTimeout;
var tact = 1;
var beat = 1;

function sequence() {
	$('.currentBeat').removeClass('currentBeat');
	$('[data-beattop-' + tact + '-' + beat + ']').addClass('currentBeat');

	var bpm = $('[data-bpm]').val();

	// freq track
	if($('[data-osc] [data-sample-' + tact + '-' + beat + ']').is(':checked'))
		playOsc($('[data-osc-freq]').val(), $('[data-osc-wavetype]').val());

	// file track
	$('[data-file]').each(function(index, element) {
		if($(element).find('[data-sample-' + tact + '-' + beat + ']').is(':checked'))
			playFile($(this).data('file'));
	});

	// recorded track
	if($('[data-record] [data-sample-' + tact + '-' + beat + ']').is(':checked'))
		playRecorded();
	
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

$('[data-add-file-track]').on('click', function() {
	var element = $('[data-file]:first').clone();
	$('[data-tracks]').append(element);
	initFile(element, $('[data-file]').length);
});

$('[data-clear-all]').on('click', function() {
	$('input[type="checkbox"]').each(function(index, element) {
		element.checked = null;
	});
})

osc.start(0);
gain.gain.setValueAtTime(0, context.currentTime);


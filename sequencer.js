navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

var context = new AudioContext();

var attackTime = 0.1;
var sustainTime = 0.1;
var decayTime = 0;
var releaseTime = 0.1;

/*  */

function playOsc(frequency, waveType) {
	console.log(frequency, waveType);
	var osc = context.createOscillator();
	var gain = context.createGain();

	osc.connect(gain);
	gain.connect(context.destination);

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
	osc.start(now);

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

var recordedBuffer = [];
function record(index, duration) {
	navigator.getUserMedia({ audio: true }, function(stream) {
		recordStream = stream;
		console.log('recording');
		var input = context.createMediaStreamSource(stream);
		var rec = new Recorder(input);
		rec.record();
		window.setTimeout(function() {
			rec.stop();
			rec.getBuffer(function(buffers) {
			    recordedBuffer[index] = context.createBuffer( 2, buffers[0].length, context.sampleRate );
			    recordedBuffer[index].getChannelData(0).set(buffers[0]);
			    recordedBuffer[index].getChannelData(1).set(buffers[1]);
			    playRecorded(index);
			});
		}, duration);
	}, function() {
		console.log('recording error');
	})
}
function playRecorded(index) {
	var recordedSource = context.createBufferSource();
    recordedSource.buffer = recordedBuffer[index];

    recordedSource.connect( context.destination );
    recordedSource.start(0);	
}

function initRecord(element, index) {
	element.data('record', index);
	element.find('[data-record-start]').on('click', function() {
		record(index, $(element).find('[data-record-duration]').val());
	});
}
$('[data-record]').each(function(index, element){
	initRecord($(element), index);
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
	$('[data-osc]').each(function(index, element) {
		if($(element).find('[data-sample-' + tact + '-' + beat + ']').is(':checked'))
			playOsc(
				$(element).find('[data-osc-freq]').val(), 
				$(element).find('[data-osc-wavetype]').val()
			);

	});

	// file track
	$('[data-file]').each(function(index, element) {
		if($(element).find('[data-sample-' + tact + '-' + beat + ']').is(':checked'))
			playFile($(this).data('file'));
	});

	// recorded track
	$('[data-record]').each(function(index, element) {
		if($(element).find('[data-sample-' + tact + '-' + beat + ']').is(':checked'))
			playRecorded($(this).data('record'));
	});
	
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
	window.clearTimeout(sequenceTimeout);
});

$('[data-add-file-track]').on('click', function() {
	var element = $('[data-file]:first').clone();
	$('[data-tracks]').append(element);
	initFile(element, $('[data-file]').length);
});

$('[data-add-osc-track]').on('click', function() {
	var element = $('[data-osc]:first').clone();
	$('[data-tracks]').append(element);
});

$('[data-add-record-track]').on('click', function() {
	var element = $('[data-record]:first').clone();
	$('[data-tracks]').append(element);
	initRecord(element, $('[data-record]').length);
});


$('[data-clear-all]').on('click', function() {
	$('input[type="checkbox"]').each(function(index, element) {
		element.checked = null;
	});
});

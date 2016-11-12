var context = new AudioContext();

var osc = context.createOscillator();

osc.connect(context.destination);


window.setInterval(function() {
	osc.frequency.value = 200 + Math.random() * 5000;
	console.log(osc.frequency.value);
}, 200);


osc.start(0);
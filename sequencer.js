var context = new AudioContext();

var osc = context.createOscillator();

osc.connect(context.destination);

osc.start(0);
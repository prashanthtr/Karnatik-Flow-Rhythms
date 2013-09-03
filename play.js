
//takes in input, the instrument, the diction, loudness and time signature and returns an output that is playable

var pDur = 8;
var steller = org.anclab.steller;       // Alias for namespace.
var util = steller.Util;

var AC = new webkitAudioContext();      // Make an audio context.
var src = AC.createBufferSource();
var sh = new steller.Scheduler(AC);     // Create a scheduler and start it running.
sh.running = true;
var models = steller.Models(sh);
var gain = AC.createGainNode();

var gainR = AC.createGainNode(), gainL = AC.createGainNode();
var merger = AC.createChannelMerger(2);

gainL.connect(merger, 0, 0);
gainR.connect(merger, 0, 0);

merger.connect(AC.destination);

var pat = require("patternDistance");
var strokes = require("patternsList");
var rhythm = require("rhythmObject");
var utils = require("utilities");
var wholeRand = utils.wholeRand;
var numOccurences = utils.numOccurences;

var rhythmPattern = rhythm.rhythmPattern;

var mridangam, kanjira; //currently playing rhythm objects
var fallback = ["tum",".",".",".","tum",".",".",".","tum",".",".",".","tum",".",".","."]; 
var mridangamSol = strokes.mSol;
var kanjiraSol = strokes.kSol;


var mSol = [], mstroke = ["."], loud = 1.0;
document.getElementById('tempo').addEventListener( "change", function(){		
    tempo = document.getElementById("tempo").value;
    //set delay range to 30ms
    delay_range = (2 *tempo )/ 600;
}); 

var curHitTime =0, prevHitTime = 0;
var mLastPlayed = [];

function selectStroke( stroke, velocity,time){
    
    //each hit has a diction and time
    mstroke = [stroke];
    loud = mapVelLoudness( velocity);
    curHitTime = time;
}

function mapVelLoudness( vel){
    var low = 30, high = 127, maxAmp = 2.0;
    return ( (vel - low )/ ( high- low) ) * maxAmp;
}

function strokepress(){

    //mapMridangamKey(String.fromCharCode(e.keyCode)) || ".";      
    //trying to use time to see if note has been hit or not

    var keygen = sh.loop(sh.dynamic(function (clock) {
	debugger;
	var prev = prevHitTime; //storing prevHit and updating it to current
	prevHitTime = curHitTime;
	return sh.track( mstroke.map( function (s,index,arr){
	    
	    if( s != "." && curHitTime != prev  && sounds[s]){ //ensures that a valid stroke has been hit on the keyboard for the current beat
		mLastPlayed.push(s);
	    	return sh.track(sounds[s].trigger(loud),sh.delay(1.0));
	    }
	    else{
		mLastPlayed.push(".");
		return sh.track(sh.delay(1.0));
	    }
	    
	}));
	
    }));
    
    sh.play(sh.track (sh.rate(2*tempo/60),
		      keygen));	

}


var tempo = 0;

var wavs = ['ta', 'te', 'tum','tumki','thum', 'tha','thi','thom','num','dhin','dheem','dham','ri','tham','bheem',"sanjay","jambupathe","clap"];

var sounds = {};

function init_vars(){
    tempo = document.getElementById("tempo").value;
    // will result in the wavs all being loaded in parallel.
    var loader = sh.fork(wavs.filter(function (w) { return w !== ','; }).map(function (w) {
	if( w == "num" || w =="dheem" || w == "clap" || w == "jambupathe"){
	    return (sounds[w] = sh.models.sample('audio/' + w + '.wav').connect(gainR)).load;  
	}
	else{
	    return (sounds[w] = sh.models.sample('audio/' + w + '.wav').connect(gainL)).load;  
	}
	
    }));
    
    sh.play(loader);
    // Make an action which when played like sh.play(action)
}

init_vars();


function playAcc(instrument, dict, loud, ts) {

    //selects pattern each time and plays it
    
    var dur = 300 * (60/tempo);
	
    var song = sh.loop( sh.track ( sounds["jambupathe"].trigger(1.0), sh.delay(dur)));
    sh.play( song);
    
    var generator = sh.loop(sh.dynamic(function (clock) {
	
	var play;

	if(instrument == "mridangam"){
	    
	}
	else{

	    var len = mLastPlayed.length;
	    if( numOccurences(".", mLastPlayed.slice(len-8,len))> 5) {
	    	gainL.gain.value = 0;
	    	
	    }
	    else if(gainL.gain.value == 0){
		gainL.gain.value = 1;
		
	    }
	    
	    var kan = kanjiraSol[wholeRand(0, kanjiraSol.length)];
	    dict = kan[0];
	    ts = kan[1];
	    loud = [];	
	}
	//select from one of the acceptable patterns and play
	play = rhythmPattern(dict,loud,ts);
	//kanjira = play[1];
	debugger;
	var strokeSeq = play[0][2];
	var strokeTempo = play[0][1];
	var strokeAccent = play[0][0];
	var del = 0.0;
	mSol = [];
	
	document.getElementById(instrument).value = "[" + strokeSeq.join(" ") + "]";		    //needs to improve	
	
	return sh.track( strokeSeq.map(function(s,index){
	    //var del = sh.delay(4.0/(10 * strokeTempo[index]));

	    try{
		
	    	if(s == "."){
		    return sh.delay(4.0/strokeTempo[index]);
		}
		else{	
		    return sh.track([  sounds[s].trigger(strokeAccent[index]), sh.delay(4.0/strokeTempo[index])]);
		}
	    }
	    catch(err){
		//debugger;
	    }

	}));
	
    }));
    
    var del = 0.0;
    if(instrument == "kanjira"){
	del = 8;
    }
    
    sh.play(sh.track (sh.rate(tempo/60),
		      sh.delay(del),
		      generator));	
    
};

exports.audioContext = AC;
exports.scheduler = sh;
exports.gainNode = gainL;
exports.playAcc = playAcc; 
exports.keyPress = strokepress;
exports.selectStroke = selectStroke;


/*	    do{
	    
	    var kan = kanjiraSol[i];
	    dict = kan[0];
	    ts = kan[1];
	    loud = [];
	    play = rhythmPattern(dict,loud,ts);
	    
	    kanjira = play[1];
	    i++;
	    
	    }while(pat.patternDistance(mridangam, kanjira,i-1) !=0 && i<kanjiraSol.length);
	    if( i > kanjiraSol.length){
	    dict = fallback;
	    ts = [0,0,4];
	    loud = [];
	    play = rhythmPattern(dict,loud,ts);
	    kanjira = play[1];
	    }
	    console.log(pat.patternDistance(mridangam, kanjira));
	    
	    }*/

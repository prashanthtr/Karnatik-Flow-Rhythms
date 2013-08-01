
//takes in input, the instrument, the diction, loudness and time signature and returns an output that is playable

 var pDur = 8;
 var steller = org.anclab.steller;       // Alias for namespace.
 var util = steller.Util;

 var AC = new webkitAudioContext();      // Make an audio context.
 var src = AC.createBufferSource();
 var sh = new steller.Scheduler(AC);     // Create a scheduler and start it running.
 sh.running = true;
 var models = steller.Models(sh);

 var gain = AC.createGainNode(), gainR = AC.createGainNode(),splitter = AC.createChannelSplitter(2); //gain nodes and channel split
 
var pat = require("patternDistance");
var strokes = require("patternsList");
var rhythm = require("rhythmObject");
var utils = require("utilities");
var wholeRand = utils.wholeRand;

 var rhythmPattern = rhythm.rhythmPattern;

var mridangam, kanjira; //currently playing rhythm objects
var fallback = ["tum",".",".",".","tum",".",".",".","tum",".",".",".","tum",".",".","."]; 
var mridangamSol = strokes.mSol;
var kanjiraSol = strokes.kSol;


var mSol = [];
function keypress(e){
    
    if(String.fromCharCode(e.keyCode) == "a" || String.fromCharCode(e.keyCode) == "k"){
	
	var stroke = mapMridangamKey(String.fromCharCode(e.keyCode));
	mSol.push(stroke);	
	console.log(stroke);
	return stroke;
    }
    else{
	mSol.push(".");
	console.log(".");
	return null;
    }

}

function mapMridangamKey( str){
    if(str == "a"){
	return "num";
    }
    else return "dheem";
}


var tempo = 0;
	
	 var wavs = ['ta', 'te', 'tum','tumki','thum', 'tha','thi','thom','num','dhin','dheem','dham','ri','tham','bheem',"sanjay","jambupathe","clap"];

	 var sounds = {};
 
 function init_vars(){
 	tempo = document.getElementById("tempo").value;
    // will result in the wavs all being loaded in parallel.
    var loader = sh.fork(wavs.filter(function (w) { return w !== ','; }).map(function (w) {
	return (sounds[w] = sh.models.sample('audio/' + w + '.wav').connect(gain)).load;	    
	
    }));
    
    sh.play(loader);
    // Make an action which when played like sh.play(action)
}

init_vars();

function playAcc(instrument, dict, loud, ts) {

    
    //selects pattern each time and plays it
    
    var generator = sh.loop(sh.dynamic(function (clock) {
	var play;
	
	if(instrument == "mridangam"){
	    
	    if(mSol.length != pDur){
		dict = mridangamSol[0][0];	    	
		ts = mridangamSol[0][1];	    	
		loud = mridangamSol[0][2];	    	
	    }
	    else dict = mSol;
	    
	    play = rhythmPattern(dict,loud,ts);
	    mridangam = play[1];
	    
	}
	else{ //select kanjira based on the mridangam
		
	    //select from one of the acceptable patterns and play
	    var kan = kanjiraSol[wholeRand(0, kanjiraSol.length)];
	    dict = kan[0];
	    ts = kan[1];
	    loud = [];
	    play = rhythmPattern(dict,loud,ts);
	    kanjira = play[1];
	    
	}

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
		debugger;
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
exports.gainNode = gain;
exports.playAcc = playAcc; 
exports.keyPress = keypress;



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

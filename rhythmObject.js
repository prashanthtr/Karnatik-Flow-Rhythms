

/* 

Rhythm object module that returns a rhythm object that is playable at a given tempo

Each rhythm has the following properties:

Diction Array -> Sequence of strokes, for eg: "ta ka dhim ta"
Loudness Array -> positions where strokes are played with increased and decreased loudness, for eg: "1 0 0 1",
Speed Array-> Speed at which each stroke is played in the pattern, eg: "2 2 2 2" or "2 2 2 [4,4]" 

Weight Structure -> Assigns a weight for each storke in the pattern
Accent structure -> Emphasis of strong and weak beats

*/

var utils = require("utilities");
var getEle = utils.getEle;

var rhythmPattern = function(diction, loudness, ts){   
	
	//assign pauses
	var duration = diction.length;
	var pauses = [];
	var start = ts[0], dur = ts[1], timeSign = ts[2] ; //dur ->no of claps
	
	diction.map(function(s,index){
		if(s == "."){
			pauses.push(index);
		}
	});
	
	function sub(s){
	    return s-1;
	}
	
	//array positions
	if(loudness != []){
	    loudness = loudness.map(sub);
	}
	

	//returns that diction as an array
	this.dictionArr = function (){

	    var arr = diction;
	    arr = arr.map(function(s){
		if(s == "tum"){
		    return "tumki";
		}
		else return s;
	    });

	    arr = arr.map(function(s,index){
		return s.split(" ");
	    });
	    
	    return arr;
	}

	//assigns loudness level based on loudness array and pauses array
	this.loudnessArr = function (){
	    var s = 2, w=0.5; //level at which they are played
	    var temp = utils.generateBaseValue(duration,w);
	    var arr = temp.map(function(st,index){
		if(utils.arrElementCmp(index,loudness) == 1){	
		    return st + s;
		}
		if(utils.arrElementCmp(index,pauses) == 1){
		    return 0;
		}
		else{
		    return st;
		}
	    });
	    
	    return arr;
	};
	
	//returns both single dimensional array and 3 arrays based on speed at which they are played
	this.speedArr = function(){
	    
	    var s = [utils.generateBaseValue(start,4), utils.generateBaseValue(dur*timeSign,timeSign),utils.generateBaseValue(duration - start - dur*timeSign,4)];
	    
	    var i =0,j=0, arr = [];
	    while(j<s.length){
		if(i >= s[j].length){i=0;j++;}
		else{
		    arr.push(s[j][i]);
		    i++;
		}
	    }
	    return [arr,s];
	};
	
	//maps each stroke to a corresponding weight taking into account the loudness too
	this.weightArr = function(){
	    
	    var d = dictionArr();
	    var l = loudnessArr();
	    
	    var combined = l.map(function(s,index){
	    	if( d[index] == "."){
	    		return s;
	    	}
	    	else return getEle(d[index]) + s;
	    });
 	    return combined;
	    
	};

	
	var play = [loudnessArr(),speedArr()[0],dictionArr()];
	var weight = weightArr(loudnessArr, dictionArr);
	var weights = [weight, speedArr()[1]];

	return [play,weights];

}
    
    
exports.rhythmPattern = rhythmPattern;


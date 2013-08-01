
 // Some helpers for the demos.

var pDur = 16;
 var steller = org.anclab.steller;       // Alias for namespace.
 var util = steller.Util;

 var AC = new webkitAudioContext();      // Make an audio context.
 var src = AC.createBufferSource();
 var sh = new steller.Scheduler(AC);     // Create a scheduler and start it running.
 sh.running = true;
 var models = steller.Models(sh);

 var wavs = ['ta', 'te', 'tum','tumki','thum', 'tha','thi','thom','num','dhin','dheem','dham','ri','tham','bheem',"sanjay","jambupathe"];


 var sounds = {};
 var tala, mridangamBase, kanjiraBase;
 var pattern = 0, prevPattern = 0, flag = 1, unacceptable=[], acceptable = [];

 var gain = AC.createGainNode(), gainR = AC.createGainNode(),splitter = AC.createChannelSplitter(2); //gain nodes and channel split
 var mriPattern = 0;
 //splitter.connect(gainL, 0);
 //splitter.connect(gainR, 1);

 var mridangamSol = [

//     [ ["num","dheem",".","num","num","dheem",".","num","num","dheem",".","num","num","dheem",".","num",], [0,0,4], [1,9]],    

//     [ ["num","dheem","dheem","dheem","num","dheem","dheem","dheem","num","dheem","dheem","dheem","num","dheem","dheem","dheem"], [0,0,4], [1]],    

     [ ["num",".","dheem",".","num",".","dheem",".","num",".","dheem",".","num",".","dheem",".",], [0,0,4], [1]],    
];

 var kanjiraSol = [ 
     
     [["tum",".","tum","ta","ta","tum","tum","ta","tum",".","tum","ta","ta","tum","tum","ta"],[0,0,4]],
     
     //[["ta",".", "tum",".","ta",".", "tum",".","ta",".", "tum",".","ta",".", "tum",".",],[0,0,4]],

     //[["ta","tum",".","ta","ta","tum",".","ta","ta","tum",".","ta","ta","tum",".","ta",],[0,0,4]],

//     [["tum",".",".",".","tum",".",".",".","tum",".",".",".","tum",".",".","."],[0,0,4]]
     
     //[["ta","tum","tum","ta"],[0,0,4]],    
    // [["ta","tum",".","ta"], [0,0,4]],
 ];

 var mSol = [];

 var mridangam, kanjira; //currently playing

document.onkeypress = function(e){
    
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

    //console.log(String.fromCharCode(e.keyCode));
    //return String.fromCharCode(e.keyCode);
}

function mapMridangamKey( str){
    if(str == "a"){
	return "num";
    }
    else return "dheem";
}

var mridangamKey = document.onkeypress;

/*document.addEventListener("keydown", function(e){    

    
     //console.log(mSol);

     },false);*/

document.getElementById('tempo').addEventListener( "change", function(){		
		tempo = document.getElementById("tempo").value;
		//set delay range to 30ms
		delay_range = (2 *tempo )/ 600;
	}); 

var play_pattern = document.getElementById('play');			
play_pattern.addEventListener("click", playKanjira , true);

function init_vars(){

    tempo = document.getElementById("tempo").value;
    
    //song = document.getElementById("track").value;    
    //wavs.push(song);

    // will result in the wavs all being loaded in parallel.
    var loader = sh.fork(wavs.filter(function (w) { return w !== ','; }).map(function (w) {
	return (sounds[w] = sh.models.sample('audio/' + w + '.wav').connect(gain)).load;	    
	
    }));
    
    sh.play(loader);
    // Make an action which when played like sh.play(action)
    
}

var play_pattern = document.getElementById('play');			
play_pattern.addEventListener("click", playKanjira , true);

document.getElementById("stop").addEventListener("click",stop,false);

document.getElementById("prev").addEventListener("click",function(){
    var pat = Math.floor(pattern);
    pattern = modnum(kanjiraSol.length, pat, 1);
    mriPattern = modnum(mridangamSol.length, Math.floor(mriPattern), 1);
},false);

document.getElementById("next").addEventListener("click",function(){
    pattern = Math.floor(pattern + 1) % kanjiraSol.length;
    mriPattern = Math.floor(mriPattern + 1) % mridangamSol.length;
},false);

document.getElementById("dump").addEventListener("click",function(){
    var typ = document.getElementById("patType").value;
    var loc = window.location.pathname;
    var str = loc + " -- " + typ;
    if(typ == "a"){
	//debugger;
	localStorage.setItem(str,acceptable);
    }
    else localStorage.setItem(str,unacceptable);
},false);



function stop(){

    if(gain.gain.value == 0){
	gain.gain.value = 1; 
    }
    else{
	gain.gain.value = 0;
	//gain.disconnect();
	var pat = Math.floor(pattern);
	prevPattern = pat; // store context
	
	var str = document.getElementById("patType").value;
	if( str == "ua"){
	    unacceptable.push(pat);
	}
	else acceptable.push(pat);
	pattern = prevPattern;//modnum(kanjiraSol.length,prevPattern,1);
	console.log("pattern ID" + pat);
    }
}


document.getElementById("resume").addEventListener("click",function(){
	
    //gain.connect(AC.destination);
    gain.gain.value = 1; //stop playing and start playing from previous pattern
    
    //pattern = prevPattern - 1; //latest stop
    
},true);


function playKanjira(){
    sh.running = true; 
    gain.connect(AC.destination);    
    var dur = 300 * (60/tempo);
    var song = sh.loop( sh.track ( sounds["jambupathe"].trigger(1.0), sh.delay(dur)));
    //sh.play(song);
    var mrkey = sh.loop(sh.track( [mridangamKey, sh.delay(60/tempo)]));
    sh.play(mrkey);
    playAcc("mridangam");
    playAcc("kanjira");
}

var playAcc = function (instrument) {


    var rhythmPattern = function(params){   
	
	var duration = params[0], speed = params[1], loudness = params[2], pauses = params[3];
	var ts = params[5];
	var diction = params[4];
	
	function sub(s){
	    return s-1;
	}
	
	//array positions
	if(loudness != []){
	    loudness = loudness.map(sub);
	}
	if(pauses != []){
	    pauses = pauses.map(sub);	
	}

	if(speed != []){	
	    speed = speed.map(sub);
	}


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


	this.loudnessArr = function (){
	    var s = 2, w=0.5; //level at which they are played
	    var temp = generateBaseValue(duration,w);
	    var arr = temp.map(function(st,index){
		if(arrElementCmp(index,loudness) == 1){	
		    return st + s;
		}
		if(arrElementCmp(index,pauses) == 1){
		    return 0;
		}
		else{
		    return st;
		}
	    });
	    /*arr = arr.map(function(s,index){
	      if(arrElementCmp(index,speed) == 1 && arrElementCmp(index,pauses) == 0){
	      return [w,w];
	      }	    
	      else return [s];
	      });	*/
		
		//loudness intended at any point
	    return arr;
	};
	
	this.speedArr = function(){
	    
	    var start = ts[0], dur = ts[1], timeSign = ts[2] ; //dur ->no of claps
	    var s = [generateBaseValue(start,4), generateBaseValue(dur*timeSign,timeSign),generateBaseValue(duration - start - dur*timeSign,4)];
	    // roughly generates
	    var i =0,j=0, arr = [];
	    while(j<s.length){
		if(i >= s[j].length){i=0;j++;}
		else{
		    arr.push(s[j][i]);
		    i++;
		}
	    }
	    
	    /*var arr = arr.map(function(s,index){
	      if(arrElementCmp(index,speed) == 1 && arrElementCmp(index,pauses) == 0){
	      return [8,8];
	      }
	      else{
	      return [4];
	      }
	      });*/
	    return arr;
	};

	this.timeSignature = function(){
	    
	    var start = 0, dur = 0, timeSign = 4;
	    if(ts.length == 3){
		start = ts[0]; dur = ts[1]; timeSign = ts[2] ; //dur ->no of claps
	    }
	    else ts = [start, dur, timeSign];

	    duration = (start - 0) + dur * timeSign + (duration - start - dur*4);
	    var lArr = loudnessArr();
	    var sArr = speedArr();
	    var dict  = dictionArr();

	    return [lArr,dict,sArr];
	};

	
	this.weightArr = function(){
	    
	    
	    //compresses to 16 beats
	    var start = ts[0], timeSign = ts[2], dur =ts[1];
	    var i1 = 0, i2 = start, i3 = start + dur*timeSign;
	    var beg = 0;
	    var dict = dictionArr();
	    var arr = generateBaseValue(16,0);
	    var index =0, ind = i2;
	    
	    while(index < duration){
		if(index == i1){
		    beg = i1;
		}
		else if(index == i2){
		    beg = i2;
		}
		else if(index == i3){
		    beg = i3;
		}

		if( beg == i2){
		    var b;
		    if(ind % 4 == 0){
			b = ind;
		    }
		    else b = beg;
		    ind = b + Math.floor( (index - b)*(4/timeSign) );
		}
		else{
		    ind = index;
		}
		if(diction[index] == "."){arr[ind] = 0;} //rest
		else {arr[ind] += getEle(dict[index]);}
		index++;
	    }
	    return arr;
	    
	};

	
	play = timeSignature(loudnessArr,speedArr,dictionArr);
	var weights = weightArr();

	//var play = [multiTo1DArray(lArr),multiTo1DArray(dict),multiTo1DArray(sArr)];
	return [play,weights];

    };
    
    var generator = sh.loop(sh.dynamic(function (clock) {
	

	document.getElementById("patternID").value = Math.floor(pattern);
	var loudness, speed, dict, play, w = 0.5;
	
	if(instrument == "mridangam"){

	    var mri = mridangamSol[ Math.floor(mriPattern)];
	    
	    if(mSol.length == 16){
		dict = mSol;
	    }
	    else dict = mri[0];
	    
	    ts = [0,0,4];
		//mri[1];
	    var loud = [1];
		//mri[2];
	    mridangamSol[ Math.floor(mriPattern)] = [dict, ts, loud];
	    play = rhythmPattern([16,[],loud,[],dict,ts]);
	    mridangam = play[1];
		if(mriPattern < 2){
			mriPattern = Math.floor((mriPattern + 1) % mridangamSol.length );
		}
	    else mriPattern = (mriPattern + 0.5) % mridangamSol.length ;
	}
	else{
	    console.log(mSol);
	    /*while( arrElementCmp(Math.floor(pattern),unacceptable) == 1){
	    	pattern = (pattern + 1)% kanjiraSol.length;
	    }*/
	    var min = patternDistance();
	    do{
		pattern = (pattern + 1) % kanjiraSol.length ;
		var kanj = kanjiraSol[Math.floor(pattern)];
		try{
		    dict = kanj[0];
		    ts = kanj[1];
		}
		catch(err){
		    debugger;
		}
		
		document.getElementById("timeSign").value = ts;
		//var ts = getEle("timeSign");
		play = rhythmPattern([16,[],[],[],dict,ts]);
		kanjira = play[1];
		
		var talaDict = ["clap",".",".",".","clap",".",".",".","clap",".",".",".","clap",".",".","."];
		tala = rhythmPattern([16,[],[],[],talaDict,[0,0,4]]);

	    //patternDistance(mridangam,kanjira);
	    //var diff = patternDistance(tala[1],kanjira);
	    
	    //diff += ts[1] * ts[2];
	    //console.log("patternID" + pattern + " " + diff);          

	    }while(patternDistance() < 0)
	    console.log(patternDistance());
	    mSol = [];

	}

	
	var strokeSeq = play[0][1];
	var strokeTempo = play[0][2];
	var strokeAccent = play[0][0];
	
	document.getElementById(instrument).value = "[" + strokeSeq.join(" ") + "]";		    //needs to improve	
	
	return sh.track( strokeSeq.map(function(s,index){
	    //var del = sh.delay(4.0/(10 * strokeTempo[index]));
	    try{
	    
	    	if(s == "."){
		    	return sh.delay(4.0/strokeTempo[index]);
			}	
		
			else{	
			    //sh.delay(4.0/(10 * strokeTempo[index])),
		    	    return sh.track([  sounds[s].trigger(strokeAccent[index]), sh.delay(4.0/strokeTempo[index])]);
		    
			}
	    }
	    catch(err){
		debugger;
	    }

	}));
	
    }));
    

    var del = 0;
    if(instrument == "kanjira"){
	del = 32;
    }
    
    sh.play(sh.track (sh.rate(tempo/60),
		      sh.delay(del),
		      generator));	
    
};

init_vars();



//-------------------------------common function ------------------------//



//generate array with base value
function generateBaseValue(duration, baseValue){
    var arr = [];
    for(var i=0; i<duration; i++){
	arr.push(baseValue);
    }
    return arr;
}

function getEle(htmlElement){
	if( !document.getElementById(htmlElement)){
		debugger;
	}
    return eval(document.getElementById(htmlElement).value);
}

//returns 1 if element found in array and returns 0 if no element is found
function arrElementCmp(element,array){
    var compare = 0;
    for(var index=0;index<array.length;index++){
	if(element == array[index]){compare = 1;}
    }
    return compare;
}

//generates whole random number between the given intervals
function wholeRand(low,high){
    return low + Math.floor( 0.5 + Math.random()*(high-low));
}

//returns num - sub % duration
function modnum(duration,num,sub){

    if(num - sub < 0){
	return duration + (num - sub)%duration;
    }
    else{
	return (num - sub)%duration;
    }
    
}

//finds maximum of 3
function maxi(a,b,c){
    if(a == b && a == c){
	return -1;
    }
    else{
	if(a > c && a>b){
	    return a;
	}
	else if(b>a && b>c){
	    return b;
	}
	else{
	    return c;
	}
    }
}

//generates array with unique values if documentelement is absent
function generateRandArr(duration, numValues){
    var arr = [];

    for(var i=0; i<numValues; i++){
	var acc = wholeRand(1,duration);
	if(arr.length ==0){
	    arr.push(acc);
	}
	else if( arrElementCmp(acc,arr) == 0 ){
	    arr.push(acc);
	}
	else{
	    while( arrElementCmp(acc,arr) == 1 ){
		acc = wholeRand(1,duration);
	    }
 	    arr.push(acc);
	}

    }
    return arr;
}

function modovr(num, modn ){
    if(num < 0){
	num = modn + num;
    }
    return num % modn;
}

function multiTo1DArray( multiSeq ){ 
    var singleSeq = [], arr2 = [];
    for(var i=0; i<multiSeq.length; i++){
	var arr = multiSeq[i];
	if(arr.length == 1){
	    singleSeq.push(multiSeq[i]);	    
	}
	else{
	    try{
		arr2 = arr.split(" ");
	    }
	    catch(err){
		arr2 = arr;
	    }
	    for(var i2=0;i2<arr2.length;i2++){
		singleSeq.push(arr2[i2]);
	    }	    
	}
    }
    
    return singleSeq;
}

//find position of occurences of element in an array
function findPosOccurences(ele,arr){
    
    var posArr = [];
    for(var i=0;i<arr.length;i++){
	var arele = arr[i];
	if(arele.length && ele.length){
	    if(arele.join("") == ele.join("")){
		posArr.push(i+1);
	    }
	}
	else{
	    if(arr[i] == ele){
		posArr.push(i+1);
	    }
	}

    }
    return posArr;

}

function normalize(fAccent){
	var num = fAccent[0], normAccent = [];
	if(numOccurences(num,fAccent) == fAccent.length){ // no accents
	    normAccent = fAccent.map(function(s,index){
		return 0;
	    });
	}
	else{
	    //adding the difference between successive accent levels
	    var sum = 0;
	    for(var index=0;index<fAccent.length;index++){	
		sum += Math.abs( fAccent[index]);
	    }

	    normAccent = fAccent.map(function(s,index){
		return s/sum;
	    });

	}
	return normAccent;	

}

//returns number of occurences of an element in a array
function numOccurences(ele,array){
    var count = 0;
    for(var index=0;index<array.length;index++){
	if(ele == array[index]){
	    count++;
	}
    }
    return count;
}

function sum(a,b){
    return a + b;
}


function patternDistance (iterM, iterK){
    
    
//include accent luodness in this calculation    
//
    var mr = mridangamSol[Math.floor(mriPattern)], kan = kanjiraSol[Math.floor(pattern)];

    //var mr = mridangamSol[iterM];    
    //var kan = kanjiraSol[iterK];

var stroke1 = mr[0], stroke2 = kan[0];    
var ts1 = stroke1.length, ts2 = stroke2.length;    
var mloud = mr[2]; //kloud = kan[2];

stroke2 = stroke2.map(function(s){
	if(s == "tum"){
		return "tumki";
	}
	else return s;	
});
    
var lcm = findLcm (ts1,ts2);

//generate array of zeroes

var arr1 = generateBaseValue( lcm, 0);
var arr2 = generateBaseValue( lcm, 0);
duration = lcm;


    mapstroke(arr1, stroke1, mr[1]);
    mapstroke(arr2, stroke2, kan[1]);
    

    function mapstroke(arr, stroke, ts){
	//till ts change, keep putting beats at lcm/4 spaces, 

	var start = ts[0], timeSign = ts[2], dur =ts[1];
	var i1 = 0, i2 = start, i3 = start + (dur)*timeSign;
	var lcm = arr.length;
	
	var t1 = lcm/pDur, t2 = 1;
	if(timeSign < pDur){
	    t2 = lcm/(timeSign*4); //ts is given for 4 beat
	}
	else if (timeSign > pDur){ //ts is given for 8 beats
	    t2 = lcm/(timeSign*2);
	}

	var i = 0, s= 2.0;
	while(i < stroke.length){

	    if( i < i2 ){
		if(stroke[i] != "."){
		    if(arrElementCmp(i+1, mloud) == 1){
			arr[ i *t1] = getEle(stroke[i]) + s;
		    }
		    else arr[ i *t1] = getEle(stroke[i]) ;
		}
    	    }
    	    else if( i >=i2 && i<i3){
		if(stroke[i] != "."){
		    if(arrElementCmp(i+1, mloud) == 1){
			arr[ Math.floor(i2*t1 + (i-i2)*t2)] = getEle(stroke[i]) + s;
		    }
		    else arr[ Math.floor(i2*t1 + (i-i2)*t2)] = getEle(stroke[i]);
		}
		
	    }
	    else{
		if(i*t1 < lcm){
		    if(stroke[i] != "."){
			if(arrElementCmp(i+1, mloud) == 1){
			    arr[ i *t1] = getEle(stroke[i]) + s;
			}
			else arr[ i *t1] = getEle(stroke[i]);
		    }
		}
	    }
	    i++;
	}
	

    }


var i1 = lcm/ts1;
var i2 = lcm/ts2;


/*var i =0, s= 2.0 ;
while(i < stroke1.length){
	if( stroke1[i] != "."){
		if(arrElementCmp(i+1, mloud) == 1){
		arr1[ i *i1] = getEle(stroke1[i]) + s;
		}
		else arr1[ i *i1] = getEle(stroke1[i]);
	}
	
	i++;
}*/

    function mapto16(arr1, arr2, t){

	var i =0, j=0, sum=0;
	while(i < arr1.length){

	    sum = 0;
	    while( (i - j*t) < t){
		sum+= arr1[i];
		i++;
	    }
	    arr2[j] = sum;
	    j++;

	};
    }
/*    function mapto16(arr1, arr2, ts){
	
    var start = ts[0], timeSign = ts[2], dur =ts[1];
    var i1 = 0, i2 = start, i3 = start + dur*timeSign;
    
    var arr = [];
    
    arr = stroke.map(function(s,index){
    	if( index < i2 ){
    		if(index % 8 == 0 ){
    		 	return s + getEle("clap");
    		}
    		else return s;
    	}
    	else if( index >=i2 && index<i3){
    		if( ((index - i2)*4/timeSign ) % 8 ==0 ){
    			return s + getEle("clap");
    		}
    		else return s;
    	}
    	else {
    		
    		if( (index - i3) % 8 ==0 ){
    			return s + getEle("clap");
    		}
    		else return s;
    	
    	}
    });
    
    return arr;
}


i = 0;


while(i < stroke2.length){
	if( stroke2[i] != "."){
	arr2[ i *i2] = getEle(stroke2[i]);
	}
	i++;
}*/

//arr1 = increaseAccenting(mr[1], arr1);
//arr2 = increaseAccenting(kan[1], arr2);

//map arr1 and arr2 to 16 beats
    var t1 = lcm/pDur;
    var t2 = lcm/pDur;
    
    //t1 = Math.floor( t1 + 0.5);
    //t2 = Math.floor( t2 + 0.5);

    var arr11 = generateBaseValue(pDur,0);
    var arr22 = generateBaseValue(pDur,0);
    mapto16(arr1, arr11, t1);
    mapto16(arr2, arr22, t2);



// create accent array
var acc1 = createAccent( arr11);
var acc2 = createAccent( arr22);

//comapre 2 strokes

var diff = arr11.map(function(s,index){
    return Math.abs(acc1[index]-acc2[index])*(s - arr22[index]); //arr2 - s to note that kanjira playing more strokes escalates value
    //*
});

//match
    //ls.push(diff.reduce(sum));
    
    console.log(diff.reduce(sum) + " mr" + iterM + " kanjira" + iterK); 
    return diff.reduce(sum);

}


function gcd(a,b){

if( a == b){return a;}
else{
	if(a > b){
		return gcd( b, a - b);
	}
	else{
		return gcd( a, b- a);
	}
}

}

function findLcm(a,b){

	if( a % b ==0 ){
		return a;
	}
	else if( b % a == 0){
		return b;
	}
	else {
		var cd = gcd(a,b);
		return (a * b) / cd;
	}

}


function createAccent( fAccent){

	debugger;
    //var w1 = parseFloat(document.getElementById("backWeight").value), w2 = parseFloat(document.getElementById("frontWeight").value);
    var w1 = 0.25, w2 = 0.75;
    var duration = pDur ;
	var contrastedArr = fAccent.map(function(s,index,arr){
	    if(index == 0){
		return 1*s - w2*arr[(index+1)%duration] - w1*arr[modnum(duration,index,1)] + getEle("clap");
	    }
	    if (index == duration - 1){//last beat
		return 1*s - w1*arr[modnum(duration,index,1)] - w2* getEle("clap");
	    }
	    else return 1*s - w1*arr[modnum(duration,index,1)] - w2*arr[(index+1)%duration];
	});   
	
	
    var accentStruct = contrastedArr.map(function(s,index,arr){
	    
	    if( index == 0){
		if( s > arr[index+1]){
		    return 1;
		}
		else return 0;
	    }
	    else if( index == duration - 1){
		if( s > arr[index-1]){
		    return 1;
		}
		else return 0;
	    }
	    else{
		var max = maxi(s,arr[modnum(duration,index,1)],arr[(index+1)%duration]);
		if( max != -1 && max == s && s!=0){
		    return 1;
		}
		else{
		    return 0;
		}
	    }
	    
	});

   	console.log(accentStruct);
	return accentStruct;	


}




/*function patternDistance (){
    
    
//include accent luodness in this calculation    
var mr = mridangamSol[Math.floor(mriPattern)], kan = kanjiraSol[Math.floor(pattern)];



var stroke1 = mr[0], stroke2 = kan[0];    
var ts1 = stroke1.length, ts2 = stroke2.length;    
var mloud = mr[2]; //kloud = kan[2];

stroke2 = stroke2.map(function(s){
	if(s == "tum"){
		return "tumki";
	}
	else return s;	
});
    
var lcm = findLcm (ts1,ts2);

//generate array of zeroes

var arr1 = generateBaseValue( lcm, 0);
var arr2 = generateBaseValue( lcm, 0);
duration = lcm;



var i1 = lcm/ts1;
var i2 = lcm/ts2;


var i =0, s= 2.0 ;
while(i < stroke1.length){
	if( stroke1[i] != "."){
		if(arrElementCmp(i+1, mloud) == 1){
		arr1[ i *i1] = getEle(stroke1[i]) + s;
		}
		else arr1[ i *i1] = getEle(stroke1[i]);
	}
	
	i++;
}


function increaseAccenting(ts, stroke){
	
    var start = ts[0], timeSign = ts[2], dur =ts[1];
    var i1 = 0, i2 = start, i3 = start + dur*timeSign;
    
    var arr = [];
    
    arr = stroke.map(function(s,index){
    	if( index < i2 ){
    		if(index % 4 == 0 ){
    		 	return s + getEle("clap");
    		}
    		else return s;
    	}
    	else if( index >=i2 && index<i3){
    		if( ((index - i2)*4/timeSign ) % 4 ==0 ){
    			return s + getEle("clap");
    		}
    		else return s;
    	}
    	else {
    		
    		if( (index - i3) % 4 ==0 ){
    			return s + getEle("clap");
    		}
    		else return s;
    	
    	}
    });
    
    return arr;
}


i = 0;


while(i < stroke2.length){
	if( stroke2[i] != "."){
	arr2[ i *i2] = getEle(stroke2[i]);
	}
	i++;
}

//arr1 = increaseAccenting(ts, arr1);
//arr2 = increaseAccenting(ts, arr2);

// create accent array
var acc1 = createAccent( arr1);
var acc2 = createAccent( arr2);

//comapre 2 strokes

var diff = arr1.map(function(s,index){
	 return (acc1[index] - acc2[index])* (arr2[index] - s); //arr2 - s to note that kanjira playing more strokes escalates value
});

//match
//console.log(diff.reduce(sum))
return diff.reduce(sum); 


/*
    var weight1 = refPattern;

    var weight2 = targetPattern;


    var distanceMeasure = weight1.map(function(s,index){
		return (weight2[index] - s);
    });

    var diff = distanceMeasure.reduce(sum);  
    
    return diff;
}


function gcd(a,b){

if( a == b){return a;}
else{
	if(a > b){
		return gcd( b, a - b);
	}
	else{
		return gcd( a, b- a);
	}
}

}

function findLcm(a,b){

	if( a % b ==0 ){
		return a;
	}
	else if( b % a == 0){
		return b;
	}
	else {
		var cd = gcd(a,b);
		return (a * b) / cd;
	}

}




function createAccent( fAccent){

    //var w1 = parseFloat(document.getElementById("backWeight").value), w2 = parseFloat(document.getElementById("frontWeight").value);
	var w1 = 0.25, w2 = 0.75;
    var contrastedArr = fAccent.map(function(s,index,arr){
	    if(index == 0){
		//return 1*s - w2*arr[(index+1)%duration];
		return 1*s - w2*arr[(index+1)%duration] - w1*arr[modnum(duration,index,1)] + getEle("clap");
	    }
	    else if (index == duration - 1){//last beat
		return 1*s - w1*arr[modnum(duration,index,1)] - w2* getEle("clap");
	    }
	    else return 1*s - w1*arr[modnum(duration,index,1)] - w2*arr[(index+1)%duration];
	});   
	
	
    var accentStruct = contrastedArr.map(function(s,index,arr){
	    
	    if( index == 0){
		if( s > arr[index+1]){
		    return 1;
		}
		else return 0;
	    }
	    else if( index == duration - 1){
		if( s > arr[index-1]){
		    return 1;
		}
		else return 0;
	    }
	    else{
		var max = maxi(s,arr[modnum(duration,index,1)],arr[(index+1)%duration]);
		if( max != -1 && max == s && s!=0){
		    return 1;
		}
		else{
		    return 0;
		}
	    }
	    
	});

	console.log(accentStruct);
	return accentStruct;	


}

function sum(a,b){
    return a + b;
}

*/





/*




//ts is durChange, timeSign, startChange

function ( mr, kan){

	

	dist = function (weightedStruct){
	
		var weightedArr = weightedStruct();
		accentStruct = function (weightedArr){;
			return accent;	
		}
		
		[weightedArr, accentArr];
	}
	
	weightedStruct = function ( scaleArrays){
		
		
		return weightedArr; //for 16 beats, or whatever pattern length is
	}
	
	function scaleArrays ( ){
		
		var smallestTimeUnit = findLcm(ts1, ts2); //returns the smallest unit of comparison
		
		//retrieve the speed array of both mri and kanjira, and map the corresponding diction, loudness index to new array
		mapArrToSmallestUnit = function(speed, weight){ // for both mridangam and kanjira
			var speedArr =  speed();
			var weightArr = weight();
			var scaledArr = [];
			
			var i1 =0;
			while(i1 < speedArr.length){
				var durNote = smallestTimeUnit / speedArr[i1];
				scaledArr.push(weightArr[i]);
				var i2 = 1;
				while( i2 < durNote){
					scaledArr.push(0);
					i2++;
				}
				i1++;
			}
			return scaledArr;
		}
		
		weight = function ( loudness, diction){
			var l = loudness();
			var d = loudnessDiction();
			
			var weightArr = l.map(function(s,index){
				return s + d[index];
			});
			return weightArr;
		}
		
	}
	
	
}

*/





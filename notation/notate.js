

/*
function notate( notation ){
    
    //arrrays
    
    var diction = notation[0]; //diction 
    var loudness = notation[1];
    var speed = notation[2]; // speed --> 3 speeds and ts array

    var duration = notation[3][1]; //ts
    
    var spacedtext ="";
    
    //3 speed arrays
    debugger;
    var s1 = speed[0].length;
    var s2 = speed[1].length;
    var s3 = speed[2].length;  
    var space = 8;
    var notes = diction.splice( 0, s1);
    var spaces = s1 * space;


    //spacedtext+= "<b>|</b>";
    
    spacedtext +=  timeToSpace(spaces, notes ); //returns the beat and the number of spaces after the beat
    
    /*if( spacedtext != ""){
	spacedtext = spacedtext.substring(0, spacedtext.length-5);//remove the last &nbsp and insert "|"
    spacedtext+= "|";
    }
    
    notes = diction.splice( 0, s2);
    spaces = (duration * 4) * space; // number of notes
    
    spacedtext += /*"<b> <font size=2.9>"  timeToSpace(spaces, notes ) /*+ "</font></b>"*/; //returns the beat and the number of spaces after the beat
    
    /*if(spacedtext != ""){
	spacedtext = spacedtext.substring(0, spacedtext.length-5);
   	spacedtext+= "|";
    }
    
    notes = diction.splice( 0, s3);
    spaces = s3 * space; // number of notes
    spacedtext +=  timeToSpace(spaces, notes ); //returns the beat and the number of spaces after the beat

    //spacedtext = spacedtext.substring(0, spacedtext.length-4);
    
    
   // spacedtext = spacedtext.substring(0, spacedtext.length-2);

    /*if(spacedtext != ""){
	spacedtext = spacedtext.substring(0, spacedtext.length-5);
   	spacedtext+= "|";
    }*/
    
    //debugger;
    /*while( spacedtext[spacedtext.length-1] != "&") {
	spacedtext = spacedtext.substring(0, spacedtext.length-1);
	
    }
    spacedtext = spacedtext.substring(0, spacedtext.length-1);
    spacedtext = "|" + spacedtext;
    return spacedtext ;

}


function timeToSpace( spaces, notes){

    
    var arr= "";
   
    if( spaces == 0 || notes.length == 0){
	return arr;
    }

    var dx = spaces/ notes.length;
    
    var i = 0;
    while( i < notes.length){
	arr += notes[i] + space(dx-1);
	i++; 
    }

    //returns number of spaces
    function space( num){
	var i = 0;
	var arr = "";
	//var num = Math.floor(dx);
	while( i < Math.floor(num + 0.5)){
	    arr += "&nbsp";
	    i++;
	}
	return arr;
    }
   
    return arr;
}*/

var c=document.getElementById('notation');
var ctx=c.getContext('2d');


function notate( notation, y){
    
    var diction = notation[0]; //diction 
    var loudness = notation[1];
    var speed = notation[2]; // speed --> 3 speeds and ts array
    
    var duration = notation[3][1]; //ts
    var k1 = speed[0].length, k2 = speed[1].length, k3 = speed[2].length;
    
    var arr1 = diction.slice( 0, k1 );
    var arr2 = diction.slice( k1, k1 + k2);
    var arr3 = diction.slice( k1 + k2, k1+k2+k3);

    var lastpx = 10;
    lastpx = notCanvas( k1/4, arr1, lastpx);
    lastpx = notCanvas( duration, arr2, lastpx);
    lastpx = notCanvas( k3/4, arr3, lastpx);
    ctx.fillText("||" , lastpx , y);
    ctx.fillText( notation[3] , lastpx + 10 , y,40);
    ctx.fillText("||" , lastpx + 50 , y);

    function notCanvas( durAksh, notes ,lastpx){ // duration --> beats

	var durMatras = durAksh * 4;
	var screenSpace = durMatras * 40; //pixels
	var spaceOfHit = (screenSpace/ notes.length);

	var i =0;
	while( i < notes.length){
	    ctx.fillText(notes[i], lastpx , y, spaceOfHit);
	    lastpx += (spaceOfHit*30)/20;
	    i++;
	}
	
	return lastpx;
	
    }
    return y+20;
    
}


var rhythmPattern = function(pattern){


    var diction = pattern[0];
    var loudness = pattern[2], ts = pattern[1];   
    
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
    
    if(!loudness){
	loudness = [];
    }

    //array positions
    if(loudness != []){
	loudness = loudness.map(sub);
    }
    

    //returns that diction as an array
    this.dictionArr = function (){

	var arr = diction;
	arr = arr.map(function(s){

	    if( s == "clap"){
		return "|";
	    }
	    else if( s == "."){
		return ",,"
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
	
	return arr;
    };
    
    //returns both single dimensional array and 3 arrays based on speed at which they are played
    this.speedArr = function(){
	
	var s = [generateBaseValue(start,4), generateBaseValue(dur*timeSign,timeSign),generateBaseValue(duration - start - dur*timeSign,4)];
	
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

    this.tsArr = function(){
	return ts;
    }


    diction = dictionArr();
    loudness = loudnessArr();
    speed = speedArr()[1];
    
    return [diction, loudness, speed, ts];

};



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



function start(){

    var i = 0, y = 10;
while( i< kanjiraSol.length){

//    document.write( '<b>' + notate( rhythmPattern(tala[0])) + "||" + '</b>' ) ;
    
 //   document.write('\n' + '\n');
    
    y = notate( rhythmPattern(tala[0]), y);
    y = notate( rhythmPattern(kanjiraSol[i]), y);
    
    //str = str.substring(0, str.length-11);
//    document.write( '<p>' + str + "|| "+ "[" + kanjiraSol[i][1].join(" ") + "]" + '\n' + '</p>' ) ;
 //   document.write('\n' + '\n');
    i++;
    
}

}


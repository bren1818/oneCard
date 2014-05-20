var video;
var dataURL;
var imagesCount = 1;
var tolerance = 25;
var width  = 640;
var height = 480;



function init() {
	if( Modernizr.canvas == true && Modernizr.video == true ){
		navigator.myGetMedia = (navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia);
		navigator.myGetMedia({ video: true }, connect, error);
	
		errorText = document.getElementById("noShow");
		errorText.style.display="none";

	}else{
		errorText = document.getElementById("show");
		errorText.style.display="none";
	}
	
	$(function() {
		$( "#slider-vertical" ).slider({
		  orientation: "vertical",
		  range: "min",
		  min: 0,
		  max: 40,
		  value: 20,
		  slide: function( event, ui ) {
			//$( "#amount" ).val( ui.value );
			tolerance = ui.value;
			reDraw();
		  }
		});
		//$( "#amount" ).val( $( "#slider-vertical" ).slider( "value" ) );
  });
	
	
	
}

function reDraw(){
	var canvas = document.getElementById('hiddenCanvas_2');
	var ctx = canvas.getContext('2d');
	//canvas.width = video.videoWidth; //can divide here
	//canvas.height = video.videoHeight; //and here
	var preview =   document.getElementById("preview");
	
	ctx.drawImage(preview, 0, 0, canvas.width, canvas.height); //draw the video
	doCompare();
}


function connect(stream) {
	video = document.getElementById("video");
	video.src = window.URL ? window.URL.createObjectURL(stream) : stream;
	video.play();
}

function error(e) { console.log(e); }

addEventListener("load", init); //// call the setup


function isSame(color1,color2){
	if( Math.abs( color1 - color2) < tolerance ){
		return true;
	}else{
		return false;
	}
}

function retry(){
	imagesCount = 1;
	var threshold  = document.getElementById('threshold');
	threshold.style.display="none";
	
	var can1  = document.getElementById('hiddenCanvas_1');
	var ctx1 = can1.getContext("2d");
	
	var can2  = document.getElementById('hiddenCanvas_2');
	var ctx2 = can2.getContext("2d");
	
	
	ctx1.clearRect ( 0 , 0 , 640 , 480 );
	ctx2.clearRect ( 0 , 0 , 640 , 480 );
}


function doCompare(){
//window.alert("do compare!");
$(function(){
	//console.log( $('#hiddenCanvas_1') );
	var can1  = document.getElementById('hiddenCanvas_1');
	var ctx1 = can1.getContext("2d");
	
	var can2  = document.getElementById('hiddenCanvas_2');
	var ctx2 = can2.getContext("2d");
	
	
	


	
	var imageData_1 = ctx1.getImageData(0,0,width, height);
	var imageData_2 = ctx2.getImageData(0,0,width, height);
	
	for (var index=0;index<imageData_1.data.length;index+=4){
						//red												//blue																//green
			if( isSame(imageData_1.data[index], imageData_2.data[index]) && isSame(imageData_1.data[index + 1],imageData_2.data[index +1]) && isSame(imageData_1.data[index + 2],imageData_2.data[index +2]) ){
				//if same delete 
				imageData_2.data[index + 3] = 0;
			}else{
				if( index < 100){
					console.log( "different" );
					console.log( "Red: " + imageData_1.data[index] + " vs  " +  imageData_2.data[index] +   " Green: " + imageData_1.data[index + 1] + " vs  " +  imageData_2.data[index + 1] +   " Blue : " + imageData_1.data[index + 2] + " vs  " +  imageData_2.data[index + 2] );
					
					
				}
			}
	}		
		ctx2.putImageData(imageData_2,0,0);	
			
			

	
	threshold.style.display="block";
	
	
});


}


function captureImage() {
	var canvas = document.getElementById('hiddenCanvas_' + imagesCount);
		//var canvas = document.createElement('canvas');
		///canvas.id = 'hiddenCanvas_' + imagesCount;
		//canvas.className = 'previewSnap'; 
	//add canvas to the body element
		//document.body.appendChild(canvas);
	//add canvas to #canvasHolder
			//document.getElementById('canvasHolder').appendChild(canvas);
	var ctx = canvas.getContext('2d');
	canvas.width = video.videoWidth; //can divide here
	canvas.height = video.videoHeight; //and here
	ctx.drawImage(video, 0, 0, canvas.width, canvas.height); //draw the video
	
	
	//console.log( canvas.id );
	
	//save canvas image as data url
	dataURL = canvas.toDataURL();
	//set preview image src to dataURL
	document.getElementById('preview').src = dataURL;
	// place the image value in the text box
	//document.getElementById('imageData').value = dataURL;

	
	
	if( imagesCount ==2){
		doCompare();
	}
	imagesCount++;
}

//Bind a click to a button to capture an image from the video stream
//var el = document.getElementById("button");
//el.addEventListener("click", captureImage, false);


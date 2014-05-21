var video;
var dataURL;
var imagesCount = 1;
var tolerance = 20;
var width  = 640;
var height = 480;
var drawTools = 0;
var brush = "redraw";
var bs = 10;


function init() {
	if( Modernizr.canvas == true && Modernizr.video == true ){
		navigator.myGetMedia = (navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia);
		navigator.myGetMedia({ video: true }, connect, error);
		$(function(){
			$("#noShow").hide();
		});
	}else{
		$(function(){
			$("#show").hide();
		});
	}
	
	$(function() {
		$( "#slider-vertical" ).slider({
		  orientation: "vertical",
		  range: "min",
		  min: 0,
		  max: 40,
		  value: 20,
		  slide: function( event, ui ) {
			tolerance = ui.value;
			reDraw();
		  }
		});
		
		$( "#slider-brush" ).slider({
		  orientation: "vertical",
		  range: "min",
		  min: 1,
		  max: 50,
		  value: 10,
		  slide: function( event, ui ) {
			//draw a brush?
			bs = ui.value;
			$('#mycursor').width( ui.value );
			$('#mycursor').height( ui.value );
		  }
		});
		
		$('input[type=radio][name=brushMode]').change(function() {
			brush = this.value;
		});
		
		loadCanvas('crest.jpg');
	});
}

function loadCanvas(dataURL) {
	
	var canvas = document.getElementById('logo');
	var ctx = canvas.getContext('2d');

	// load image from data url
	var imageObj = new Image();
	imageObj.onload = function() {
	  ctx.drawImage(this, 80, 0); //canvas is 640 x 480, logo is 480 x 480 so x =80, y = 0
	};

	imageObj.src = dataURL;
}


function reDraw(){
	var canvas = document.getElementById('hiddenCanvas_2');
	var ctx = canvas.getContext('2d');
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
init();

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
	
	$(function(){
		$('#hiddenCanvas_1, #hiddenCanvas_2, #tools, #doOver').hide();
		$('#video, #preview, #takePicture').show();
	
	});
}

function initDrawTools(){
	$(function(){
		var clicking = false;
		$('#hiddenCanvas_2').mousedown(function(){
			clicking = true;
		});

		$(document).mouseup(function(){
			clicking = false;
			$('#mycursor').css('display','none')
		})

		
		$('#hiddenCanvas_2').mouseout(function(){
           	$('#mycursor').css('display','none'); 
           	return false;
      	});
      	$('#hiddenCanvas_2').mouseenter(function(){
           	$('#mycursor').css('display','block'); 
           	return false;
      	});
		
		$('#hiddenCanvas_2').mousemove(function(event){
			if(clicking == false) return;
			position = getPosition(event);
			
			var x = position.x;
			var y = position.y;
			
			var can2  = document.getElementById('hiddenCanvas_2');
			var ctx2 = can2.getContext("2d");
			
			$('#mycursor').css({'left' :   event.pageX + 'px', 'top' : event.pageY + 'px', 'display' : 'block'});
			
			if( brush == "redraw" ){
				var can1  = document.getElementById('picture');
			}else{
				var can1  = document.getElementById('logo');
				
			}
			var ctx1 = can1.getContext("2d");
			var imgData=ctx1.getImageData(x,y,bs,bs); //X,Y,W,H
			ctx2.putImageData(imgData,x,y);
		});
	});
}

function getPosition(e) {
    //this section is from http://www.quirksmode.org/js/events_properties.html
    var targ;
    if (!e)
        e = window.event;
    if (e.target)
        targ = e.target;
    else if (e.srcElement)
        targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;

    // jQuery normalizes the pageX and pageY
    // pageX,Y are the mouse positions relative to the document
    // offset() returns the position of the element relative to the document
    var x = e.pageX - $(targ).offset().left;
    var y = e.pageY - $(targ).offset().top;

    return {"x": x, "y": y};
};

function doCompare(){
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
				imageData_2.data[index + 3] = 0; //0-255 alpha
			}
		}		
		ctx2.putImageData(imageData_2,0,0);	
		threshold.style.display="block";
		$('#doOver').show();
		$('#hiddenCanvas_1').hide();
		$('#picture').hide();
		
	});
	
	if( drawTools == 0){
		initDrawTools();
		drawTools = 1;
	}	
}


function captureImage() {
	var canPic = document.getElementById('picture');
	var pictx = canPic.getContext('2d');
	canPic.width = video.videoWidth; //can divide here
	canPic.height = video.videoHeight; //and here
	pictx.drawImage(video, 0, 0, canPic.width, canPic.height); //draw the video
	

	var canvas = document.getElementById('hiddenCanvas_' + imagesCount);
	var ctx = canvas.getContext('2d');
	canvas.width = video.videoWidth; //can divide here
	canvas.height = video.videoHeight; //and here
	ctx.drawImage(video, 0, 0, canvas.width, canvas.height); //draw the video
	dataURL = canvas.toDataURL();
	document.getElementById('preview').src = dataURL;
	
	
	
	if( imagesCount ==2){
		doCompare();
		$('#video, #preview, #takePicture').hide();
		$('#hiddenCanvas_2, #tools').show();
	}
	imagesCount++;
}

// Wait for Apache Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);
 var watchID = null;
// PhoneGap is ready
function onDeviceReady() {
   
    var options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };
    
    watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
    navigator.geolocation.clearWatch(watchID);
    watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
}
function onSuccess(position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    $("#icon").removeClass();
    $("#text").empty();
    if(boolRoute == true){
        location();
    }
}
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}
function location(){
   var p1  = new google.maps.LatLng(lat1,lng1);
   var p2  = new google.maps.LatLng(lat,lng);
   var m =  Math.round(google.maps.geometry.spherical.computeDistanceBetween(p1, p2));
   
   if(m >= 30){
       $("#icon").addClass("red");
       $("#text").append(m + 'meters');
   }else if (m >= 10 && m <= 30) {
        $("#icon").addClass("orange");
       $("#text").append(m + 'meters');
   }else{
        $("#icon").addClass("green");
        $("#text").append(m + 'meters');
   }
}
var lng = null;
var lat = null;
var lat1 = null;
var lng1 = null;
var boolRoute = false;
var airlinesApp = function(){}

airlinesApp.prototype = function() {
    var _flightForDetails=null,
    _ffNum = null, 
    _login = false,
    route = null,
    run = function(){
        var that = this;
        $('#tripDetail').live('pagebeforeshow',$.proxy(_initTripDetail,that));
        $('#home').live('pagebeforecreate',$.proxy(_initHome,that));
        $('.tripDetail').live('click', function () {
            $('#streetview').empty();
        	var item = $(this);
        	_flightForDetails = item.data('flight');
        });
        $('.next').live('click', function () {
            boolRoute = false;
        	$('#streetview').empty();
            var item = $(this);
            point = item.data('point');
            console.log(point);
            $.get('http://wouterlambrechts.ikdoeict.be/project2/api/Location/'+ route,function(data) {
                lat1 = data.content[point].lat;
                lng1 = data.content[point].lng;
                boolRoute = true;
                $('#streetview').append('<img src="http://maps.googleapis.com/maps/api/streetview?size=300x300&location=' + data.content[point].lat + ',' + data.content[point].lng + '&heading=151.78&pitch=-0.76&sensor=false">');
                var item = $('#button');
                item.data('point', 2);
                item.addClass('next');
            }, "json");
        });
    },
   
    _initTripDetail = function(){
	    route = _flightForDetails.idRoutes;
        console.log(route);
        $.ajax({
        url: 'http://wouterlambrechts.ikdoeict.be/project2/api/Location/'+ route ,
        type: 'get',
        dataType: 'json',
	        success: function(data, textStatus, jqXHR) {
                lat1 = data.content[0].lat;
                lng1 = data.content[0].lng;
                boolRoute = true;
                $('#total').append(data.content.length);
                $('#streetview').empty();
                $('#streetview').append('<img src="http://maps.googleapis.com/maps/api/streetview?size=300x300&location=' + data.content[0].lat + ',' + data.content[0].lng + '&heading=151.78&pitch=-0.76&sensor=false">');
                var item = $('#button');
                item.data('point', 1);
                item.addClass('next');
	        }     
        });  
    },

    
    _initHome = function(){
        if (!_login) {
	    	$.mobile.changePage("#logon", { transition: "flip" });
	    	$('#login').submit(function () {
	    		$(this).hide();
	    		_login = true;
	    		airData.logOn($('#userName').val(), $('#pwd').val(),_handleLogOn);
	    		return false;
	    	});
	    }
    },
    
    _handleLogOn = function (ff, success) {
		if (success) {
			_ffNum = ff;
			airData.getDataforFF(_ffNum,_handleDataForFF);
		}
	},
    _handleDataForFF = function (data) {
        $flightList = $('#myTripsListView');	
        $.ajax({
        url: 'http://wouterlambrechts.ikdoeict.be/project2/api/Routes/',
        type: 'get',
        dataType: 'json',
	        success: function(data, textStatus, jqXHR) {
	     		_customerData = data;
                for (var i in data.content) {
                    var flight = data.content[i];
                    $flightList.append('<a href="#tripDetail" data-transition="slide" id="route"><li class="clearfix list" id="' + data.content[i].Name + '"><img src="http://placehold.it/100x100"/><p>'  + data.content[i].Name +  '</p><p>Een echt stadzoektocht door de historische stad Gent.</p></li></a>');
			        var item = $('#' +  data.content[i].Name, $flightList);
                    item.data('flight', flight);
                    item.addClass('tripDetail');
                }
	        }     
        });     
		$.mobile.changePage('#home', { transition: 'flip' });
	};
    
    return {
        run:run,
    };
}();
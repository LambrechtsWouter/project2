
// Wait for Apache Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);
 var watchID = null;
 var options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };
    
// PhoneGap is ready
function onDeviceReady() {
   checkConnection();
    
    
    
}
function checkConnection() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    //alert('Connection type: ' + states[networkState]);
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
       navigator.notification.vibrate(2500);
       navigator.geolocation.clearWatch(watchID);
       sucessLocation();
   }
}

function sucessLocation(){
    $('#streetview').empty();
    $.mobile.changePage("#Location", { transition: "flip" });
}
var lng = null;
var lat = null;
var lat1 = null;
var lng1 = null;
var boolRoute = false;
var photoTourApp = function(){}

photoTourApp.prototype = function() {
    var _flightForDetails=null,
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
             $('#streetview').empty();
            $.mobile.changePage("#tripDetail", { transition: "flip" });
            boolRoute = false;
            var item = $(this);
            point = item.data('point');
            console.log(point);
            $.get('http://wouterlambrechts.ikdoeict.be/project2/api/Location/'+ route,function(data) {
                lat1 = data.content[point].lat;
                lng1 = data.content[point].lng;
                watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
                boolRoute = true;
                $('#streetview').empty();
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
                watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
                boolRoute = true;
                $('#total').empty();
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
                $('#error').empty();
                var username = $('#userName').val();
                var password = $('#pwd').val();
                $.mobile.loading('show', { theme: 'a', textVisible: true, text:'logging you in ...'});
                $.ajax({
                    url: 'http://wouterlambrechts.ikdoeict.be/project2/api/users/'+ username,
                    type: 'get',
                    dataType: 'json',
	                success: function(data, textStatus, jqXHR) {
                        if(data.content.length > 0){
                            if(data.content[0].password == password){
                                window.setTimeout(function () {
                        			$.mobile.loading('hide');
                                    $(this).hide();
                                    _login = true;
                        			_handleDataForFF();
                                   
                        		}, 3000);     		
        	                }else{
                             $.mobile.loading('hide');
                             $('#error').append('<li>Wachtwoord bestaat niet</li>');
                             $.mobile.changePage("#logon", { transition: "flip" });
                            } 
                        }else{
                             $.mobile.loading('hide');
                             $('#error').append('<li>Emailadres bestaat niet </li>');
                             $.mobile.changePage("#logon", { transition: "flip" });
                        }
                     },
                });
                return false;
               
	    	});
	    }
    },
    
    _handleDataForFF = function () {
       
        $flightList = $('#myTripsListView');	
        $.ajax({
        url: 'http://wouterlambrechts.ikdoeict.be/project2/api/Routes/',
        type: 'get',
        dataType: 'json',
	        success: function(data, textStatus, jqXHR) {
                
	     		_customerData = data;
                for (var i in data.content) {
                    var flight = data.content[i];
                    $flightList.append('<a href="#tripDetail" data-transition="slide" id="route"><li class="clearfix list" id="' + data.content[i].Name + '"><img style="width:100px; height:auto" src="./images/photosearch.jpg"/><p>'  + data.content[i].Name +  '</p><p>Een echt stadzoektocht door de historische stad Gent.</p></li></a>');
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
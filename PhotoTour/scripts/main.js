
// Wait for Apache Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);
 var watchID = null;
 var options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };
    
// PhoneGap is ready
function onDeviceReady() {
   checkConnection();  
   watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
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
var IDuser = null;
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
        $('#myRoute').live('pagebeforeshow',$.proxy(_handleDataForFF,that));
        $('#scanButton').live('click',$.proxy(_scan,that)); 
        $('#RouteProv').live('click', function () {
            $ProvList = $('#ProvListView');
            var test = $('#prov').val();
            $.ajax({
                    url: 'http://wouterlambrechts.ikdoeict.be/project2/api/provincie/'+ test ,
                    type: 'get',
                    dataType: 'json',
    	        success: function(data, textStatus, jqXHR) {
                    if(data.content.length > 0){
                        for (var i in data.content) {
                            var flight = data.content[i];
                            $ProvList.append('<a href="#tripDetail" data-transition="slide" id="route"><li class="clearfix list" id="' + data.content[i].gsmCode + '"><img style="width:100px; height:auto" src="./images/photosearch.jpg"/><H4 style="margin-bottom: -8px;">'  + data.content[i].Name +  '</h4><p>Een echt stadzoektocht door de historische stad Gent<br>' + data.content[i].Duration + ' minuten</p></li></a>');
        			        var item = $('#' +  data.content[i].gsmCode, $ProvList);
                            item.data('flight', flight);
                            item.addClass('tripDetail');
                        }
                    }else{
                         $('p#Route').html('Nog geen Routes gevonden.</br><a data-role="button" href="#myTrips" id="btnHome"class="ui-btn-right">Ga naar alle Routes</a>');
                    }
    	        }     
            });
            $.mobile.changePage("#provincie", { transition: "flip" });
        });
        
        $('#gsm').live('click', function () {
            var test = $('#gsmcode').val();
                $.ajax({
                        url: 'http://wouterlambrechts.ikdoeict.be/project2/api/gsm/'+ test ,
                        type: 'get',
                        dataType: 'json',
        	        success: function(data, textStatus, jqXHR) {
                       if(data.content.length > 0){
                          _flightForDetails = data.content[0];
                           $.mobile.changePage("#tripDetail", { transition: "flip" });
                       }
        	        }     
                });  
        });
        $('#btnHome').live('click', function () {
            boolRoute = false;
        });
        $('#register').submit(function () {
          var username = $('#email').val();
          var password = $('#password').val();
          _login = true;
          $.post('http://wouterlambrechts.ikdoeict.be/project2/api/users/NewUser', { Email: username, password: password });
          window.setTimeout(function () {
                $('span#ffname').html(username);
    			_handleDataForFF();      
    		}, 3000);  
        });
        
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
            $.get('http://wouterlambrechts.ikdoeict.be/project2/api/Location/'+ route + '/' + point,function(data) {
               if(data.content.length > 0){
                    lat1 = data.content[0].lat;
                    lng1 = data.content[0].lng;
                    boolRoute = true;
                    $('#streetview').empty();
                    $('p#adres').html(data.content[0].address);
                    $('p#locatie').html(data.content[0].arrived_text);
                    $('span#photo').html(point);
                    $('#streetview').append('<img src="http://maps.googleapis.com/maps/api/streetview?size=300x300&location=' + data.content[0].lat + ',' + data.content[0].lng + '&heading=151.78&pitch=-0.76&sensor=false">');
                    var item = $('#button');
                    var total = point + 1;
                    item.data('point', total);
                    item.addClass('next');
               }else{
                   _arrived();
               }
            }, "json");
        });
    },
    _arrived = function(){
         $.ajax({
        url: 'http://wouterlambrechts.ikdoeict.be/project2/api/Routes/'+ route ,
        type: 'get',
        dataType: 'json',
	        success: function(data, textStatus, jqXHR) {
                $('p#uitleg').html(data.content[0].arrived_text);
                $.mobile.changePage("#Arrived", { transition: "flip" });  
             }
         });
    }       
    _initTripDetail = function(){
	    route = _flightForDetails.idRoutes;
        $.ajax({
        url: 'http://wouterlambrechts.ikdoeict.be/project2/api/Location/'+ route + '/1' ,
        type: 'get',
        dataType: 'json',
	        success: function(data, textStatus, jqXHR) {
               if(data.content.length > 0){
                   $.post('http://wouterlambrechts.ikdoeict.be/project2/api/MyRoute', { user: IDuser, Routes: route },function(result){
                          console.log(result);
                    });
                    lat1 = data.content[0].lat;
                    lng1 = data.content[0].lng;
                    boolRoute = true;
                    $('#total').empty();
                    $('p#adres').html(data.content[0].address);
                    $('p#locatie').html(data.content[0].arrived_text);
                    $('span#photo').html(1);
                    $('#total').append(data.content.length);
                    $('#streetview').empty();
                    $('#streetview').append('<img src="http://maps.googleapis.com/maps/api/streetview?size=300x300&location=' + data.content[0].lat + ',' + data.content[0].lng + '&heading=151.78&pitch=-0.76&sensor=false">');
                    var item = $('#button');
                    item.data('point', 2);
                    item.addClass('next');
               }else{
                    _arrived();
               }
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
                                IDuser = data.content[0].id;
                                window.setTimeout(function () {
                        			$.mobile.loading('hide');
                                    $(this).hide();
                                    _login = true;
                                    $('span#ffname').html(username);
                        			_handleDataForFF();
                                   $.mobile.changePage('#home', { transition: 'flip' });
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
        $myRoute = $('#myRouteListView');	
        $flightList = $('#RouteListView');
        $('#myRouteListView').empty();
        $('#RouteListView').empty();
        $.ajax({
        url: 'http://wouterlambrechts.ikdoeict.be/project2/api/MyRoute/'+ IDuser,
        type: 'get',
        dataType: 'json',
	        success: function(datas, textStatus, jqXHR) {
                if(datas.content.length >0){
                    for (var i in datas.content) {
                         $.ajax({
                            url: 'http://wouterlambrechts.ikdoeict.be/project2/api/Routes/' + datas.content[i].Routes,
                            type: 'get',
                            dataType: 'json',
                              success: function(data, textStatus, jqXHR) {
                                var flight = data.content[0];
                                
                                $myRoute.append('<a href="#tripDetail" data-transition="slide" id="route"><li class="clearfix list" id="' + data.content[0].gsmCode + '"><img style="width:100px; height:auto" src="./images/photosearch.jpg"/><H4 style="margin-bottom: -8px;">'  + data.content[0].Name +  '</H4><p>Een echt stadzoektocht door de historische stad Gent.<br>' + data.content[0].Duration + ' minuten</p></li></a>');
            			        var item = $('#' +  data.content[0].gsmCode, $myRoute);
                                item.data('flight', flight);
                                item.addClass('tripDetail');
                              }
                         });  
                     }
                }else{
                    $('p#myRoute').html('Nog geen Routes gevonden.</br><a data-role="button" href="#myTrips" id="btnHome"class="ui-btn-right">Ga naar alle Routes</a>');
                }
            }     
        });  
        
        $.ajax({
        url: 'http://wouterlambrechts.ikdoeict.be/project2/api/Routes/',
        type: 'get',
        dataType: 'json',
	        success: function(data, textStatus, jqXHR) {
               
	     		_customerData = data;
                for (var i in data.content) {
                    var flight = data.content[i];
                   
                    $flightList.append('<a href="#tripDetail" data-transition="slide" id="route"><li class="clearfix list" id="' + data.content[i].gsmCode + '"><img style="width:100px; height:auto" src="./images/photosearch.jpg"/><H4 style="margin-bottom: -8px;">'  + data.content[i].Name +  '</h4><p>Een echt stadzoektocht door de historische stad Gent<br>' + data.content[i].Duration + ' minuten</p></li></a>');
			        var item = $('#' +  data.content[i].gsmCode, $flightList);
                    item.data('flight', flight);
                    item.addClass('tripDetail');
                }
	        }     
        });      
		//
	};
    _scan = function() {
		var that = this;
		window.plugins.barcodeScanner.scan(
			function(result) {
				if (!result.cancelled) {
					that._addMessageToLog(result.format + " | " + result.text);    
				}
			}, 
			function(error) {
				console.log("Scanning failed: " + error);
			});
	},

	_addMessageToLog = function(message) {
        $resultsField = $('#result');
		$resultsField.innerHTML =  message + '<br />'; 
	}
    return {
        run:run,
    };
}();
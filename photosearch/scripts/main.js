
// Wait for Apache Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);

// PhoneGap is ready
function onDeviceReady() {
    
	
}

var airlinesApp = function(){}

airlinesApp.prototype = function() {
    var _flightForCheckin = null,
    _flightForDetails=null,
    _ffNum = null, 
    _customerData = null,
    _login = false,
    route = null,
    run = function(){
        var that = this,
        $seatPicker=$('#seatPicker');
        $('#tripDetail').live('pagebeforeshow',$.proxy(_initTripDetail,that));
        $('#boardingPass').live('pageshow',$.proxy(_initBoardingPass,that));
        $('#home').live('pagebeforecreate',$.proxy(_initHome,that));
        $('#checkIn').live('pageshow', $.proxy(_initCheckIn,that));
        $('.tripDetail').live('click', function () {
            $('#streetview').empty();
        	var item = $(this);
        	_flightForDetails = item.data('flight');
            
        });
        $('.next').live('click', function () {
        	$('#streetview').empty();
            var item = $(this);
            point = item.data('point');
            console.log(point);
            $.get('http://wouterlambrechts.ikdoeict.be/project2/api/Location/'+ route,function(data) {
                 console.log(data);
                $('#streetview').append('<img src="http://maps.googleapis.com/maps/api/streetview?size=300x300&location=' + data.content[point].lat + ',' + data.content[point].lng + '&heading=151.78&pitch=-0.76&sensor=false">');
            }, "json");
        });
        
        $('.checkIn').live('click', function () {
        	var item = $(this);
        	_flightForCheckin = item.data('flight');
        });
        
        $seatPicker.live('pageshow', function (event) {
        	var el = $('#seatMapPickerContainer', this),
        	seat = _flightForCheckin.segments[_flightForCheckin.currentSegment].seat;
        	seatMapDrawing.drawSeatMap(el, seat);
        
        });
        
        $seatPicker.live('pagebeforehide', function (event) {
        	_flightForCheckin.segments[_flightForCheckin.currentSegment].seat = seatMapDrawing.getselectedSeat();
        });
    },
    
    _initTripDetail = function(){
	    route = _flightForDetails.Location;
        $.ajax({
        url: 'http://wouterlambrechts.ikdoeict.be/project2/api/Location/'+ route ,
        type: 'get',
        dataType: 'json',
        async: false,
        cache: false,
	        success: function(data, textStatus, jqXHR) {
                $('#streetview').empty();
                $('#streetview').append('<img src="http://maps.googleapis.com/maps/api/streetview?size=300x300&location=' + data.content[0].lat + ',' + data.content[0].lng + '&heading=151.78&pitch=-0.76&sensor=false">');
                var item = $('#button');
                item.data('point', 1);
                item.addClass('next');
	        }     
        });
	   
	   
    },
    
    _initBoardingPass = function(){
        currentseg = _flightForCheckin.segments[_flightForCheckin.currentSegment];

	    $('#boardingpass-cnum').text(_flightForCheckin.cNum);
	    $('#boardingpass-passenger').text(_customerData.firstName + ' ' + _customerData.lastName);
	    $('#boardingpass-seat').text(currentseg.seat);
	    $('#boardingpass-gate').text(currentseg.gate);
	    $('#boardingpass-depart').text(currentseg.time);
	    var flight = currentseg.flightNum + ':' + currentseg.from + ' to ' + currentseg.to;
	    $('#boardingpass-flight').text(flight);
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
    
    _initCheckIn = function(){
        var currentseg = _flightForCheckin.segments[_flightForCheckin.currentSegment],
	    seat = currentseg.seat,
	    flight = currentseg.from + ' to ' + currentseg.to;
	    $('#checkIn-flight-number').text(currentseg.flightNum);
	    $('#checkIn-flight-destination').text(flight);
        
	    $('#checkIn-seat').text(seat);
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
        async: false,
        cache: false,
	        success: function(data, textStatus, jqXHR) {
	     		_customerData = data;
                for (var i in data.content) {
                    var flight = data.content[i];
                    $flightList.append('<li class="clearfix list" id="' + data.content[i].idRoutes + '"><img src="http://placehold.it/100x100"><a href="#tripDetail" data-transition="slide">'  + data.content[i].Name +  '</a><p>' +data.content[i].Duration + '</p></li>');
			        var item = $('#' +  data.content[i].idRoutes, $flightList);
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
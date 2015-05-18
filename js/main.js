require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    baseUrl : 'js',
	paths: { loom : './loom' }
});


require(["jquery", "loom/loom"], function($, Loom) {
	
    
   
	var loomConfig = 
	{
		
	}
	
	var loom = new Loom(loomConfig);
    
    loom.addOnSuccessCallback("ResponseHandlerTest", function() {alert("there was a success");} );
    loom.addOnErrorCallback("ResponseHandlerTest", function() {alert("there was some error");} );
    loom.addOnSoftErrorCallback("ResponseHandlerTest", function() {alert("there was a softError");} );
    loom.addOnHardErrorCallback("ResponseHandlerTest", function() {alert("there was a hardError");} );
});


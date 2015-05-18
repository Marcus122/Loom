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
    
    loom.addOnSuccessCallback("#ResponseHandlerTest", function() {alert("there was a success");} );
    loom.addOnErrorCallback("ResponseHandlerTest", function() {alert("there was some error");} );
    loom.addOnSoftErrorCallback("ResponseHandlerTest", function() {alert("there was a softError");} );
    loom.addOnHardErrorCallback("ResponseHandlerTest", function() {alert("there was a hardError");} );
    
    require(["loom/loomAlerts"], function(Alerts) {
    
        $(".showSuccessMessage").click(function() {
            Alerts.showSuccessMessage("This is a success message");
        });
        
        $(".showErrorMessage").click(function() {
            Alerts.showErrorMessage("This is an error message");
        });
        
        $(".showPersistentSuccessMessage").click(function() {
            Alerts.showPersistentSuccessMessage("This is a persistent success message");
        });
        
        $(".showPersistentErrorMessage").click(function() {
            Alerts.showPersistentErrorMessage("This is a persistent error message");
        });
    
    });
});


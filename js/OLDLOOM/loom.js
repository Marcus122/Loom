define(["jquery", "lib/form"],function($, Form){
	
	return function Class($config) {
		var forms=[];
		// Do some stuff with the config in here.
        var settings = $.extend({
            option:'default-value'
        }, $config)
				
		
        // Config ignored at the moment.
		var defaultConfig = {
			validateOnBlur : false,
			realtimeValidation : true
		}
		
		function init() {
			var formElements = $("form.loom-form");
			formElements.each(function(){
				form = new Form(this);
				forms.push(form);
			});
		}
		
		return{
			init:init
		}
	}
	
});
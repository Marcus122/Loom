define(["jquery", "lib/formField"],function($, FormField){

	// MODEL OBJECT
	return function Class($form, config) {
		
        // Form level config options.
        if (config == undefined) config = {};
        
		var FORM_PENDING_CLASS  =  config.FORM_PENDING_CLASS || "form-pending";
		var FORM_ERROR_CLASS    =  config.FORM_ERROR_CLASS || "form-error";
		var FORM_SUCCESS_CLASS  =  config.FORM_SUCCESS_CLASS || "form-success";
        var FORM_FIELD_CONTAINER_SELECTOR = config.FORM_FIELD_CONTAINER_SELECTOR || ".input-field"
		
		var VALIDATE_ON_BLUR                    = config.VALIDATE_ON_BLUR || false;
		var MAY_NOT_PROGRESS_PAST_INVALID_FIELD = config.MAY_NOT_PROGRESS_PAST_INVALID_FIELD || false;
		var REALTIME_VALIDATION                 = config.REALTIME_VALIDATION || true;
		var JUMP_TO_INVALID_FIELD_ON_SUBMIT     = config.JUMP_TO_INVALID_FIELD_ON_SUBMIT || true;
        
        
		var formElement = $();
		var fields = [];
		var url;
		var action;
		var dataType;
		var prefix;
		
		// INIT
		formElement 	= $($form);
		url 			= formElement.attr("action");
		action 			= formElement.attr("data-loom-action");
		dataType 		= formElement.attr("data-loom-data-type");
		prefix 			= formElement.attr("data-loom-field-prefix") || "";
		
		setupNormalInputs();
		setupRadioInputs();
		setupFieldDependentValidators();
		setupConfirmationValidators();
        
        //TODO if we try to submit an invalid form, an invalid message appears.
        // if we then fill out the fields correctly, when we come back to the bottom of the form the messages is still there.
        // basically on any validation we should check the whole form, and if it's invalid we should 
		
		if (REALTIME_VALIDATION) {
			var lim = fields.length;
			for(var i = 0;i<lim;i++){
                 // keyup for text, change for radio, check, select.
                var validationFunc = getValidationCallback(fields[i]);
                var validationFuncIgnoringTabKeypress = wrapCallbackInTabIgnore(validationFunc); //We dont want validation firing when we've just tabbed to a new field.
				fields[i].element.on("keyup", validationFuncIgnoringTabKeypress);
                fields[i].element.on("change", validationFuncIgnoringTabKeypress); //we add both so it handles clicks and keypresses.
			}
		}
		
		if(VALIDATE_ON_BLUR || MAY_NOT_PROGRESS_PAST_INVALID_FIELD || REALTIME_VALIDATION){
			var lim = fields.length;
			for(var i = 0;i<lim;i++){
				fields[i].element.on("blur", getValidationCallback(fields[i]));
			}
		}

		function getValidationCallback(elem){
			return function(evt){
				elem.setValueFromBoundInput();
				var ok = elem.isValid()
				if (!ok && MAY_NOT_PROGRESS_PAST_INVALID_FIELD){
					elem.element.focus();
				}
			}
		}
        
        function wrapCallbackInTabIgnore(func) { 
            return function (e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code == 9) {
                    return;
                }
                func();
            }
        }
        
        var resetButton = formElement.find("button[type='reset']");
        
        resetButton.on("click", function(evt){
            clearStateMessages();
            clearValidationMessages();
            resetInputs();
        });
		
		formElement.on("submit", function(evt){
			evt.preventDefault();
			clearStateMessages();
			clearValidationMessages();
			loadFormValuesIntoModelFields();
			var isValid = validateFormAndReturnTrueIfValid();
			if (!isValid){
				showValidationMessage();
				if (JUMP_TO_INVALID_FIELD_ON_SUBMIT) {
					formElement.find('.input-field.error input').first().focus();
				}
				return;
			} else {
				setStatePending();
				doFormSubmission();
			}
		});
		
		function setupConfirmationValidators(){
			var lim = fields.length;
			for(var i = 0;i < lim; i++) {
				var otherFieldName = fields[i].getNameOfConfirmField();
				if (!otherFieldName) {
					continue;
				}
				fields[i].setupConfirmationValidators(getFieldByName(otherFieldName));
			}
		}
		
		function setupFieldDependentValidators() {
			var lim = fields.length;
			for(var i = 0;i < lim; i++) {
				var otherFieldName = fields[i].getNameOfDependencyField();
				if (!otherFieldName) {
					continue;
				}
				fields[i].setupFieldDependentValidators(getFieldByName(otherFieldName));
			}
		}
		
		function setupNormalInputs(){
            var formFieldContainers = formElement.find(FORM_FIELD_CONTAINER_SELECTOR);
            var lim = formFieldContainers.length;
            for(var i = 0;i<lim;i++){
                addInputField(formFieldContainers[i]);
            }
            
		}
		
		function setupRadioInputs(){
            // We'll end up reusing this code. but deactivating it for now.
            return;
			var radioButtonElements = formElement.find(":radio");
			var radioButtonNamesWithDuplicates = [];
			var lim = radioButtonElements.length;
			for (var i = 0; i < lim; i++) {
					var name = $(radioButtonElements[i]).attr("name");
					radioButtonNamesWithDuplicates.push(name);
			}
			var radioButtonNames =  $.grep(radioButtonNamesWithDuplicates, function(el, index) { //just uniquifies the list, looks scary but its not :)
																return index === $.inArray(el, radioButtonNamesWithDuplicates);
																	});
			lim = radioButtonNames.length;
			for(var i =0; i < lim; i++){
				var radioElemsWithThisName = formElement.find(":radio[name='" + radioButtonNames[i] + "']");
				addInputField(radioElemsWithThisName);
			}
		}
		
		function validateFormAndReturnTrueIfValid(){
			var isValid = true;
			var lim = fields.length;
			for(var i =0; i < lim; i++) {
				var validThisTime = fields[i].isValid();
				isValid = validThisTime && isValid;
			}
			return isValid;
		}
		
		function loadFormValuesIntoModelFields(){
			var lim = fields.length;
			for ( var i = 0; i < lim; i++){
				fields[i].setValueFromBoundInput();
			}
		}
		
		function formSubmissionCallback(response){
			if (response.error) {
				clearStateMessages();
				setStateError();
			} else {
				clearStateMessages();
				setStateSuccess();
			}
		}
		
		function appendFormField(name,value,string){
			var object = {};
			object[name] = value;  
			if(!string){
				string = jQuery.param(object);
			} else {
				string = string+"&"+jQuery.param(object);
			}
			return string;
		}
		
		//TODO : switch on dataType, if JSON jsonify the form and post up.
		function doFormSubmission(){
			var result = {};
			var params;
			var lim = fields.length;
			for (var i = 0; i < lim; i++) {
				if (fields[i].noPost) {
					continue;
				}
				var name = fields[i].getName(prefix);
				var val = fields[i].getValue();
				params = appendFormField(name, val, params);
			}
			params = appendFormField("action", action, params);
			$.ajax({
				type: "POST",
				url: url,
				dataType: "json",
				data: params
			}).done(function(response){
				formSubmissionCallback(response);
			}).error(function(xhr,error,thrown){
				result["error"] = true;
				formSubmissionCallback(result);
			});
			
		}
		
		function clearStateMessages(){
			formElement.removeClass(FORM_PENDING_CLASS);
			formElement.removeClass(FORM_ERROR_CLASS);
			formElement.removeClass(FORM_SUCCESS_CLASS);
		}
		
		
		function setStatePending(){
			formElement.addClass(FORM_PENDING_CLASS);
		}
		function setStateError(){
			formElement.addClass(FORM_ERROR_CLASS);
		}
		function setStateSuccess(){
			formElement.addClass(FORM_SUCCESS_CLASS);
		}
		
		function clearValidationMessages(){
			formElement.removeClass("invalid");
		}
		
		function showValidationMessage(){
			formElement.addClass("invalid");
		}
        
        function resetInputs(){
            var lim = fields.length;
            for(var i =0;i<lim;i++) {
                fields[i].reset();
            }
        }
		
		function addInputField(theField){
			fields.push(FormField(theField));
		}
		
		function getFieldByName(name){
			var lim = fields.length;
			for (var i = 0; i < lim; i++) {
				if (fields[i].name == name) {
					return fields[i];
				}
			}
		}
		
		return {
			showValidationMessage:showValidationMessage,
			clearValidationMessages:clearValidationMessages,
			setStatePending:setStatePending,
			setStateError:setStateError,
			setStateSuccess:setStateSuccess,
			doFormSubmission:doFormSubmission,
			formSubmissionCallback:formSubmissionCallback,
			loadFormValuesIntoModelFields:loadFormValuesIntoModelFields,
			validateFormAndReturnTrueIfValid:validateFormAndReturnTrueIfValid,
			fields:fields,
			setupFieldDependentValidators:setupFieldDependentValidators,
			getFieldByName:getFieldByName
		};
	}
});




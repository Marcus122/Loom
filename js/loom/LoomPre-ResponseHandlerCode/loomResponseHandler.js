define(["jquery"], function($){
    
    
    return function Class(loomForm) {
        
        var loomForm = loomForm;

        function processServerReponse(response) {
            //not detecting error or success for now.
            processHTML(response);
            processFieldErrors(response.meta);
            processMessage(response.meta);
            processRedirect(response.meta);
            return response;
        }

        function processError(response){
            //takes the jquery error and turns it into our error format.
            //error = "X"
        }

        function processHTML(response) {
            if (!response.html || !response.meta.html_meta_entries) {
                return;
            }
            var $html = response.html;
            if($html.length > 0 && response.meta.html_meta_entries) {
               var htmlMetaEntries = response.meta.html_meta_entries;
               var lim = htmlMetaEntries.length;
               for (var i =0; i<lim;i++) {
                    var thisMetaEntry = htmlMetaEntries[i];
                    var sourceSelector = thisMetaEntry.source_selector;
                    var targetSelector = thisMetaEntry.target_selector;
                    var method = thisMetaEntry.method || "replace";
                    if (!targetSelector || !sourceSelector) {
                        console.log("Loom: error processing HTML meta entries in server response, the expected values were not present.");
                        return;
                    }
                    var $source = $html.find("sourceSelector");
                    var $target = $(document).find("targetSelector");
                    if (method == "replace") {
                        $target.html("");
                        $target.append($source);
                    } else {
                        if !(method == "append" || method = "prepend") {
                            console.log("Loom: error processing HTML meta entries in server response, invalid method name");
                            return;
                        }
                        $(target)[method]($source);
                    }
               }
            }
        }

        function processFieldErrors(meta) {
            var fieldErrors = meta.field_errors;
            if (!fieldErrors || fieldErrors.length < 1) {
                return;
            }
            var lim = fieldErrors.length;
            for (var i =0; i<lim;i++) {
                var thisFieldErrors = fieldErrors[i];
                fieldName = thisFieldErrors.field;
                message = thisFieldErrors.message;
                if (!fieldName || !message) {
                    continue;
                }
                var formField = loomForm.getFieldByName(fieldName);
                if (!formField) {
                    continue;
                }
                var $messageContainer = formField.validationElement.find(".server-error");
                formField.validationElement.addClass("server-error");
                $messageContainer.html(message);
            }
        }


        function processMessage(meta) {
            //for now we just alert the message;
            alert(meta.message.content);
        }

        function processRedirect(meta) {
            //for now just alert the URL
            if (!meta.redirect_url) {
                return;
            }
            alert("In future you would be redirected to  " + meta.redirect_url);
        }
        
        return {
            processServerReponse:processServerReponse,
            processRedirect:processRedirect,
            processMessage:processMessage,
            processFieldErrors:processFieldErrors,
            processHTML:processHTML
        }
    
    }

});

define(["jquery"],function($){
    
    /* UNTESTED CODE */

    defaultLanguage = "en-gb";
    var userLangFull = navigator.language || navigator.userLanguage; //e.g. 'en-gb'
    var userLang = userLangFull.substring(0,2); //e.g. 'en'
    
    resourceLookup = { //This is where the resources live. could be populated via JSON from a server URL
        "TEST" : {
            "en-gb" : "language is en-gb",
            "fr" : "language is fr"
        },
        "AddedToBasket" : {
            "en" : "Added {0} to your basket"
        },
        "AddedItemToBasket" : {
            "en" : {
                _numberSensitive : true,
                _default : "SINGULAR",
                "ZERO" : "Added {0} items to your basket",
                "PLURAL" : "Added {0} item to your basket",
                "SINGLUAR" : "Added {0} items to your basket"
            }
            
        }
    };

    return {
        //TODO:
        //detect non string arguments to formatString.
        //if numeric, check for _numberSensitive on the formatString after language lookup, and read out the correct value.
        // if an object, check for a { value : "this is the string", "gender" : "male"} type object.
        //strip out value, which is the initial lookup key, and then lookup the other keys too (probably in alphabetical, for now just assume one key of gender.
        // in addition we can probably do the additional number check to the value as it could be a number.
        
        /* 
        var langLookupResult; //the data that we got back based on the language.
        for (var a in args) {
          if  (typeof args[a] == "number") {
            if (langLookupResult._numberSensitive) {
                var numClass = getNumberClass(args[a]);
                var theString = "";
                if (numClass in langLookupResult) {
                    theString = langLookupResult[numClass];
                }else {
                    theString = langLookupResult[langLookupResult._default];
                }
            } else {
                //we passed in number but its not number sensitive so just treat as a normal string
            }
          }
        }
        */
        // work in progress.
        getNumberClass : function( num) {
            var numClass = "SINGULAR";
            if (num == 0) {
                numClass = "ZERO";
            } else if (num == 1) {
                numClass = "SINGULAR";
            } else if (num > 1) {
                numClass = "PLURAL";
            }
            return numClass;
        },
        
        
        getString : function(key) {
            var formatString = (arguments.length > 1) // call looks like getString("NumItems", 8); where numItems is something like "You added {0} Items".
            if (key in resourceLookup) {
                var thisResource = resourceLookup[key];
                var theString = key; //absolute fallback;
                if (defaultLanguage in thisResource) {
                    var theString = thisResource[defaultLanguage]; //fallback, this should always succeed.
                }
                if (userLang in thisResource) { //try just language first. e.g. en
                    theString = thisResource[userLang];
                } 
                if (userLangFull in  thisResource) { //override with more specific if it's there e.g. en-gb
                    theString = thisResource[userLangFull];
                }
                if (!formatString) {
                    return theString;
                } else {
                    var args = Array.prototype.slice.call(arguments);
                    args[0] = theString;
                    return StringFormat.apply(this,args);
                }
            } else {
                return key; //if all else fails return the original string.
            }
            
            //helper function needs testing.. TODO: not used at the mo.
            //Format("{0} + {0} = {1}", "one", "two")
            function StringFormat(format) {
                console.log(arguments);
                var args = Array.prototype.slice.call(arguments, 1);
                return format.replace(/{(\d+)}/g, function(match, num) { 
                return typeof args[num] != 'undefined'
                ? args[num] 
                : match;
                });
            }; 
        }
        //TODO: detect multiple args to getString, in which case expect a formatString from the resource lookup which we will load in the arguments to.
    }

});

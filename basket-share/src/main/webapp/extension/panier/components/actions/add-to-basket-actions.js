/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
(function() {
    YAHOO.Bubbling.fire("registerAction",
    {
        actionName: "onActionAddToSelectionTo",
        fn: function onActionAddToSelectionTo(record) {
        	var tmpnodeRef = [];


      	  if (YAHOO.lang.isArray(record))
            {
               for (var i = 0, il = record.length; i < il; i++)
               {
              	 tmpnodeRef.push(record[i].nodeRef);
               }
            }
            else
            {
            	 tmpnodeRef.push(record.nodeRef)
            }
      	  
      	  var url = Alfresco.constants.PROXY_URI
  			+ "basket/elements";

		  	Alfresco.util.Ajax.request({
		  		method : Alfresco.util.Ajax.POST,
		  		url : url,
		  		requestContentType : Alfresco.util.Ajax.JSON,
		  		responseContentType : Alfresco.util.Ajax.JSON,
		  		dataObj : {
		  			nodeRefs : tmpnodeRef
		  		},
		  		successCallback:
	            {
	               fn: function(res)
	               {	            	  
	                   var successCount = res.json.successCount;
	                   var failureCount = res.json.failureCount;
	                   var totalResults = res.json.totalResults;
	                   var results = res.json.results;
	                   var thefiles = "";
		               // Did the operation NOT succeed?	                   
		               if (!res.json.overallSuccess && successCount>0)
		               {	                  
		            	   for(i =0;i<results.length;i++){
		            		  
		            		   
		            		   
		            		   if(!results[i].success){
		            			   thefiles = thefiles + results[i].name + "\r\n";
		            		   }
		            	   }
		            	   var errormsgkey;
		            	   if(totalResults==1){
		            	    Alfresco.util.PopupManager.displayPrompt(
                                {
                                    text: this.msg("smile.panier.add.selection.success.file.already.exist")
                                });
		            	   }else{
		            	    Alfresco.util.PopupManager.displayPrompt(
                                {
                            	    text: this.msg("smile.panier.add.multi.selection.success.file.already.exist",successCount, thefiles)
                                });
		            	   }


		                  return;
		               }
		               else if(!res.json.overallSuccess && successCount == 0){
		               var errormsgkey;
                       if(totalResults==1){
                        errormsgkey = "smile.panier.add.selection.success.all.files.already.exist";
                       }else{
                        errormsgkey = "smile.panier.add.selection.success.all.files.already.exists";
                       }

		            	   Alfresco.util.PopupManager.displayPrompt(
                           {
                              text: this.msg(errormsgkey)
                           });              
		                  return;
		               }
		               var msginfo;

	            	   if(successCount==1){
	            	    msginfo = this.msg("smile.panier.add.selection.success");
	            	   }else {
	            	   msginfo = this.msg("smile.panier.add.multi.selection.success", successCount);
	            	   }
		               Alfresco.util.PopupManager.displayMessage(
	                   {
	                      text: msginfo
	                      
	                   });
	               },
	               scope: this
	            },
		  		failureCallback : {
		  			fn: function(res)
	               {
		  				 Alfresco.util.PopupManager.displayMessage(
	                           {
	                              text: this.msg("smile.panier.add.selection.failure")
	                           });
	               },
	               scope: this
		  		}
		  	});        	

        }
    });
})();
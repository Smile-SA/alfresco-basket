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
        actionName: "onActionCopyBasketTo",
        fn: function DLTB_onCopyBasket(record) {
        	var url = Alfresco.constants.PROXY_URI + "/basket/copy";
        	  
        	Alfresco.util.Ajax.request({
        		method : Alfresco.util.Ajax.POST,// yes POST and NOT delete, delete
    											// does not support content
        		url : url,
        		requestContentType: Alfresco.util.Ajax.JSON,
        		responseContentType: Alfresco.util.Ajax.JSON,
        		dataObj:{
        			nodeRef : record.nodeRef
      		},
      		successCallback:
            {
               fn: function(res)
               {
            	   Alfresco.util.PopupManager.displayMessage(
		  	            {
		  	               text: this.msg("smile.panier.message.copybasket.success")
		  	            });
               },
               scope: this
            },
            failureCallback : {
	  			fn: function(res)
               {
  				Alfresco.util.PopupManager.displayMessage(
  			            {
  			               text: this.msg("message.failure")
  			            });
               },
               scope: this
	  		}
        	});
        	
        }
    });
})();
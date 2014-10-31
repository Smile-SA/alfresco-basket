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
function main(){
    if (json.isNull("nodeRefs"))
    {
    	status.setCode(status.STATUS_BAD_REQUEST, "No files.");
        return;
    }
       var values = [];
       var results = [];
       var jsonValues = json.get("nodeRefs");
           
	   for (var i = 0, j = jsonValues.length(); i < j; i++)
       {
		   var documentNodeRef = jsonValues.get(i);
		   var documentNode = findNodeByNodeRef(documentNodeRef);
		   
		   var result =
		      {
		         nodeRef: documentNode.nodeRef,
		         name : documentNode.name,
		         success: false
		      };
		  
		   
		   try{
			   result.success = smilePanierService.addDocumentToSelection(documentNodeRef, person.nodeRef);			  
		   }
		   catch (e){			 
    	       result.success = false;
		   }
		   results.push(result);    		  
       }
	   var overallSuccess = true;
       var successCount = 0;
       var failureCount = 0;
       for (var i = 0, j = results.length; i < j; i++)
       {
	       overallSuccess = overallSuccess && results[i].success;
	       results[i].success ? ++successCount : ++failureCount;
       }
	    model.overallSuccess = overallSuccess;
	    model.successCount = successCount;
	    model.failureCount = failureCount;
	    model.results = results;
	    
}

function findNodeByNodeRef(nodeRef) {
	var resultsArray = search.luceneSearch("workspace\\://SpacesStore/" + nodeRef);
	if (resultsArray != null && resultsArray.length > 0) {
		return resultsArray[0];
	} else {
		return null;
	}
}


main();

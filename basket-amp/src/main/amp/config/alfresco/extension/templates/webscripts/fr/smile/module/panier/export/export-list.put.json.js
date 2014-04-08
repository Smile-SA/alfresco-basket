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
	//model.userName = person.properties["cm:userName"];
    if (!json.isNull("nodeRefs"))
    {
       try{
       		var values = [];
       		var jsonValues = json.get("nodeRefs");
       		// Convert from JSONArray to JavaScript array
       		for (var i = 0, j = jsonValues.length(); i < j; i++)
       		{
       			values.push(jsonValues.get(i));
       		}
       		smilePanierService.addDocumentsToSelection(values, person.nodeRef);
       		model.success = true;
       }catch(e){
    	   status.setCode(status.STATUS_INTERNAL_SERVER_ERROR, "Unknow error, contact your administrator");
 	       return;
       }
    }else{
    	status.setCode(status.STATUS_BAD_REQUEST, "Missings nodeRefs parameter");
	    return;
    }
	
}

main();
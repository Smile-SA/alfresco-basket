<#-- 
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
-->
<#assign el=args.htmlid>
<#assign jsid = args.htmlid?js_string>
<script type="text/javascript">//<![CDATA[
   new Alfresco.Basket("${el}").setOptions(
   {
      userId: "${user.name?js_string}",
      siteId: "<#if page?exists>${page.url.templateArgs.site!""}<#else>${(args.site!"")?js_string}</#if>",
      minSearchTermLength: ${(args.minSearchTermLength!config.scoped['Search']['search'].getChildValue('min-search-term-length'))?js_string},
      maxSearchResults: ${(args.maxSearchResults!config.scoped['Search']['search'].getChildValue('max-search-results'))?js_string},
      setFocus: ${(args.setFocus!'false')?js_string},
   }).setMessages(
      ${messages}
   );
//]]></script>

<div id="${el}-body" class="basket list">
   
  <div class="yui-gc toolbar theme-bg-color-3">
      <div class="button-bar">
         <input type="button" id="${el}-removeFromSelection" value="${msg("message.removeFromSelection")}" />
         <input type="button" id="${el}-exportZip" value="${msg("message.exportZip")}" />
         <input type="button" id="${el}-lastPage" value="${msg("message.lastPage")}" />
         
         <div class="clear"></div>
      </div>
   </div>
   <div id="${el}-results" class="results"></div>
</div>
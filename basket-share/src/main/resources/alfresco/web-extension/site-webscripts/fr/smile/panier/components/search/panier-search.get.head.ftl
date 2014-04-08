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
<#function globalConfig key default>
   <#if config.global.flags??>
      <#assign values = config.global.flags.childrenMap[key]>
      <#if values?? && values?is_sequence>
         <#return values[0].value>
      </#if>
   </#if>
   <#return default>
</#function>

<#-- Global flags retrieved from web-framework-config-application -->
<#assign DEBUG=(globalConfig("client-debug", "false") = "true")>
   <#assign AUTOLOGGING=(globalConfig("client-debug-autologging", "false") = "true")>

<#-- JavaScript minimisation via YUI Compressor -->
<#macro script type src>
   <script type="${type}" src="${DEBUG?string(src, src?replace(".js", "-min.js"))}"></script>
</#macro>

<#-- allow theme to be specified in url args - helps debugging themes -->
<#if page?? && page.url.templateArgs.theme?? && page.url.templateArgs.theme?length != 0>
   <#assign theme = page.url.templateArgs.theme?html />
<#elseif args?? && args.theme?? && args.theme?length != 0>
   <#assign theme = args.theme?html/>
</#if>

<#-- Portlet container detection -->
<#assign PORTLET=(context.attributes.portletHost!false)>
<!-- Search -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/extension/panier/components/search/panier-search.css" />

<@script type="text/javascript" src="${page.url.context}/res/components/search/search.js"></@script>
<@script type="text/javascript" src="${page.url.context}/res/extension/panier/components/search/panier-search.js"></@script>
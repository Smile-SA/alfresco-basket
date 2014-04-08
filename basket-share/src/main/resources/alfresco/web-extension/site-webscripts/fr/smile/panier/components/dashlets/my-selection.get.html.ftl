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
<#assign id = args.htmlid>
<#assign jsid = args.htmlid?js_string>
<#assign prefSimpleView = preferences.simpleView!true>
<script type="text/javascript">//<![CDATA[
(function()
{
   new Smile.dashlet.MySelection("${jsid}").setOptions(
   {
      maxItems: ${maxItems?c}
   }).setMessages(${messages});
   new Alfresco.widget.DashletResizer("${jsid}", "${instance.object.id}");
   new Alfresco.widget.DashletTitleBarActions("${jsid}").setOptions(
   {
      actions:
      [
         {
            cssClass: "help",
            bubbleOnClick:
            {
               message: "${msg("dashlet.help")?js_string}"
            },
            tooltip: "${msg("dashlet.help.tooltip")?js_string}"
         }
      ]
   });
})();
//]]></script>

<div class="dashlet my-documents">
   <div class="title">${msg("header")}</div>
   <div class="toolbar flat-button">
      <div class="hidden">
         <input type="button" id="${id}-removeFromSelection" value="${msg("message.removeFromSelection")}" />
         <input type="button" id="${id}-exportZip" value="${msg("message.exportZip")}" />
         <div id="${id}-simpleDetailed" class="align-right simple-detailed yui-buttongroup inline">
            <span class="yui-button yui-radio-button simple-view<#if prefSimpleView> yui-button-checked yui-radio-button-checked</#if>">
               <span class="first-child">
                  <button type="button" tabindex="0" title="${msg("button.view.simple")}"></button>
               </span>
            </span>
            <span class="yui-button yui-radio-button detailed-view<#if !prefSimpleView> yui-button-checked yui-radio-button-checked</#if>">
               <span class="first-child">
                  <button type="button" tabindex="0" title="${msg("button.view.detailed")}"></button>
               </span>
            </span>
         </div>
         <div class="clear"></div>
      </div>
   </div>
   <div class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
      <div id="${id}-documents"></div>
   </div>
</div>
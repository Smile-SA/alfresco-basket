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

/* **
 * Dashlet MySelection, 
 * Permit to view/remove selected elements by user in order to export them.
 * Built based on the dashlet MyDocuments
 */

/**
 * Dashboard MySelection component.
 *
 * @namespace Alfresco
 * @class Alfresco.dashlet.MySelection
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      Selector = YAHOO.util.Selector;
   
   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
   $links = Alfresco.util.activateLinks,
   $userProfile = Alfresco.util.userProfileLink,
   $siteDashboard = Alfresco.util.siteDashboardLink,
   $relTime = Alfresco.util.relativeTime;

   /**
    * Dashboard MySelection constructor.
    *
    * @param {String} htmlId The HTML id of the parent element
    * @return {Smile.dashletMySelection} The new component instance
    * @constructor
    */
   Smile.dashlet.MySelection = function(htmlId)
   {
	  Smile.dashlet.MySelection.superclass.constructor.call(this, htmlId);
      
      // Re-register with our own name
      this.name = " Smile.dashlet.MySelection";
      
      Alfresco.util.ComponentManager.reregister(this);
      
      YAHOO.Bubbling.on("onFileChecked", this.onFileChecked, this);
      return this;
   };
   
   YAHOO.extend(Smile.dashlet.MySelection, Alfresco.component.SimpleDocList,
   {
	   
	   selectedFiles: [], 
      /**
       * Fired by YUI when parent element is available for scripting
       * @method onReady
       */
	   onReady: function SimpleDocList_onReady()
	      {
	         var me = this;
	         
	         // Detailed/Simple List button
	         this.widgets.simpleDetailed = new YAHOO.widget.ButtonGroup(this.id + "-simpleDetailed");
	         if (this.widgets.simpleDetailed !== null)
	         {
	            this.widgets.simpleDetailed.check(this.options.simpleView ? 0 : 1);
	            this.widgets.simpleDetailed.on("checkedButtonChange", this.onSimpleDetailed, this.widgets.simpleDetailed, this);
	         }

	         // Display the toolbar now that we have selected the filter
	         Dom.removeClass(Selector.query(".toolbar div", this.id, true), "hidden");

	         // modif Smile
	         this.widgets.removeFromSelectionButton = Alfresco.util.createYUIButton(this, "removeFromSelection",this.onRemoveFromSelection);
	         this.widgets.exportZipButton = Alfresco.util.createYUIButton(this, "exportZip",this.onExportZip);
	         //fin modif Smile
	         // DataTable can now be rendered
	         //Alfresco.dashlet.MySelection.superclass.onReady.apply(this, arguments);
	         

	         // Tooltip for thumbnail on mouse hover
	         this.widgets.previewTooltip = new YAHOO.widget.Tooltip(this.id + "-previewTooltip",
	         {
	            width: "108px"
	         });
	         this.widgets.previewTooltip.contextTriggerEvent.subscribe(function(type, args)
	         {
	            var context = args[0],
	               record = me.widgets.alfrescoDataTable.getData(context.id),
	               thumbnailUrl = Alfresco.constants.PROXY_URI + "api/node/" + record.nodeRef.replace(":/", "") + "/content/thumbnails/doclib?c=queue&ph=true";

	            this.cfg.setProperty("text", '<img src="' + thumbnailUrl + '" />');
	         });

	         // Tooltip for metadata on mouse hover
	         this.widgets.metadataTooltip = new YAHOO.widget.Tooltip(this.id + "-metadataTooltip");
	         this.widgets.metadataTooltip.contextTriggerEvent.subscribe(function(type, args)
	         {
	            var context = args[0],
	               record = me.widgets.alfrescoDataTable.getData(context.id),
	               locn = record.location;

	            var text = '<em>' + me.msg("label.site") + ':</em> ' + $html(locn.siteTitle) + '<br />';
	            text += '<em>' + me.msg("label.path") + ':</em> ' + $html(locn.path);

	            this.cfg.setProperty("text", text);
	         });

	         /**
	          * Create datatable
	          * Modif by Smile to externalize and override the creation.
	          */
	         this.widgets.alfrescoDataTable = this.getDataTable();

	         // Override DataTable function to set custom empty message
	         var me = this,
	            dataTable = this.widgets.alfrescoDataTable.getDataTable(),
	            original_doBeforeLoadData = dataTable.doBeforeLoadData;

	         dataTable.doBeforeLoadData = function SimpleDocList_doBeforeLoadData(sRequest, oResponse, oPayload)
	         {
	            if (oResponse.results.length === 0)
	            {
	               oResponse.results.unshift(
	               {
	                  isInfo: true,
	                  title: me.msg("empty.title"),
	                  description: me.msg("empty.description")
	               });
	            }

	            return original_doBeforeLoadData.apply(this, arguments);
	         };

	         // Rendering complete event handler
	         dataTable.subscribe("renderEvent", function()
	         {
	            // Register tooltip contexts
	            this.widgets.previewTooltip.cfg.setProperty("context", this.previewTooltips);
	            this.widgets.metadataTooltip.cfg.setProperty("context", this.metadataTooltips);
	         }, this, true);

	         // Hook favourite document events
	         var fnFavouriteHandler = function SimpleDocList_fnFavouriteHandler(layer, args)
	         {
	            var owner = YAHOO.Bubbling.getOwnerByTagName(args[1].anchor, "div");
	            if (owner !== null)
	            {
	               me.onFavourite.call(me, args[1].target.offsetParent, owner);
	            }
	            return true;
	         };
	         YAHOO.Bubbling.addDefaultAction(Smile.dashlet.MySelection.superclass.FAVOURITE_EVENTCLASS, fnFavouriteHandler);

	         // Hook like/unlike events
	         var fnLikesHandler = function SimpleDocList_fnLikesHandler(layer, args)
	         {
	            var owner = YAHOO.Bubbling.getOwnerByTagName(args[1].anchor, "div");
	            if (owner !== null)
	            {
	               me.onLikes.call(me, args[1].target.offsetParent, owner);
	            }
	            return true;
	         };
	         YAHOO.Bubbling.addDefaultAction(Smile.dashlet.MySelection.superclass.LIKE_EVENTCLASS, fnLikesHandler);
	      }, 
	   
	


      /**
       * Show/Hide detailed list buttongroup click handler
       *
       * @method onSimpleDetailed
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onSimpleDetailed: function MySelection_onSimpleDetailed(e, p_obj)
      {
         this.options.simpleView = e.newValue.index === 0;
         this.reloadDataTable();
      },
      
      /**
       * Override of SimpleDocList.getWebscriptUrl.
       * Can be overridden.
       *
       * @method getWebscriptUrl
       */
      getWebscriptUrl: function MySelection_getWebscriptUrl()
      {
         return Alfresco.constants.PROXY_URI + "basket/export/list/get";
      },
      /**
       * Add by Smile in share.js in order to override it.
       */
      getDataTable: function MySelection_getDataTable(){
    	  var alfrescoTable =  new Alfresco.util.DataTable(
 		         {
 		            dataSource:
 		            {
 		               url: this.getWebscriptUrl(),
 		               initialParameters: this.getParameters(),
 		               config:
 		               {
 		                  responseSchema:
 		                  {
 		                     resultsList: "items"
 		                  }
 		               }
 		            },
 		            dataTable:
 		            {
 		               container: this.id + "-documents",
 		               columnDefinitions:
 		               [
 		                  { key: "choose", sortable: false, formatter: this.bind(this.renderCellChoose), width: 100 },
 		                  { key: "thumbnail", sortable: false, formatter: this.bind(this.renderCellThumbnail), width: 16 },
 		                  { key: "detail", sortable: false, formatter: this.bind(this.renderCellDetail) }
 		               ],
 		               config:
 		               {
 		                  className: "alfresco-datatable simple-doclist",
 		                  renderLoopSize: 4
 		               }
 		            }
 		         });
    	  var me = this;
    	  var yuiTable = alfrescoTable.getDataTable();
          var original = yuiTable.doBeforeLoadData;
          
          yuiTable.doBeforeLoadData = function MySelection_doBeforeLoadData(sRequest, oResponse, oPayload)
          {
         	 me.widgets.removeFromSelectionButton.set("disabled", true); 
             if (oResponse.results.length === 0 || oResponse.results[0].isInfo)
             {
             	me.widgets.exportZipButton.set("disabled", true);
             }else{
             	me.widgets.exportZipButton.set("disabled", false);
             }

             return original.apply(this, arguments);
          };
          return alfrescoTable;
      	},
      	/**
		 * Smile add
		 * Choose custom datacell formatter
		 * 
		 * @method renderCellChoose
		 * @param elCell
		 *            {object}
		 * @param oRecord
		 *            {object}
		 * @param oColumn
		 *            {object}
		 * @param oData
		 *            {object|string}
		 */
      	renderCellChoose: function Select_renderCellChoose(
				elCell, oRecord, oColumn, oData) {
			elCell.innerHTML = elCell.innerHTML = '<center><input id="checkbox-'
					+ oRecord.getId()
					+ '" type="checkbox" class="fileChecked"' 
					+' onclick="YAHOO.Bubbling.fire(\'onFileChecked\')"></center>';
			
		},
		/**
		 * Override by smile : supress favorites, like and comments
		 * + correct message modified[...] in [sites] when document is not in a site.
		 */
		renderCellDetail: function SimpleDocList_renderCellDetail(elCell, oRecord, oColumn, oData)
	      {
	         var record = oRecord.getData(),
	            desc = "";

	         if (record.isInfo)
	         {
	            desc += '<div class="empty"><h3>' + record.title + '</h3>';
	            desc += '<span>' + record.description + '</span></div>';
	         }
	         else
	         {
	            var id = this.id + '-metadata-' + oRecord.getId(),
	               version = "",
	               description = '<span class="faded">' + this.msg("details.description.none") + '</span>',
	               dateLine = "",
	               canComment = record.permissions.userAccess.create,
	               locn = record.location,
	               nodeRef = new Alfresco.util.NodeRef(record.nodeRef),
	               docDetailsUrl = Alfresco.constants.URL_PAGECONTEXT + "site/" + locn.site + "/document-details?nodeRef=" + nodeRef.toString();

	            // Description non-blank?
	            if (record.description && record.description !== "")
	            {
	               description = $links($html(record.description));
	            }

	            // Version display
	            if (record.version && record.version !== "")
	            {
	               version = '<span class="document-version">' + $html(record.version) + '</span>';
	            }
	            
	            // Date line
	            var dateI18N = "modified", dateProperty = record.modifiedOn;
	            if (record.custom && record.custom.isWorkingCopy)
	            {
	               dateI18N = "editing-started";
	            }
	            else if (record.modifiedOn === record.createdOn)
	            {
	               dateI18N = "created";
	               dateProperty = record.createdOn;
	            }
	            if (Alfresco.constants.SITE === "")
	            {
	            	if(locn.siteTitle ===""){
	            		var paths = locn.path.split("/");
	            		var folder = paths[paths.length-1];
	            		var url = Alfresco.constants.URL_CONTEXT+"page/repository#filter=path|" + encodeURIComponent(encodeURI(locn.path)) + "|";
	            		var a = "<a href=\"" + url + "\">" + folder + "</a>";
	            		dateLine = this.msg("details." + dateI18N + "-in-site", $relTime(dateProperty), a);
		            	
	            	}else{
	            		dateLine = this.msg("details." + dateI18N + "-in-site", $relTime(dateProperty), $siteDashboard(locn.site, locn.siteTitle, 'class="site-link theme-color-1" id="' + id + '"'));
	            	}
	            }
	            else
	            {
	               dateLine = this.msg("details." + dateI18N + "-by", $relTime(dateProperty), $userProfile(record.modifiedByUser, record.modifiedBy, 'class="theme-color-1"'));
	            }

	            if (this.options.simpleView)
	            {
	               /**
	                * Simple View
	                */
	               desc += '<h3 class="filename simple-view"><a class="theme-color-1" href="' + docDetailsUrl + '">' + $html(record.displayName) + '</a></h3>';
	               desc += '<div class="detail"><span class="item-simple">' + dateLine + '</span></div>';
	            }
	            else
	            {
	               /**
	                * Detailed View
	                */
	               desc += '<h3 class="filename"><a class="theme-color-1" href="' + docDetailsUrl + '">' + $html(record.displayName) + '</a>' + version + '</h3>';

	               desc += '<div class="detail">';
	               desc +=    '<span class="item">' + dateLine + '</span>';
	               if (this.options.showFileSize)
	               {
	                  desc +=    '<span class="item">' + Alfresco.util.formatFileSize(record.size) + '</span>';
	               }
	               //add Smile : mimetype view
	               desc += '<span class="item">' + record.mimetype + '</span>';
	               desc += '</div>';
	               desc += '<div class="detail"><span class="item">' + description + '</span></div>';
	               desc += '</div>';
	            }
	            
	            // Metadata tooltip
	            this.metadataTooltips.push(id);
	         }

	         elCell.innerHTML = desc;
	      },
		
	      onFileChecked: function Select_onFileChecked(layer, args){
	    	  if (this.widgets.alfrescoDataTable.getDataTable().getRecordSet()._records.length === 0 || 
	    			  this.widgets.alfrescoDataTable.getDataTable().getRecord(0).getData().isInfo){
	    		  return;
	    	  }
				this.selectedFiles = [];
				var checks = Dom.getElementsByClassName('fileChecked');
				var len = this.widgets.alfrescoDataTable.getDataTable().getRecordSet()._records.length;
				for (i = 0, j = 0; i < len; i++) {
					var oRecord = this.widgets.alfrescoDataTable.getDataTable()
							.getRecord(i);
					var record = oRecord.getData();
					if (checks[i].checked) {
						this.selectedFiles[j++] = record.nodeRef;
					}
				}
				if(this.selectedFiles.length > 0){
					this.widgets.removeFromSelectionButton.set('disabled', false);
				}else{
					this.widgets.removeFromSelectionButton.set('disabled', true);
				}
			},  
		
		onRemoveFromSelection: function MySelection_onRemoveFromSelection(){
			if(this.selectedFiles[0]==null){
				return;// If someone has checked the help message ...
			}
			var url = Alfresco.constants.PROXY_URI + "basket/export/list/delete";
			         
			Alfresco.util.Ajax.request({
				method : Alfresco.util.Ajax.POST,//yes POST and NOT delete, delete does not support content 
				url : url,
				requestContentType: Alfresco.util.Ajax.JSON,
				responseContentType: Alfresco.util.Ajax.JSON,
				dataObj:{
					nodeRefs:this.selectedFiles
				},
				successCallback : {
					fn : this.onRemoveFromSelectionSuccess,
					scope : this
				},
				failureCallback : {
					fn : this.onRemoveFromSelectionFailure,
					scope : this
				}
			});

		},
		
		onRemoveFromSelectionSuccess: function MySelection_onRemoveFromSelectionSuccess(response){
			this.widgets.alfrescoDataTable.reloadDataTable();
		},

		onRemoveFromSelectionFailure:function MySelection_onRemoveFromSelectionFailure(response){
			Alfresco.util.PopupManager.displayMessage(
		            {
		               text: this.msg("message.removeFromSelection.failure") + response.message
		            });
		},
		
		
		onExportZip: function MySelection_onExportZip(){

			/*
			var url = Alfresco.constants.PROXY_URI + "export/zip";
			         
			Alfresco.util.Ajax.request({
				method : Alfresco.util.Ajax.GET,
				url : url,
				requestContentType: Alfresco.util.Ajax.JSON,
				responseContentType: Alfresco.util.Ajax.JSON,
				dataObj:{
					//not use for the moment.
					nodeRefs:this.selectedFiles
				},
				successCallback : {
					fn : this.onExportZipSuccess,
					scope : this
				},
				failureMessage : "Export Zip failed"
			});
			*/
			window.location.href=Alfresco.constants.PROXY_URI + "api/fr/smile/module/panier/export/zip";
			
		},
		onExportZipSuccess: function MySelection_onExportZipSuccess(response){
			window.location = Alfresco.constants.PROXY_URI+response.json.contentUrl;
		}
   });
})();

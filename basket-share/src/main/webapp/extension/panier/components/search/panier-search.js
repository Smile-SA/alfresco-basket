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
	/**
	 * YUI Library aliases
	 */
	var Dom = YAHOO.util.Dom,
		Event = YAHOO.util.Event,
		Selector = YAHOO.util.Selector;;

	/**
	 * Alfresco Slingshot aliases
	 */
	var $html = Alfresco.util.encodeHTML,
		$links = Alfresco.util.activateLinks,
		$userProfile = Alfresco.util.userProfileLink,
		$siteDashboard = Alfresco.util.siteDashboardLink,
		$relTime = Alfresco.util.relativeTime;
	
	/**
	 * Search constructor.
	 * 
	 * @param {String}
	 *            htmlId The HTML id of the parent element
	 * @return {Alfresco.Search} The new Search instance
	 * @constructor
	 */
	Smile.Search = function(htmlId)
	   {
		Smile.Search.superclass.constructor.call(this, htmlId);
	      
	      // Re-register with our own name
	      this.name = "Smile.Search";
	      
	      Alfresco.util.ComponentManager.reregister(this);
	      YAHOO.Bubbling.on("onFileSearchChecked", this.onFileSearchChecked, this);
	      return this;
	   };
	

	
	YAHOO.extend(Smile.Search, Alfresco.Search,
	{
		onReady : function Search_onReady() {
		var me = this;

		// DataSource definition
		var uriSearchResults = Alfresco.constants.PROXY_URI_RELATIVE
				+ "slingshot/search?";
		this.widgets.dataSource = new YAHOO.util.DataSource(
				uriSearchResults,
				{
					responseType : YAHOO.util.DataSource.TYPE_JSON,
					connXhrMode : "queueRequests",
					responseSchema : {
						resultsList : "items"
					}
				});
							
		// DataSource Selection definition
		var uriSelectionSearchResults = Alfresco.constants.PROXY_URI + "basket/export/list/get";
		this.widgets.SelectiondataSource = new YAHOO.util.DataSource(
				uriSelectionSearchResults,
				{
					responseType : YAHOO.util.DataSource.TYPE_JSON,
					connXhrMode : "queueRequests",
					responseSchema : {
						resultsList : "items"
					}
				});

		// YUI Paginator definition
		var handlePagination = function Search_handlePagination(
				state, me) {
			me.currentPage = state.page;
			me.widgets.paginator.setState(state);
		};
		this.widgets.paginator = new YAHOO.widget.Paginator(
				{
					containers : [
							this.id + "-paginator-top",
							this.id + "-paginator-bottom" ],
					rowsPerPage : this.options.pageSize,
					initialPage : 1,
					template : this
							.msg("pagination.template"),
					pageReportTemplate : this
							.msg("pagination.template.page-report"),
					previousPageLinkLabel : this
							.msg("pagination.previousPageLinkLabel"),
					nextPageLinkLabel : this
							.msg("pagination.nextPageLinkLabel")
				});
		this.widgets.paginator.subscribe("changeRequest",
				handlePagination, this);

		// setup of the datatable.
		this._setupDataTable();

		// set initial value and register the "enter" event
		// on the search text field
		var queryInput = Dom.get(this.id + "-search-text");
		queryInput.value = this.options.initialSearchTerm;

		this.widgets.enterListener = new YAHOO.util.KeyListener(
				queryInput, {
					keys : YAHOO.util.KeyListener.KEY.ENTER
				}, {
					fn : me._searchEnterHandler,
					scope : this,
					correctScope : true
				}, "keydown").enable();

		// trigger the initial search
		YAHOO.Bubbling
				.fire(
						"onSearch",
						{
							searchTerm : this.options.initialSearchTerm,
							searchTag : this.options.initialSearchTag,
							searchSort : this.options.initialSort,
							searchAllSites : this.options.initialSearchAllSites,
							searchRepository : this.options.initialSearchRepository
						});

		// toggle site scope links
		var toggleLink = Dom.get(this.id + "-site-link");
		Event.addListener(toggleLink, "click",
				this.onSiteSearch, this, true);
		toggleLink = Dom.get(this.id + "-all-sites-link");
		Event.addListener(toggleLink, "click",
				this.onAllSiteSearch, this, true);
		toggleLink = Dom.get(this.id + "-repo-link");
		Event.addListener(toggleLink, "click",
				this.onRepositorySearch, this, true);

		// search YUI button
		this.widgets.searchButton = Alfresco.util
				.createYUIButton(this, "search-button",
						this.onSearchClick);
		// modif Smile
		this.widgets.addSelectionButton = Alfresco.util
				.createYUIButton(this,
						"addToSelectionButton",
						this.onAddSelection);

		// menu button for sort options
		this.widgets.sortButton = new YAHOO.widget.Button(
				this.id + "-sort-menubutton", {
					type : "menu",
					menu : this.id + "-sort-menu",
					menualignment : [ "tr", "br" ],
					lazyloadmenu : false
				});
		// set initially selected sort button label
		var menuItems = this.widgets.sortButton.getMenu()
				.getItems();
		for ( var m in menuItems) {
			if (menuItems[m].value === this.options.initialSort) {
				this.widgets.sortButton
						.set(
								"label",
								this
										.msg(
												"label.sortby",
												menuItems[m].cfg
														.getProperty("text")));
				break;
			}
		}
		// event handler for sort menu
		this.widgets.sortButton.getMenu().subscribe(
				"click", function(p_sType, p_aArgs) {
					var menuItem = p_aArgs[1];
					if (menuItem) {
						me.refreshSearch({
							searchSort : menuItem.value
						});
					}
				});

		// Hook action events
		var fnActionHandler = function Search_fnActionHandler(
				layer, args) {
			var owner = YAHOO.Bubbling.getOwnerByTagName(
					args[1].anchor, "span");
			if (owner !== null) {
				if (typeof me[owner.className] == "function") {
					args[1].stop = true;
					var tagId = owner.id
							.substring(me.id.length + 1);
					me[owner.className].call(me, tagId);
				}
			}
			return true;
		};
		YAHOO.Bubbling.addDefaultAction("search-tag",
				fnActionHandler);

		// Finally show the component body here to prevent
		// UI artifacts on YUI button decoration
		Dom.setStyle(this.id + "-body", "visibility",
				"visible");
	},

	_setupDataTable : function Search_setupDataTable() {
		/**
		 * DataTable Cell Renderers
		 * 
		 * Each cell has a custom renderer defined as a
		 * custom function. See YUI documentation for
		 * details. These MUST be inline in order to have
		 * access to the Alfresco.Search class (via the "me"
		 * variable).
		 */
		var me = this;

		/**
		 * Thumbnail custom datacell formatter
		 * 
		 * @method renderCellThumbnail
		 * @param elCell
		 *            {object}
		 * @param oRecord
		 *            {object}
		 * @param oColumn
		 *            {object}
		 * @param oData
		 *            {object|string}
		 */
		renderCellThumbnail = function Search_renderCellThumbnail(
				elCell, oRecord, oColumn, oData) {
			oColumn.width = 100;
			oColumn.height = 100;
			Dom.setStyle(elCell.parentNode, "width",
					oColumn.width + "px");
			Dom.setStyle(elCell, "height", oColumn.height
					+ "px");
			Dom.addClass(elCell, "thumbnail-cell");

			var url = me._getBrowseUrlForRecord(oRecord);
			var imageUrl = Alfresco.constants.URL_RESCONTEXT
					+ 'components/search/images/generic-result.png';

			// use the preview image for a document type
			var dataType = oRecord.getData("type");
			switch (dataType) {
			case "document":
				imageUrl = Alfresco.constants.PROXY_URI_RELATIVE
						+ "api/node/"
						+ oRecord.getData("nodeRef")
								.replace(":/", "");
				imageUrl += "/content/thumbnails/doclib?c=queue&ph=true";
				break;

			case "folder":
				imageUrl = Alfresco.constants.URL_RESCONTEXT
						+ 'components/search/images/folder.png';
				break;

			case "blogpost":
				imageUrl = Alfresco.constants.URL_RESCONTEXT
						+ 'components/search/images/blog-post.png';
				break;

			case "forumpost":
				imageUrl = Alfresco.constants.URL_RESCONTEXT
						+ 'components/search/images/topic-post.png';
				break;

			case "calendarevent":
				imageUrl = Alfresco.constants.URL_RESCONTEXT
						+ 'components/search/images/calendar-event.png';
				break;

			case "wikipage":
				imageUrl = Alfresco.constants.URL_RESCONTEXT
						+ 'components/search/images/wiki-page.png';
				break;

			case "link":
				imageUrl = Alfresco.constants.URL_RESCONTEXT
						+ 'components/search/images/link.png';
				break;

			case "datalist":
				imageUrl = Alfresco.constants.URL_RESCONTEXT
						+ 'components/search/images/datalist.png';
				break;

			case "datalistitem":
				imageUrl = Alfresco.constants.URL_RESCONTEXT
						+ 'components/search/images/datalistitem.png';
				break;
			}

			// Render the cell
			var name = oRecord.getData("displayName");
			var htmlName = $html(name);
			var html = '<span><a href="' + url
					+ '"><img src="' + imageUrl + '" alt="'
					+ htmlName + '" title="' + htmlName
					+ '" /></a></span>';
			if (dataType === "document") {
				var viewUrl = Alfresco.constants.PROXY_URI_RELATIVE
						+ "api/node/content/"
						+ oRecord.getData("nodeRef")
								.replace(":/", "")
						+ "/"
						+ oRecord.getData("name");
				html = '<div class="action-overlay">'
						+ '<a href="'
						+ encodeURI(viewUrl)
						+ '" target="_blank"><img title="'
						+ $html(me
								.msg("label.viewinbrowser"))
						+ '" src="'
						+ Alfresco.constants.URL_RESCONTEXT
						+ 'components/search/images/view-in-browser-16.png" width="16" height="16"/></a>'
						+ '<a href="'
						+ encodeURI(viewUrl + "?a=true")
						+ '" style="padding-left:4px" target="_blank"><img title="'
						+ $html(me.msg("label.download"))
						+ '" src="'
						+ Alfresco.constants.URL_RESCONTEXT
						+ 'components/search/images/download-16.png" width="16" height="16"/></a>'
						+ '</div>' + html;
			}
			elCell.innerHTML = html;
		};

		/**
		 * Description/detail custom cell formatter
		 * 
		 * @method renderCellDescription
		 * @param elCell
		 *            {object}
		 * @param oRecord
		 *            {object}
		 * @param oColumn
		 *            {object}
		 * @param oData
		 *            {object|string}
		 */
		renderCellDescription = function Search_renderCellDescription(
				elCell, oRecord, oColumn, oData) {
			// apply styles
			Dom.setStyle(elCell.parentNode, "line-height",
					"1.5em");

			// site and repository items render with
			// different information available
			var site = oRecord.getData("site");
			var url = me._getBrowseUrlForRecord(oRecord);

			// displayname and link to details page
			var displayName = oRecord
					.getData("displayName");
			var desc = '<h3 class="itemname"><a href="'
					+ url + '" class="theme-color-1">'
					+ $html(displayName) + '</a>';
			// add title (if any) to displayname area
			var title = oRecord.getData("title");
			if (title && title !== displayName) {
				desc += '<span class="title">('
						+ $html(title) + ')</span>';
			}
			desc += '</h3>';

			// description (if any)
			var txt = oRecord.getData("description");
			if (txt) {
				desc += '<div class="details meta">'
						+ $html(txt) + '</div>';
			}

			// detailed information, includes site etc. type
			// specific
			desc += '<div class="details">';
			var type = oRecord.getData("type");
			switch (type) {
			case "document":
			case "folder":
			case "blogpost":
			case "forumpost":
			case "calendarevent":
			case "wikipage":
			case "datalist":
			case "datalistitem":
			case "link":
				desc += me.msg("label." + type);
				break;

			default:
				desc += me.msg("label.unknown");
				break;
			}

			// link to the site and other meta-data details
			if (site) {
				desc += ' ' + me.msg("message.insite");
				desc += ' <a href="'
						+ Alfresco.constants.URL_PAGECONTEXT
						+ 'site/' + $html(site.shortName)
						+ '/dashboard">'
						+ $html(site.title) + '</a>';
			}
			if (oRecord.getData("size") !== -1) {
				desc += ' ' + me.msg("message.ofsize");
				desc += ' <span class="meta">'
						+ Alfresco.util
								.formatFileSize(oRecord
										.getData("size"))
						+ '</span>';
			}
			if (oRecord.getData("modifiedBy")) {
				desc += ' ' + me.msg("message.modifiedby");
				desc += ' <a href="'
						+ Alfresco.constants.URL_PAGECONTEXT
						+ 'user/'
						+ encodeURI(oRecord
								.getData("modifiedByUser"))
						+ '/profile">'
						+ $html(oRecord
								.getData("modifiedBy"))
						+ '</a>';
			}
			desc += ' '
					+ me.msg("message.modifiedon")
					+ ' <span class="meta">'
					+ Alfresco.util.formatDate(oRecord
							.getData("modifiedOn"))
					+ '</span>';
			desc += '</div>';

			// folder path (if any)
			if (type === "document" || type === "folder") {
				var path = oRecord.getData("path");
				if (site) {
					if (path === null || path === undefined) {
						path = "";
					}
					desc += '<div class="details">'
							+ me
									.msg("message.infolderpath")
							+ ': <a href="'
							+ me
									._getBrowseUrlForFolderPath(
											path, site)
							+ '">' + $html('/' + path)
							+ '</a></div>';
				} else {
					if (path) {
						desc += '<div class="details">'
								+ me
										.msg("message.infolderpath")
								+ ': <a href="'
								+ me
										._getBrowseUrlForFolderPath(path)
								+ '">' + $html(path)
								+ '</a></div>';
					}
				}
			}

			// tags (if any)
			var tags = oRecord.getData("tags");
			if (tags.length !== 0) {
				var i, j;
				desc += '<div class="details"><span class="tags">'
						+ me.msg("label.tags") + ': ';
				for (i = 0, j = tags.length; i < j; i++) {
					desc += '<span id="'
							+ me.id
							+ '-'
							+ $html(tags[i])
							+ '" class="searchByTag"><a class="search-tag" href="#">'
							+ $html(tags[i])
							+ '</a> </span>';
				}
				desc += '</span></div>';
			}

			elCell.innerHTML = desc;
		};

		/**
		 * Smile add Choose custom datacell formatter
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
		renderCellChoose = function Search_renderCellChoose(
				elCell, oRecord, oColumn, oData) {
			
			 Dom.setStyle(elCell, "width", oColumn.width + "px");
	         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");
	         
	         var nodeRef = oRecord.getData("nodeRef");
	           
	         
	         elCell.innerHTML = '<input id="checkbox-' + oRecord.getId() + '" type="checkbox" name="fileChecked" value="'+ nodeRef + '"' + (me.selectedFiles[nodeRef] ? ' checked="checked">' : '>');
			
			/*
			elCell.innerHTML = elCell.innerHTML = '<center><input id="checkbox-'
					+ oRecord.getId()
					+ '" type="checkbox" class="fileChecked"'
					+ ' onclick="YAHOO.Bubbling.fire(\'onFileSearchChecked\')"></center>';
			*/

		};
		
		
		
		// DataTable column defintions
		var columnDefinitions = [ {
			/* Modif smile add checkbox column */
			key : "choose",
			label : me.msg("message.choose"),
			sortable : false,
			formatter : renderCellChoose,
			width : 20
		/* Fin */
		}, {
			key : "image",
			label : me.msg("message.preview"),
			sortable : false,
			formatter : renderCellThumbnail,
			width : 100
		}, {
			key : "summary",
			label : me.msg("label.description"),
			sortable : false,
			formatter : renderCellDescription
		} ];

		// DataTable definition
		this.widgets.dataTable = new YAHOO.widget.DataTable(
				this.id + "-results",
				columnDefinitions,
				this.widgets.dataSource,
				{
					renderLoopSize : Alfresco.util.RENDERLOOPSIZE,
					initialLoad : false,
					paginator : this.widgets.paginator,
					MSG_LOADING : ""
				});

		// show initial message
		this
				._setDefaultDataTableErrors(this.widgets.dataTable);
		if (this.options.initialSearchTerm.length === 0
				&& this.options.initialSearchTag.length === 0) {
			this.widgets.dataTable.set("MSG_EMPTY", "");
		}

		// Override abstract function within DataTable to
		// set custom error message
		this.widgets.dataTable.doBeforeLoadData = function Search_doBeforeLoadData(
				sRequest, oResponse, oPayload) {
			// add Smile : hide the underlying YUI button by
			// default
			me.widgets.addSelectionButton.setStyle(
					'visibility', 'hidden');

			if (oResponse.error) {
				try {
					var response = YAHOO.lang.JSON
							.parse(oResponse.responseText);
					me.widgets.dataTable.set("MSG_ERROR",
							response.message);
				} catch (e) {
					me
							._setDefaultDataTableErrors(me.widgets.dataTable);
				}
			} else if (oResponse.results) {
				// clear the empty error message
				me.widgets.dataTable.set("MSG_EMPTY", "");

				// update the results count, update
				// hasMoreResults.
				me.hasMoreResults = (oResponse.results.length > me.options.maxSearchResults);

				if (me.hasMoreResults) {
					oResponse.results = oResponse.results
							.slice(
									0,
									me.options.maxSearchResults);
					me.resultsCount = me.options.maxSearchResults;
				} else {
					me.resultsCount = oResponse.results.length;
				}

				if (me.resultsCount > me.options.pageSize) {
					Dom.removeClass(me.id
							+ "-paginator-top", "hidden");
					Dom.removeClass(me.id
							+ "-search-bar-bottom",
							"hidden");
				}
				/**
				 * Added by smile
				 */
				if (me.resultsCount > 0) {
					// access tu the underlying YUI button
					me.widgets.addSelectionButton.setStyle(
							'visibility', 'visible');
					me.widgets.addSelectionButton.set(
							'disabled', true);
					me.selectedFiles = [];

				}
				
				// File checked handler
		        me.widgets.dataTable.subscribe("checkboxClickEvent", function DL_checkboxClickEvent(e)
		        {
		           var id = e.target.value;
		           me.selectedFiles[id] = e.target.checked;
		           YAHOO.Bubbling.fire("onFileSearchChecked");
		        }, this, true);
			}
			// Must return true to have the "Loading..."
			// message replaced by the error message
			return true;
		};

		// Rendering complete event handler
		me.widgets.dataTable.subscribe("renderEvent",
				function() {
					// Update the paginator
					me.widgets.paginator.setState({
						page : me.currentPage,
						totalRecords : me.resultsCount
					});
					me.widgets.paginator.render();
				});
	},
	/* Begin add smile */
	onAddSelection : function Search_onAddSelectionAction() {

		var url = Alfresco.constants.PROXY_URI
				+ "/basket/elements";

	  	Alfresco.util.Ajax.request({
	  		method : Alfresco.util.Ajax.POST,
	  		url : url,
	  		requestContentType : Alfresco.util.Ajax.JSON,
	  		responseContentType : Alfresco.util.Ajax.JSON,
	  		dataObj : {
	  			nodeRefs : this.getSelectedFiles()
	  		},
	  		successCallback:
            {
               fn: function(res)
               {	            	  
                   var successCount = res.json.successCount;
                   var failureCount = res.json.failureCount;
                   var results = res.json.results;

	               // Did the operation NOT succeed?	                   
	               if (!res.json.overallSuccess && successCount>0)
	               {	                  
	            	   var thefiles = "";
	            	   for(i =0;i<results.length;i++){
	            		  
	            		   
	            		   
	            		   if(!results[i].success){
	            			   thefiles = thefiles + results[i].name + "\r\n";
	            		   }
	            	   }
	            	   
	            	   Alfresco.util.PopupManager.displayPrompt(
	                           {
	                              text: this.msg("smile.panier.add.selection.success.one.file.already.exists",thefiles)
	                           });              
	                  return;
	               }
	               else if(!res.json.overallSuccess && successCount == 0){
	            	   Alfresco.util.PopupManager.displayPrompt(
                       {
                          text: this.msg("smile.panier.add.selection.success.all.files.already.exists")
                       });              
	                  return;
	               }
            	   
	               Alfresco.util.PopupManager.displayMessage(
                   {
                      text: this.msg("smile.panier.add.selection.success")
                      
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

	},

	onFileSearchChecked : function Search_onFileChecked(
			layer, args) {		
		
		 var files = [],
         oRecordSet = this.widgets.dataTable.getRecordSet(),
         oRecord, node, i, j;

		 for (i = 0, j = oRecordSet.getLength(); i < j; i++)
		 {
			 oRecord = oRecordSet.getRecord(i);
			 nodeRef = oRecord.getData("nodeRef");
	         if (this.selectedFiles[nodeRef])
	         {
	        	 this.widgets.addSelectionButton.set('disabled',
	 					false);
	        	 return;
	         }
		 }
		 this.widgets.addSelectionButton.set('disabled',
					true);			
	},

	onAddSelectionSuccess : function Search_onAddSelectionSuccess(
			response) {
		Alfresco.util.PopupManager.displayMessage({
			text : this.msg("message.add.success")
		});
	},

	onAddSelectionFailure : function Search_onAddSelectionFailure(
			response) {
		Alfresco.util.PopupManager.displayMessage({
			text : this.msg("message.add.error")
		});
	},
	 getSelectedFiles: function DL_getSelectedFiles()
    {
       var files = [],
          oRecordSet = this.widgets.dataTable.getRecordSet(),
          oRecord, node, i, j;

       for (i = 0, j = oRecordSet.getLength(); i < j; i++)
       {
          oRecord = oRecordSet.getRecord(i);
          nodeRef = oRecord.getData("nodeRef");
          if (this.selectedFiles[nodeRef])
          {
             files.push(nodeRef);
          }
       }

       return files;
    }
	});
})();
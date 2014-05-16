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
 
/**
 * PeopleFinder component.
 * 
 * @namespace Alfresco
 * @class Alfresco.PeopleFinder
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;
   
   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
      $userProfile = Alfresco.util.userProfileLink;
   		$siteDashboard = Alfresco.util.siteDashboardLink,
   		$links = Alfresco.util.activateLinks,
   		$relTime = Alfresco.util.relativeTime;

   /**
    * PeopleFinder constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.PeopleFinder} The new PeopleFinder instance
    * @constructor
    */
   Alfresco.Basket = function(htmlId)
   {
      Alfresco.Basket.superclass.constructor.call(this, "Alfresco.Basket", htmlId, ["button", "container", "datasource", "datatable", "json"]);

      /**
       * Decoupled event listeners
       */
      YAHOO.Bubbling
		.on("onFileChecked", this.onFileChecked, this);

      return this;
   };
  
   YAHOO.lang.extend(Alfresco.Basket, Alfresco.component.Base,
   {
      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
      options:
      {
         /**
          * Current siteId.
          * 
          * @property siteId
          * @type string
          */
         siteId: "",

         /**
          * Single Select mode flag
          * 
          * @property singleSelectMode
          * @type boolean
          * @default false
          */
         singleSelectMode: false,
         
         /**
          * Whether we show the current user or not flag
          * 
          * @property showSelf
          * @type boolean
          * @default true
          */
         showSelf: true,
         
         /**
          * Maximum number of items to display in the results list
          * 
          * @property maxSearchResults
          * @type int
          * @default 100
          */
         maxSearchResults: 100,

         /**
          * Whether to set UI focus to this component or not
          * 
          * @property setFocus
          * @type boolean
          * @default false
          */
         setFocus: false,

     
         /**
          * Current userId.
          * 
          * @property userId
          * @type string
          */
         userId: ""
      },

      /**
       * Object container for storing YUI button instances, indexed by username.
       * 
       * @property userSelectButtons
       * @type object
       */
      userSelectButtons: null,
      
      /**
       * Current search term, obtained from form input field.
       * 
       * @property searchTerm
       * @type string
       */
      searchTerm: null,
      
      selectedFiles : [],
      /**
       * Fired by YUI when parent element is available for scripting.
       * Component initialisation, including instantiation of YUI widgets and event listener binding.
       *
       * @method onReady
       */
      onReady: function Basket_onReady()
      {  
    	  var me = this;
    	// DataSource Selection definition
			var uriSelectionSearchResults = Alfresco.constants.PROXY_URI + "basket/export/list/get";
			this.widgets.dataSource = new YAHOO.util.DataSource(
					uriSelectionSearchResults,
					{
						responseType : YAHOO.util.DataSource.TYPE_JSON,
						connXhrMode : "queueRequests",
						responseSchema : {
							resultsList : "items"
						}
					});
			
			this._setupDataTable();
			
//			this.widgets.simpleDetailed = new YAHOO.widget.ButtonGroup(this.id + "-simpleDetailed");
//	         if (this.widgets.simpleDetailed !== null)
//	         {
//	            this.widgets.simpleDetailed.check(this.options.simpleView ? 0 : 1);
//	            this.widgets.simpleDetailed.on("checkedButtonChange", this.onSimpleDetailed, this.widgets.simpleDetailed, this);
//	         }

	         // Display the toolbar now that we have selected the filter
//	         Dom.removeClass(Selector.query(".toolbar div", this.id, true), "hidden");
//
	         // modif Smile
	         this.widgets.removeFromSelectionButton = Alfresco.util.createYUIButton(this, "removeFromSelection",this.onRemoveFromSelection);
	         this.widgets.lastpage = Alfresco.util.createYUIButton(this, "lastPage",this.onLastPage);
	         this.widgets.exportZipButton = Alfresco.util.createYUIButton(this, "exportZip",this.onExportZip);
      },
      
      /**
       * Setup the YUI DataTable with custom renderers.
       *
       * @method _setupDataTable
       * @private
       */
      _setupDataTable: function Basket__setupDataTable()
      {
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
				elCell.innerHTML = elCell.innerHTML = '<center><input id="checkbox-'
						+ oRecord.getId()
						+ '" type="checkbox" class="fileChecked"'
						+ ' onclick="YAHOO.Bubbling.fire(\'onFileChecked\')"></center>';

			};
			
			renderCellDetail = function SimpleDocList_renderCellDetail(elCell, oRecord, oColumn, oData)
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
		               description = '<span class="faded">' + me.msg("details.description.none") + '</span>',
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
		            		dateLine = me.msg("details." + dateI18N + "-in-site", $relTime(dateProperty), a);
			            	
		            	}else{
		            		dateLine = me.msg("details." + dateI18N + "-in-site", $relTime(dateProperty), $siteDashboard(locn.site, locn.siteTitle, 'class="site-link theme-color-1" id="' + id + '"'));
		            	}
		            }
		            else
		            {
		               dateLine = me.msg("details." + dateI18N + "-by", $relTime(dateProperty), $userProfile(record.modifiedByUser, record.modifiedBy, 'class="theme-color-1"'));
		            }

	               desc += '<h3 class="filename"><a class="theme-color-1" href="' + docDetailsUrl + '">' + $html(record.displayName) + '</a>' + version + '</h3>';

	               desc += '<div class="detail">';
	               desc +=    '<span class="item">' + dateLine + '</span>';
	               desc +=    '<span class="item">' + Alfresco.util.formatFileSize(record.size) + '</span>';
	               desc += '</div>';
	               
	               //add Smile : mimetype view
	               desc += '<div class="detail"><span class="item">' +  record.mimetype  + '</span></div>';		             
	               desc += '</div>';
	               desc += '<div class="detail"><span class="item">' + description + '</span></div>';
	               desc += '</div>';


		         }

		         elCell.innerHTML = desc;
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
				formatter : renderCellDetail
			} ];

			// DataTable definition
			this.widgets.dataTable = new YAHOO.widget.DataTable(
					this.id + "-results",
					columnDefinitions,
					this.widgets.dataSource,
					{
						renderLoopSize : Alfresco.util.RENDERLOOPSIZE,
						initialLoad : true,
						MSG_LOADING : ""
					});
//			
//			this.widgets.dataSource.sendRequest(), {
//			});

			// show initial message
//			this
//					._setDefaultDataTableErrors(this.widgets.dataTable);
//			if (this.options.initialSearchTerm.length === 0
//					&& this.options.initialSearchTag.length === 0) {
//				this.widgets.dataTable.set("MSG_EMPTY", "");
//			}

			// Override abstract function within DataTable to
			// set custom error message
			this.widgets.dataTable.doBeforeLoadData = function Search_doBeforeLoadData(
					sRequest, oResponse, oPayload) {
				// add Smile : hide the underlying YUI button by
				// default
				
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
						
						me.selectedFiles = [];

					}
				}
				// Must return true to have the "Loading..."
				// message replaced by the error message
				return true;
			};

      },
 
      onFileChecked: function Select_onFileChecked(layer, args){
    	  if (this.widgets.dataTable.getRecordSet()._records.length === 0 || 
    			  this.widgets.dataTable.getRecord(0).getData().isInfo){
    		  return;
    	  }
			this.selectedFiles = [];
			var checks = Dom.getElementsByClassName('fileChecked');
			var len = this.widgets.dataTable.getRecordSet()._records.length;
			for (i = 0, j = 0; i < len; i++) {
				var oRecord = this.widgets.dataTable
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
	
	onLastPage: function Basket_onLastPage(){
		history.go(-1);

	},
	
	onRemoveFromSelectionSuccess: function MySelection_onRemoveFromSelectionSuccess(response){
		this.widgets.dataTable.load();
	},

	onRemoveFromSelectionFailure:function MySelection_onRemoveFromSelectionFailure(response){
		Alfresco.util.PopupManager.displayMessage(
	            {
	               text: me.msg("message.removeFromSelection.failure") + response.message
	            });
	},
	
	/**
	 * Resets the YUI DataTable errors to our custom
	 * messages NOTE: Scope could be YAHOO.widget.DataTable,
	 * so can't use "this"
	 * 
	 * @method _setDefaultDataTableErrors
	 * @param dataTable
	 *            {object} Instance of the DataTable
	 */
	_setDefaultDataTableErrors : function Search__setDefaultDataTableErrors(
			dataTable) {
		var msg = Alfresco.util.message;
		dataTable.set("MSG_EMPTY", msg("message.empty",
				"Alfresco.Search"));
		dataTable.set("MSG_ERROR", msg("message.error",
				"Alfresco.Search"));
	},
	
	_getBrowseUrlForRecord : function Search__getBrowseUrlForRecord(
			record) {
		var url = null;

		var name = record.getData("name"), type = record
				.getData("type"), site = record
				.getData("site"), path = record
				.getData("path");

		switch (type) {
		case "document": {
			url = "document-details?nodeRef="
					+ record.getData("nodeRef");
			break;
		}

		case "folder": {
			if (path !== null) {
				if (site) {
					url = "documentlibrary?path="
							+ encodeURIComponent(this
									._buildSpaceNamePath(
											path.split("/"),
											name));
				} else {
					url = "repository?path="
							+ encodeURIComponent(this
									._buildSpaceNamePath(
											path
													.split(
															"/")
													.slice(
															2),
											name));
				}
			}
			break;
		}

		case "blogpost": {
			url = "blog-postview?postId=" + name;
			break;
		}

		case "forumpost": {
			url = "discussions-topicview?topicId=" + name;
			break;
		}

		case "calendarevent": {
			url = record.getData("container")
					+ "?date="
					+ Alfresco.util.formatDate(record
							.getData("modifiedOn"),
							"yyyy-mm-dd");
			break;
		}

		case "wikipage": {
			url = "wiki-page?title=" + name;
			break;
		}

		case "link": {
			url = "links-view?linkId=" + name;
			break;
		}

		case "datalist":
		case "datalistitem": {
			url = "data-lists?list=" + name;
			break;
		}
		}

		if (url !== null) {
			// browse urls always go to a page. We assume
			// that the url contains the page name and all
			// parameters. Add the absolute path and the
			// optional site param
			if (site) {
				url = Alfresco.constants.URL_PAGECONTEXT
						+ "site/" + site.shortName + "/"
						+ url;
			} else {
				url = Alfresco.constants.URL_PAGECONTEXT
						+ url;
			}
		}

		return (url !== null ? url : '#');
	},

	/**
	 * Constructs the folder url for a record.
	 * 
	 * @param path
	 *            {string} folder path For a site relative
	 *            item this can be empty (root of doclib) or
	 *            any path - without a leading slash For a
	 *            repository item, this can never be empty -
	 *            but will contain leading slash and Company
	 *            Home root
	 */
	_getBrowseUrlForFolderPath : function Search__getBrowseUrlForFolderPath(
			path, site) {
		var url = null;
		if (site) {
			url = Alfresco.constants.URL_PAGECONTEXT
					+ "site/" + site.shortName
					+ "/documentlibrary?path="
					+ encodeURIComponent('/' + path);
		} else {
			url = Alfresco.constants.URL_PAGECONTEXT
					+ "repository?path="
					+ encodeURIComponent('/'
							+ path.split('/').slice(2)
									.join('/'));
		}
		return url;
	},

	_buildSpaceNamePath : function Search__buildSpaceNamePath(
			pathParts, name) {
		return (pathParts.length !== 0 ? ("/" + pathParts
				.join("/")) : "")
				+ "/" + name;
	},
	
	onExportZip: function MySelection_onExportZip(){
		window.location.href=Alfresco.constants.PROXY_URI + "api/fr/smile/module/panier/export/zip";
		
	}
   });
})();
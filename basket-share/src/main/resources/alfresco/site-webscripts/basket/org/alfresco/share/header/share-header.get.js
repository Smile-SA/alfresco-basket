//Find the "Sites" menu...
   /*var sitesMenu =
     widgetUtils.findObject(model.jsonModel, "id", "HEADER_SITES_MENU");
   if (sitesMenu != null)
   {
     // Change the widget to our custom menu...
     sitesMenu.name = "tutorials/sites-menu";
   }*/

   var menuBar = widgetUtils.findObject(model.jsonModel, "id", "HEADER_APP_MENU_BAR");
   if (menuBar != null) {
     menuBar.config.widgets.push({
                      id: "HEADER_MY_BASKET",
                      name: "alfresco/menus/AlfMenuBarItem",
                      config: {
                         id: "HEADER_MY_BASKET",
                         label: "header.menu.my-basket.label",
                         targetUrl: "/fr/smile/panier/manage-panier"
                      }
                   });
   }


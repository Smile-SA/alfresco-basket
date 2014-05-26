alfresco-basket
===============

Basket modules for Alfresco/Share 4.2.x. This module allow user to manage a document basket.

With this module, user can :
- add documents to his basket,
- display and manage the basket documents,
- past basket documents into a folder
- download basket as zip


Build the module
----------------

```shell
mvn install
```

Maven will build 2 files :
- basket-amp/target/basket-amp.amp : an amp module for alfresco repository.
- basket-share-amp/target/basket-share-amp.amp : an amp module for share.


This files should be installed using standard method (apply_amps.sh or apply_amps.bat)


Usage
-----

New actions in share document library are available :
- "Add to basket" on document action, to add document to basket
- "Add to basket" on multi select actions, to add several documents into basket
- "Past basket" on folder action. This action will past basket contents into the folder


A new screen "Manage basket" is available to browse and manage basket content :
- browse basket
- open a document
- remove an elements
- download as zip

A dashlet "my basket" is available in user dashboard. This dashlet display basket content and allow user to manage his basket.



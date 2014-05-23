alfresco-basket
===============

Basket modules for Alfresco/Share. This module allow user to manage a document basket.

With this module, user can :
- add documents to his basket,
- display basket documents, 
- past basket documents into a folder
- download basket as zip


Build
-----

```shell
mvn install
```
Maven will build 2 files :
- basket-amp/target/basket-amp.amp : an amp module for alfresco repository.This file should be installed with standard procedure (apply_amps.sh)
- basket-share/target/basket-share.jar : an extension jar for share. This file should be put in tomcat/shared/lib folder


Installation
------------

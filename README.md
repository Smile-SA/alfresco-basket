alfresco-basket
===============

Basket modules for Alfresco/Share. This module allow user to manage a document basket.

With this module, user can :
- add documents to his basket with document library actions available on document or on multi-select actions,
- display and manage the basket documents,
- past basket documents into a folder
- download basket as zip


Build
-----

```shell
mvn install
```

Maven will build 2 files :
- basket-amp/target/basket-amp.amp : an amp module for alfresco repository.
- basket-share-amp/target/basket-share-amp.amp : an amp module for share.


This files should be installed using apply_amps.sh apply_amps.bat


Usage
-----



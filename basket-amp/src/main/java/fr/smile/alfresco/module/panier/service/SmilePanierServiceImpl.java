/*
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
package fr.smile.alfresco.module.panier.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.alfresco.model.ContentModel;
import fr.smile.alfresco.module.panier.model.SmilePanierModel;
import org.alfresco.service.cmr.model.FileExistsException;
import org.alfresco.service.cmr.repository.AssociationRef;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.CopyService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.QNamePattern;
import org.apache.log4j.Logger;

// TODO: Auto-generated Javadoc
/**
 * The Class SmilePanierServiceImpl.
 */
public class SmilePanierServiceImpl implements SmilePanierService {

	
	/** The node service. */
	private NodeService nodeService;	
	
	/** The copy service. */
	private CopyService copyService;

	/** The Constant LOGGER. */
	private static final Logger LOGGER = Logger
			.getLogger(SmilePanierServiceImpl.class);


	/**
	 * Gets the node service.
	 *
	 * @return the node service
	 */
	public NodeService getNodeService() {
		return nodeService;
	}

	
	/**
	 * Sets the node service.
	 *
	 * @param nodeService the new node service
	 */
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	/**
	 * Sets the copy service.
	 *
	 * @param copyService the new copy service
	 */
	public void setCopyService(CopyService copyService) {
		this.copyService = copyService;
	}

	
	/* (non-Javadoc)
	 * @see fr.smile.alfresco.module.panier.service.SmilePanierService#addToSelection(java.util.Collection, org.alfresco.service.cmr.repository.NodeRef)
	 */
	@Override
	public void addToSelection(Collection<NodeRef> listToAdd, NodeRef user)
			throws FileExistsException {
		LOGGER.debug("Add elements "+listToAdd.toString()+ " in the panier for the user "+user.toString());
		NodeRef panierNodeRef = retrievePanier(user);
		List<AssociationRef> listContentsInPanier = nodeService.getTargetAssocs(
				panierNodeRef, new QNamePattern() {

					@Override
					public boolean isMatch(QName arg0) {
						return SmilePanierModel.ASSOCIATION_EXPORT_ELEMENT
								.equals(arg0);
					}
				});
		Collection<NodeRef> list = mergeAssociationList(panierNodeRef,listContentsInPanier, listToAdd);
		for (NodeRef nodeRef : list) {
			nodeService.createAssociation(panierNodeRef, nodeRef,
					SmilePanierModel.ASSOCIATION_EXPORT_ELEMENT);
		}
	}

	/* (non-Javadoc)
	 * @see fr.smile.alfresco.module.panier.service.SmilePanierService#removeFromSelection(java.util.List, org.alfresco.service.cmr.repository.NodeRef)
	 */
	@Override
	public void removeFromSelection(List<NodeRef> list, NodeRef user)
			 {
		LOGGER.debug("Remove elements "+list.toString()+ "which are in the panier for the user "+user.toString());
		// TODO Auto-generated method stub
		NodeRef exportListRef = retrievePanier(user);

		for (NodeRef nodeRef : list) {
		
			nodeService.removeAssociation(exportListRef, nodeRef,
					SmilePanierModel.ASSOCIATION_EXPORT_ELEMENT);
						
		}
	}

	/* (non-Javadoc)
	 * @see org.alfresco.module.export.service.ExportService#removeFromSelection(org.alfresco.service.cmr.repository.NodeRef, org.alfresco.service.cmr.repository.NodeRef)
	 */
	@Override
	public void removeFromSelection(NodeRef nodeRef, NodeRef user) {
		LOGGER.debug("Remove element "+nodeRef.toString()+ "which is in the panier for the user "+user.toString());
		
		// TODO Auto-generated method stub
		NodeRef panierNodeRef= retrievePanier(user);		
		nodeService.removeAssociation(panierNodeRef, nodeRef, SmilePanierModel.ASSOCIATION_EXPORT_ELEMENT);				
	}

	/* (non-Javadoc)
	 * @see fr.smile.alfresco.module.panier.service.SmilePanierService#resetSelection(org.alfresco.service.cmr.repository.NodeRef)
	 */
	@Override
	public void resetSelection(NodeRef user){
		// TODO On verra si necessaire et le temps

	}

	/* (non-Javadoc)
	 * @see fr.smile.alfresco.module.panier.service.SmilePanierService#getSelection(org.alfresco.service.cmr.repository.NodeRef)
	 */
	@Override
	public List<NodeRef> getSelection(NodeRef user){
		LOGGER.debug("Gets all elements which are in the panier for the user "+user.toString());
		NodeRef panierNodeRef = retrievePanier(user);
		List<AssociationRef> assocs = nodeService.getTargetAssocs(
				panierNodeRef, SmilePanierModel.ASSOCIATION_EXPORT_ELEMENT);
		ArrayList<NodeRef> list = new ArrayList<NodeRef>(assocs.size());
		for (AssociationRef assoc : assocs) {
			list.add(assoc.getTargetRef());
		}
        return list;
	}

	/* (non-Javadoc)
	 * @see fr.smile.alfresco.module.panier.service.SmilePanierService#addToSelection(org.alfresco.service.cmr.repository.NodeRef, org.alfresco.service.cmr.repository.NodeRef)
	 */
	@Override
	public void addToSelection(NodeRef nodeRef, NodeRef user) throws FileExistsException {
		LOGGER.debug("Add an element "+nodeRef.toString()+" in panier for the user "+user.toString());
		String contentToAddName = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME); 
		
		NodeRef panierNodeRef = retrievePanier(user);
		List<AssociationRef> listContentsInPanier = nodeService.getTargetAssocs(
				panierNodeRef, new QNamePattern() {

					@Override
					public boolean isMatch(QName arg0) {
						return SmilePanierModel.ASSOCIATION_EXPORT_ELEMENT
								.equals(arg0);
					}
				});
		for (AssociationRef assoc : listContentsInPanier) {
			NodeRef contentInPanierNodeRef = assoc.getTargetRef();
			String contentInPanierName = (String) nodeService.getProperty(contentInPanierNodeRef, ContentModel.PROP_NAME); 
			
			if (nodeRef.equals(contentInPanierNodeRef) || (contentToAddName.equals(contentInPanierName))) {
				throw new FileExistsException(panierNodeRef, contentToAddName);
			}
		}
		nodeService.createAssociation(panierNodeRef, nodeRef,
				SmilePanierModel.ASSOCIATION_EXPORT_ELEMENT);				

	}

	/**
	 * Merge association list.
	 *
	 * @param panierNodeRef the panier node ref
	 * @param listContentsInPanier the list contents in panier
	 * @param listToAdd the list to add
	 * @return the list
	 * @throws FileExistsException the file exists exception
	 */
	private List<NodeRef> mergeAssociationList(NodeRef panierNodeRef,List<AssociationRef> listContentsInPanier,
			Collection<NodeRef> listToAdd) throws FileExistsException{
		
		List<NodeRef> listResults = new ArrayList<NodeRef>();
		for (NodeRef nodeRef : listToAdd) {
			String contentToAddName = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME); 
			
			boolean found = false;
			for (AssociationRef assoc : listContentsInPanier) {
				NodeRef contentInPanierNodeRef = assoc.getTargetRef();
				String contentInPanierName = (String) nodeService.getProperty(contentInPanierNodeRef, ContentModel.PROP_NAME); 
				if (nodeRef.equals(contentInPanierNodeRef) || (contentToAddName.equals(contentInPanierName))) {
					throw new FileExistsException(panierNodeRef, contentToAddName);
					
				}
			}
			if (!found){
				listResults.add(nodeRef);
			}
				
		}
		return listResults;
	}

	
	/**
	 * Retrieve panier.
	 *
	 * @param user the user
	 * @return the node ref
	 */
	private NodeRef retrievePanier(NodeRef user){
		LOGGER.debug("Retrieve panier for the user "+user.toString());
		Set<QName> panierTypeQNames = new HashSet<QName>();
		panierTypeQNames.add(SmilePanierModel.TYPE_PANIER);
		List<ChildAssociationRef> panierAssocsRef = nodeService.getChildAssocs(user,panierTypeQNames);
								
		if (panierAssocsRef == null || panierAssocsRef.size() == 0){
			LOGGER.debug("Panier for the user "+user.toString()+ " not created yet.");
			return createPanier(user);
		}
			
		return panierAssocsRef.get(0).getChildRef();
	}

	/* (non-Javadoc)
	 * @see fr.smile.alfresco.module.panier.service.SmilePanierService#createPanier(org.alfresco.service.cmr.repository.NodeRef)
	 */
	public NodeRef createPanier(NodeRef user){
		LOGGER.debug("CreatePanier for user "+user.toString());			
		ChildAssociationRef childAssoc = nodeService.createNode(user, SmilePanierModel.ASSOC_MON_PANIER, QName.createQName("Panier"+new Date().getTime()), SmilePanierModel.TYPE_PANIER);
							
		return childAssoc.getChildRef();
	}

	



	/* (non-Javadoc)
	 * @see fr.smile.alfresco.module.panier.service.SmilePanierService#copyBasketToNodeRef(java.lang.String, org.alfresco.service.cmr.repository.NodeRef)
	 */
	@Override
	public void copyBasketToNodeRef(String destNode, NodeRef userNode){
		LOGGER.debug("Copy panier of the user "+userNode.toString()+" to node "+destNode);
		List<NodeRef> filesNodeRef = this.getSelection(userNode);
		NodeRef desNodeRef = new NodeRef(destNode);
		
		
			for (NodeRef fileNodeRef : filesNodeRef)
			{				
				copyService.copyAndRename(fileNodeRef,desNodeRef, ContentModel.ASSOC_CONTAINS, null, false);				
			}				
	}

}

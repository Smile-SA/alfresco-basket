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
package fr.smile.alfresco.module.panier.script;

import java.util.ArrayList;
import java.util.List;

import org.alfresco.jlan.server.filesys.FileExistsException;
import fr.smile.alfresco.module.panier.service.SmilePanierService;
import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.scripts.ScriptException;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.NodeRef;


/**
 * The Class SmilePanierServiceScript.
 */
public class SmilePanierServiceScript extends BaseScopableProcessorExtension{

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -836484822370748243L;
	
	/** The smile panier service. */
	private SmilePanierService smilePanierService;
	
	/** The service registry. */
	private ServiceRegistry serviceRegistry;
	
	/**
	 * Gets the smile panier service.
	 *
	 * @return the smile panier service
	 */
	public SmilePanierService getSmilePanierService() {
		return smilePanierService;
	}

	/**
	 * Sets the smile panier service.
	 *
	 * @param smilePanierService the new smile panier service
	 */
	public void setSmilePanierService(SmilePanierService smilePanierService) {
		this.smilePanierService = smilePanierService;
	}

	/**
	 * Gets the service registry.
	 *
	 * @return the service registry
	 */
	public ServiceRegistry getServiceRegistry() {
		return serviceRegistry;
	}

	/**
	 * Sets the service registry.
	 *
	 * @param serviceRegistry the new service registry
	 */
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}
	
	/**
	 * Adds the documents to selection.
	 *
	 * @param list the list
	 * @param user the user
	 * @return true, if successful
	 */
	public boolean addDocumentsToSelection(String[] list, NodeRef user){
		List<NodeRef> listNodeRef = new ArrayList<NodeRef>(list.length);
		for(String s : list){
			listNodeRef.add(new NodeRef(s));
		}
		try {
			smilePanierService.addToSelection(listNodeRef, user);
		} catch (FileExistsException e) {			
			throw new ScriptException("Can't add documents because one of these files already exists in your panier", e);
		}
		return true;
	}
	
	
	/**
	 * Adds the document to selection.
	 *
	 * @param strNodeRef the str node ref
	 * @param user the user
	 * @return true, if successful
	 */
	public boolean addDocumentToSelection(String strNodeRef, NodeRef user){
		try {
			smilePanierService.addToSelection(new NodeRef(strNodeRef), user);
		} catch (FileExistsException e) {		
			throw new ScriptException("Can't add document because the file already exists in your panier", e);
		}
		return true;
	}
	
	/**
	 * Removes the document from selection.
	 *
	 * @param nodeRef the node ref
	 * @param user the user
	 */
	public void removeDocumentFromSelection(NodeRef nodeRef, NodeRef user){
		smilePanierService.removeFromSelection(nodeRef, user);
	}
	
	/**
	 * Removes the documents from selection.
	 *
	 * @param list the list
	 * @param user the user
	 */
	public void removeDocumentsFromSelection(String[] list, NodeRef user){
		List<NodeRef> listNodeRef = new ArrayList<NodeRef>(list.length);
		for(String s : list){
			listNodeRef.add(new NodeRef(s));
		}
		smilePanierService.removeFromSelection(listNodeRef, user);
	}
	
	/**
	 * Gets the selection.
	 *
	 * @param user the user
	 * @return the selection
	 */
	public ScriptNode[] getSelection(NodeRef user){
		List<NodeRef> list = smilePanierService.getSelection(user);
		ScriptNode[] listNode = new ScriptNode[list.size()];
		for(int i = 0 ; i < list.size(); i++){
			FileInfo fileInfo = serviceRegistry.getFileFolderService().getFileInfo(list.get(i));
			listNode[i] = new ScriptNode(fileInfo, serviceRegistry, this.getScope());
		}
		return listNode;
	}
	
	/**
	 * Reset selection.
	 *
	 * @param user the user
	 */
	public void resetSelection(NodeRef user){

	}

	/**
	 * Copy basket to node ref.
	 *
	 * @param destNode the dest node
	 * @param userNode the user node
	 */
	public void copyBasketToNodeRef(String destNode, NodeRef userNode)
	{
		try {
			smilePanierService.copyBasketToNodeRef(destNode, userNode);
		} catch (FileExistsException e) {			
			throw new ScriptException("Can't copy basket in folder", e);
		}
	}

}
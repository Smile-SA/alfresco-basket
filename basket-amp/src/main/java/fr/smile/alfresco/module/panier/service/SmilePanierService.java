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

import java.util.Collection;
import java.util.List;

import org.alfresco.jlan.server.filesys.FileExistsException;
import org.alfresco.service.cmr.repository.NodeRef;

/**
 * Service that carries the selection list of the users to export the selection
 * @author mapor
 *
 */
 public interface SmilePanierService {
	/**
	 * Add elements to selection
	 * Note that the type of the element is not checked here, it's only checked on the export.
	 * @param list
	 * @param user
	 * @
	 */
	void addToSelection(Collection<NodeRef> list, NodeRef user)throws FileExistsException;
	/**
	 * Add elements to selection
	 * Note that the type of the element is not checked here, it's only checked on the export.
	 * @param nodeRef
	 * @param user
	 * @
	 */
	 void addToSelection(NodeRef nodeRef, NodeRef user) throws FileExistsException;
	 void removeFromSelection(NodeRef nodeRef, NodeRef user);
	 void removeFromSelection(List<NodeRef> list, NodeRef user);
	/**
	 * Initialise the metadata(s) need for the export service.
	 * @param user
	 * @return
	 * @
	 * @see SmilePanierModel
	 */
	 NodeRef createPanier(NodeRef user);
	/**
	 * Read the list of choosen file by the user.
	 * @param user
	 * @return
	 * @
	 */
	 List<NodeRef> getSelection(NodeRef user);
	 void resetSelection(NodeRef user);	
	
	 void copyBasketToNodeRef(String destNode, NodeRef userNode) throws FileExistsException;
}
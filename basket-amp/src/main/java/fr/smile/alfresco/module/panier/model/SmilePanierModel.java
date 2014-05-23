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
package fr.smile.alfresco.module.panier.model;

import org.alfresco.service.namespace.QName;

public interface SmilePanierModel {
    String SMILE_PANIER_MODEL_URI            = "http://www.smile.fr/model/panier/1.0";
    String SMILE_PANIER_MODEL_PREFIX         = "panier";
    QName  TYPE_PANIER			   = QName.createQName(SMILE_PANIER_MODEL_URI, "list");
    QName  ASSOCIATION_EXPORT_ELEMENT   = QName.createQName(SMILE_PANIER_MODEL_URI, "elements");
    QName ASPECT_PANIER_ATTACHMENT = QName.createQName(SMILE_PANIER_MODEL_URI, "panierAttachmentAspect");
    QName ASSOC_MON_PANIER  = QName.createQName(SMILE_PANIER_MODEL_URI, "monPanier");
    



}
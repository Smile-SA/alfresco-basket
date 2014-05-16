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
package fr.smile.alfresco.module.panier.scripts;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.Deflater;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletResponse;

import org.alfresco.model.ContentModel;
import fr.smile.alfresco.module.panier.service.SmilePanierService;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.MimetypeService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import com.ibm.icu.text.Normalizer;




// TODO: Auto-generated Javadoc
/**
 * The Class SmilePanierExportZipWebScript.
 */
public class SmilePanierExportZipWebScript extends AbstractWebScript {

	/** The services. */
	private ServiceRegistry services;
	
	/**
	 * Sets the services.
	 *
	 * @param services the new services
	 */
	public void setServices(ServiceRegistry services) {
		this.services = services;
	}
	
	/** The smile panier service. */
	private SmilePanierService smilePanierService;
	
	
	/**
	 * Sets the smile panier service.
	 *
	 * @param smilePanierService the new smile panier service
	 */
	public void setSmilePanierService(SmilePanierService smilePanierService) {
		this.smilePanierService = smilePanierService;
	}
	
	
	/** The logger. */
	private static Log logger = LogFactory.getLog(SmilePanierExportZipWebScript.class);
	
	/* (non-Javadoc)
	 * @see org.springframework.extensions.webscripts.WebScript#execute(org.springframework.extensions.webscripts.WebScriptRequest, org.springframework.extensions.webscripts.WebScriptResponse)
	 */
	@Override
	public void execute(WebScriptRequest request, WebScriptResponse res)
			throws IOException {
		
		String userName = AuthenticationUtil.getFullyAuthenticatedUser();
		
		PersonService personService = services.getPersonService();
		
		NodeRef userNodeRef = personService.getPerson(userName);
				
		MimetypeService mimetypeService = services.getMimetypeService();
		FileFolderService fileFolderService = services.getFileFolderService();
		
		Charset archiveEncoding = Charset.forName("ISO-8859-1");
				
		String encoding = request.getParameter("encoding");
		
		if(StringUtils.isNotEmpty(encoding)){
			archiveEncoding = Charset.forName(encoding);
		}
	
		ZipOutputStream fileZip = new ZipOutputStream(res.getOutputStream(),archiveEncoding);
		String folderName = "mon_panier";
		try {

			String zipFileExtension = "."+mimetypeService.getExtension(MimetypeMap.MIMETYPE_ZIP);
			
			res.setContentType(MimetypeMap.MIMETYPE_ZIP);
			
			res.setHeader("Content-Transfer-Encoding", "binary");
			res.addHeader("Content-Disposition", "attachment;filename=\"" + normalizeZipFileName(folderName) + zipFileExtension + "\"");

			res.setHeader("Cache-Control", "must-revalidate, post-check=0, pre-check=0");
			res.setHeader("Pragma", "public");
			res.setHeader("Expires", "0");
			
			
			fileZip.setMethod(ZipOutputStream.DEFLATED);
			fileZip.setLevel(Deflater.BEST_COMPRESSION);
			
			String archiveRootPath = folderName + "/";
	        
			
			List<NodeRef> list = smilePanierService.getSelection(userNodeRef);
			List<FileInfo> filesInfos = new ArrayList<FileInfo>();
			for (int i = 0; i < list.size(); i++) {
				FileInfo fileInfo = fileFolderService.getFileInfo(list.get(i));
				filesInfos.add(fileInfo);
			}
						
			for(FileInfo file : filesInfos){
				addEntry(file, fileZip,archiveRootPath);
			}
			fileZip.closeEntry();
			
		} catch (Exception e) {
			throw new WebScriptException(HttpServletResponse.SC_BAD_REQUEST, "Erreur exportation Zip",e);
		}
		finally{
			fileZip.close();
		}

	}
	
	/**
	 * Adds the entry.
	 *
	 * @param content the content
	 * @param zipOutputStream the zip output stream
	 * @param path the path
	 */
	private void addEntry(FileInfo content,ZipOutputStream zipOutputStream,String path){
		try {			
			DictionaryService dictionaryService = services.getDictionaryService();
			ContentService contentService = services.getContentService();
			FileFolderService fileFolderService = services.getFileFolderService();
			
			String calculatePath = path;
			
			QName typeContent = content.getType();
			String inContentName = content.getName();
			NodeRef inContentNodeRef = content.getNodeRef();
			
			
			 
			logger.debug("Add entrry: " + inContentName);
			
			if(dictionaryService.isSubClass(typeContent, ContentModel.TYPE_CONTENT)){				
				logger.debug("Entry: " + inContentName + " is a content");
				
				calculatePath = calculatePath+inContentName;
				
				logger.debug("calculatePath : " +calculatePath);
				
				ZipEntry e = new ZipEntry(calculatePath);
				
				
				
				zipOutputStream.putNextEntry(e);				
				ContentReader inFileReader = contentService.getReader(inContentNodeRef, ContentModel.PROP_CONTENT);				
				
				if(inFileReader !=null){
				
		        InputStream in =  inFileReader.getContentInputStream();
		        
		        final int initSize = 1024;
		        
		        byte buffer[] = new byte[initSize];
				while (true) {
					int readBytes = in.read(buffer, 0, buffer.length);
					if (readBytes <= 0) {
						break;
					}

					zipOutputStream.write(buffer, 0, readBytes);
				}
		        
				in.close();
		        zipOutputStream.closeEntry();
				}
				else{
					logger.warn("Error during read content of file " +inContentName);
				}
		        
		       
			}
			else if(dictionaryService.isSubClass(typeContent, ContentModel.TYPE_FOLDER)){
				logger.debug("Entry: " + inContentName + " is a content");
				
				calculatePath = calculatePath+inContentName+"/";
								
				
				logger.debug("calculatePath : " +calculatePath);
				
				List<FileInfo> files = fileFolderService.list(inContentNodeRef);
				
				if(files.size() == 0){
					ZipEntry e = new ZipEntry(calculatePath);
					zipOutputStream.putNextEntry(e);
					
				}
				else{
					for(FileInfo file : files){
						addEntry(file,zipOutputStream,calculatePath);
					}
				}				
				
			}
		} catch (Exception e) {
			throw new WebScriptException(HttpServletResponse.SC_BAD_REQUEST, "Erreur exportation Zip : "+e.getMessage(),e);
		}
		
	}
	
	/**
	 * ZipEntry() does not convert filenames from Unicode to platform (waiting
	 * Java 7) http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4244499
	 *
	 * @param filename the filename
	 * @return the string
	 */
	private String normalizeZipFileName(String filename){
		return Normalizer.normalize(filename, Normalizer.NFD).replaceAll("[^\\p{ASCII}]", "");
	}
}

package fr.smile.alfresco.module.panier.service;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.junit.Assert;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import static org.junit.Assert.assertNotNull;

/**
 * @author Alexis Thaveau on 08/04/14.
 *//*
@RunWith(RemoteTestRunner.class)
@Remote(runnerClass=SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:alfresco/application-context.xml")*/
public class SmilePanierServiceImplTest extends  BaseTest{

    @Autowired
    @Qualifier("NodeService")
    protected NodeService nodeService;
    @Autowired
    @Qualifier("smilePanierService")
    SmilePanierService smilePanierService;

    @Autowired
    @Qualifier("personService")
    PersonService personService;

    @Test
    public void testWiring() {
        assertNotNull(nodeService);
        assertNotNull(smilePanierService);
    }
    @Test
    public void testGet() {
        NodeRef userNodeRef = personService.getPerson("admin");
        Assert.assertNotNull(smilePanierService.getSelection(userNodeRef));
    }

}

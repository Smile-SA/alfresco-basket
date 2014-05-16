package fr.smile.alfresco.module.panier.service;

import com.tradeshift.test.remote.Remote;
import com.tradeshift.test.remote.RemoteTestRunner;
import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.person.UserNameMatcherImpl;
import org.alfresco.repo.transaction.AlfrescoTransactionSupport;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.transaction.TransactionService;
import org.junit.After;
import org.junit.Before;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.transaction.Status;
import javax.transaction.UserTransaction;

/**
 * @author Alexis Thaveau on 08/04/14.
 */
@RunWith(RemoteTestRunner.class)
@Remote(runnerClass=SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:alfresco/application-context.xml")
public abstract class BaseTest {


    @Autowired
    @Qualifier("TransactionService")
    protected TransactionService transactionService;

    @Autowired
    @Qualifier("PersonService")
    protected PersonService personService;

    @Autowired
    @Qualifier("userNameMatcher")
    protected UserNameMatcherImpl userNameMatcher;

    @Autowired
    @Qualifier("NodeService")
    protected NodeService nodeService;
    UserTransaction testTX;
    NodeRef rootNodeRef;


    @Before
    public void setUp() throws Exception {
        AuthenticationUtil.setFullyAuthenticatedUser(AuthenticationUtil.getSystemUserName());

        if (AlfrescoTransactionSupport.getTransactionReadState() != AlfrescoTransactionSupport.TxnReadState.TXN_NONE) {
            throw new AlfrescoRuntimeException(
                    "A previous tests did not clean up transaction: " +
                            AlfrescoTransactionSupport.getTransactionId());
        }


        testTX = transactionService.getUserTransaction();
        testTX.begin();

        StoreRef storeRef = nodeService.createStore(StoreRef.PROTOCOL_WORKSPACE, "Test_" + System.currentTimeMillis());
        rootNodeRef = nodeService.getRootNode(storeRef);

        testTX.commit();
        testTX = transactionService.getUserTransaction();
        testTX.begin();

        //AuthenticationUtil.setFullyAuthenticatedUser("admin");
    }

    @After
    public void tearDown() throws Exception
    {

        userNameMatcher.setUserNamesAreCaseSensitive(false); // Put back the default

        if ((testTX.getStatus() == Status.STATUS_ACTIVE) || (testTX.getStatus() == Status.STATUS_MARKED_ROLLBACK))
        {
            testTX.rollback();
        }
        AuthenticationUtil.clearCurrentSecurityContext();
    }


}

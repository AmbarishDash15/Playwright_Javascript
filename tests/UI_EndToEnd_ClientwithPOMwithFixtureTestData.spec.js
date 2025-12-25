//const {test, expect} = require('@playwright/test');
const {customTest} = require('../testdata/UI_EndToEnd_Client-TestDataFixture');
const {PageObjectManager} = require('../pageObjects/PageObjectManager');

customTest('End to End Client App with POM and Fixture Data @UI',async({page, testDataForOrder}) => {
    const pageObjectManager = new PageObjectManager(page);//Initiate Page Object Manager
    
    //Navigate to Login page and perform valid login
    const loginPage = await pageObjectManager.getLoginPage();
    await loginPage.openApplicationUrl(testDataForOrder.appUrl); 
    await loginPage.validLogin(testDataForOrder.loginEmail,testDataForOrder.password); 
    
    //Search for item and add to cart
    const dashboardPage = await pageObjectManager.getDashboardPage();
    await dashboardPage.selectItemAndAddToCart(testDataForOrder.itemToBuy);
    await dashboardPage.verifyAddedToCartMsg();
    await dashboardPage.goToCart();
    
    //Verify item on Cart page and checkout
    const cartPage = await pageObjectManager.getCartPage();
    await cartPage.verifyProductAddedToCart(testDataForOrder.itemToBuy);
    await cartPage.clickCheckOut();
    
    //Enter details on Check out page and Checkout
    const checkOutPage = await pageObjectManager.getCheckOutPage();
    await checkOutPage.clearAndEnterCCNo(testDataForOrder.ccNo);
    await checkOutPage.selectExpMonthYear(testDataForOrder.ccExpMonth,testDataForOrder.ccExpYear);
    await checkOutPage.enterCVVField(testDataForOrder.ccCVV);
    await checkOutPage.enterNameonCCField(testDataForOrder.ccNameOnCard);
    await checkOutPage.verifyEmailIDPopulated(testDataForOrder.loginEmail);
    await checkOutPage.selectCountry(testDataForOrder.country); //involves type ahead combobox
    await checkOutPage.applyCoupon(testDataForOrder.couponToApply); //apply and verify successful coupon
    await checkOutPage.clickPlaceOrderBtn();

    //Verify order confirmation and grab the ORDER ID
    const orderConfirmationPage = await pageObjectManager.getOrderConfirmationPage();
    await orderConfirmationPage.verifyDetailsOnConfirmationPage(testDataForOrder.itemToBuy);
    const orderID = await orderConfirmationPage.getOrderIDFromConfPage();

    //Go to Orders page
    await dashboardPage.goToOrders();

    //Search for Order Id in Orders page and go to Order details
    const ordersPage = await pageObjectManager.getOrdersPage();
    await ordersPage.verifyOrdersPageLabel();
    await ordersPage.clickViewOrderButton(orderID);
    
    //verify order id and other details on Order details page
    const orderDetailsPage = await pageObjectManager.getOrderDetailsPage();
    await orderDetailsPage.verifyOrderDetails(orderID, testDataForOrder.loginEmail, testDataForOrder.country, testDataForOrder.itemToBuy);
})
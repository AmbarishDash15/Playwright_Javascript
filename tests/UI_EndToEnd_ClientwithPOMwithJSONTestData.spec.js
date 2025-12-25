const {test, expect} = require('@playwright/test');
const {PageObjectManager} = require('../pageObjects/PageObjectManager');
const testData = JSON.parse(JSON.stringify(require('../testdata/UI_EndToEnd_Client-TestDataSingleSet.json')))

test('End to End Client App with POM with JSON Test Data @UI',async({page}) => {
    const pageObjectManager = new PageObjectManager(page);//Initiate Page Object Manager
    
    //Navigate to Login page and perform valid login
    const loginPage = await pageObjectManager.getLoginPage();
    await loginPage.openApplicationUrl(testData.appUrl); 
    await loginPage.validLogin(testData.loginEmail,testData.password); 
    
    //Search for item and add to cart
    const dashboardPage = await pageObjectManager.getDashboardPage();
    await dashboardPage.selectItemAndAddToCart(testData.itemToBuy);
    await dashboardPage.verifyAddedToCartMsg();
    await dashboardPage.goToCart();
    
    //Verify item on Cart page and checkout
    const cartPage = await pageObjectManager.getCartPage();
    await cartPage.verifyProductAddedToCart(testData.itemToBuy);
    await cartPage.clickCheckOut();
    
    //Enter details on Check out page and Checkout
    const checkOutPage = await pageObjectManager.getCheckOutPage();
    await checkOutPage.clearAndEnterCCNo(testData.ccNo);
    await checkOutPage.selectExpMonthYear(testData.ccExpMonth,testData.ccExpYear);
    await checkOutPage.enterCVVField(testData.ccCVV);
    await checkOutPage.enterNameonCCField(testData.ccNameOnCard);
    await checkOutPage.verifyEmailIDPopulated(testData.loginEmail);
    await checkOutPage.selectCountry(testData.country); //involves type ahead combobox
    await checkOutPage.applyCoupon(testData.couponToApply); //apply and verify successful coupon
    await checkOutPage.clickPlaceOrderBtn();

    //Verify order confirmation and grab the ORDER ID
    const orderConfirmationPage = await pageObjectManager.getOrderConfirmationPage();
    await orderConfirmationPage.verifyDetailsOnConfirmationPage(testData.itemToBuy);
    const orderID = await orderConfirmationPage.getOrderIDFromConfPage();

    //Go to Orders page
    await dashboardPage.goToOrders();

    //Search for Order Id in Orders page and go to Order details
    const ordersPage = await pageObjectManager.getOrdersPage();
    await ordersPage.verifyOrdersPageLabel();
    await ordersPage.clickViewOrderButton(orderID);
    
    //verify order id and other details on Order details page
    const orderDetailsPage = await pageObjectManager.getOrderDetailsPage();
    await orderDetailsPage.verifyOrderDetails(orderID, testData.loginEmail, testData.country, testData.itemToBuy);
})
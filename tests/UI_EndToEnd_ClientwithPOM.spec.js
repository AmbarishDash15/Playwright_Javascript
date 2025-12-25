const {test, expect} = require('@playwright/test');
const {PageObjectManager} = require('../pageObjects/PageObjectManager');

test('End to End Client App with POM @UI',async({page}) => {
    const appUrl = 'https://rahulshettyacademy.com/client'; //test data
    const loginEmail = 'dash.ambarish15+sixth@gmail.com'; //test data
    const password = 'Password@123'; //test data
    const itemToBuy = 'ZARA COAT 3'; //testdata
    const ccNo = '4242424242424242'; //testdata
    const ccExpMonth = '12'; //testdata
    const ccExpYear = '30'; //testdata
    const ccCVV = '123'; //testdata
    const ccNameOnCard = 'Tester'; //testdata
    const couponToApply = 'rahulshettyacademy'; //testdata
    const country = 'India'; //testdata

    const pageObjectManager = new PageObjectManager(page);//Initiate Page Object Manager
    
    //Navigate to Login page and perform valid login
    const loginPage = await pageObjectManager.getLoginPage();
    await loginPage.openApplicationUrl(appUrl); 
    await loginPage.validLogin(loginEmail,password); 
    
    //Search for item and add to cart
    const dashboardPage = await pageObjectManager.getDashboardPage();
    await dashboardPage.selectItemAndAddToCart(itemToBuy);
    await dashboardPage.verifyAddedToCartMsg();
    await dashboardPage.goToCart();
    
    //Verify item on Cart page and checkout
    const cartPage = await pageObjectManager.getCartPage();
    await cartPage.verifyProductAddedToCart(itemToBuy);
    await cartPage.clickCheckOut();
    
    //Enter details on Check out page and Checkout
    const checkOutPage = await pageObjectManager.getCheckOutPage();
    await checkOutPage.clearAndEnterCCNo(ccNo);
    await checkOutPage.selectExpMonthYear(ccExpMonth,ccExpYear);
    await checkOutPage.enterCVVField(ccCVV);
    await checkOutPage.enterNameonCCField(ccNameOnCard);
    await checkOutPage.verifyEmailIDPopulated(loginEmail);
    await checkOutPage.selectCountry(country); //involves type ahead combobox
    await checkOutPage.applyCoupon(couponToApply); //apply and verify successful coupon
    await checkOutPage.clickPlaceOrderBtn();

    //Verify order confirmation and grab the ORDER ID
    const orderConfirmationPage = await pageObjectManager.getOrderConfirmationPage();
    await orderConfirmationPage.verifyDetailsOnConfirmationPage(itemToBuy);
    const orderID = await orderConfirmationPage.getOrderIDFromConfPage();

    //Go to Orders page
    await dashboardPage.goToOrders();

    //Search for Order Id in Orders page and go to Order details
    const ordersPage = await pageObjectManager.getOrdersPage();
    await ordersPage.verifyOrdersPageLabel();
    await ordersPage.clickViewOrderButton(orderID);
    
    //verify order id and other details on Order details page
    const orderDetailsPage = await pageObjectManager.getOrderDetailsPage();
    await orderDetailsPage.verifyOrderDetails(orderID, loginEmail, country, itemToBuy);
})
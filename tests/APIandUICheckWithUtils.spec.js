const{test, expect, request} = require('@playwright/test');
const{APIUtils} = require('../utils/APIUtils');
const loginEmail = 'dash.ambarish15+first@gmail.com';
const countryToSelect = 'India';
const loginPayload = {userEmail:loginEmail,userPassword:'Password@123'};
const orderPayLoad = {orders:[{country:countryToSelect,productOrderedId:'68a961459320a140fe1ca57a'}]};
var utilsAPIResponse;

test.beforeAll(async() => {
    const APIContext = await request.newContext();
    const apiUtils = new APIUtils(APIContext, loginPayload);
    utilsAPIResponse = await apiUtils.createOrder(orderPayLoad);
})

test('API and UI validation using util @APInUI',async ({page}) => {
    const itemToBuy = 'ZARA COAT 3';
    await page.addInitScript(value => {
        window.localStorage.setItem('token',value);
    },utilsAPIResponse.token);
    const orderID = utilsAPIResponse.orderID;
    //Go to application and order page
    await page.goto('https://rahulshettyacademy.com/client');
    const ordersBtn = page.locator('button[routerlink*="/myorders"]');
    await ordersBtn.click();
    await page.waitForLoadState('networkidle');
    expect(await page.locator('h1.ng-star-inserted').textContent()).toContain('Your Orders');
    const orderRows = page.locator('tr.ng-star-inserted');
    const orderCount = await orderRows.count();
    //Search for orders based on ORDER ID in table and click on Order details
    for (var i = 0;i<=orderCount;i++){
        if(await orderRows.nth(i).locator('th').textContent() === orderID){
            orderRows.nth(i).locator('button.btn-primary').click();
            break;
        }
    }

    //verify order id on order details page

    const orderSummaryLabel = page.locator('div.email-title');
    const orderSummOrderID = page.locator('div.col-text');
    const deliveryAddress = page.locator('div.address').last();
    const orderSummItemName = page.locator('div.title');
    await page.waitForLoadState('networkidle');
    expect(await orderSummaryLabel.textContent()).toContain('order summary');
    expect(await orderSummOrderID.textContent()).toContain(orderID);
    expect(await deliveryAddress.locator('p.text').first().textContent()).toContain(loginEmail);
    expect(await deliveryAddress.locator('p.text').last().textContent()).toContain(countryToSelect);
    expect(await orderSummItemName.textContent()).toContain(itemToBuy);
})

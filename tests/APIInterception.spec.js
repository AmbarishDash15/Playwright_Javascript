const {test, expect, request} = require('@playwright/test');
const {APIUtils} = require('../utils/APIUtils');
const loginPayload = {userEmail:'dash.ambarish15@gmail.com',userPassword:'Password@123'};
const emptyOrderListRespone = {data:[],message:'No Orders'};
var token;

test.beforeEach( async() => {
    const APIContext = await request.newContext();
    const apiUtils = new APIUtils(APIContext, loginPayload);
    token = await apiUtils.getToken();
})

test('Check empty order message @APInUI', async({page}) => {
    await page.addInitScript(value => {
        window.localStorage.setItem('token',value);
    },token);
    await page.goto('https://rahulshettyacademy.com/client');
    const homeBtn = page.locator('i.fa-home');
    const ordersBtn = page.locator('button[routerlink*="/myorders"]');
    const orderPageEmptyMsgLoc = page.locator('div.mt-4');
    const yourOrdersLabel = page.locator('h1:has-text("Your Orders")');
    await ordersBtn.click();
    await expect(yourOrdersLabel).toBeVisible();
    await homeBtn.click();
    await page.route('https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*', async route => {
        const response = await page.request.fetch(route.request());
        let body = JSON.stringify(emptyOrderListRespone);
        route.fulfill ({
            response,
            body
        })
    })
    await ordersBtn.click();
    await page.waitForResponse('https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*');
    expect(await orderPageEmptyMsgLoc.textContent()).toContain('You have No Orders');
    await expect(yourOrdersLabel).toBeHidden();
})

test('Verify unauthorized error message for incorrect order @APInUI', async({page}) => {
    await page.addInitScript(value => {
        window.localStorage.setItem('token',value);
    },token);
    await page.goto('https://rahulshettyacademy.com/client');
    const ordersBtn = page.locator('button[routerlink*="/myorders"]');
    const unauthErrorLabel = page.locator('p.blink_me');
    await page.route('https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=*', route => {
        route.continue({url: 'https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=621661f884b053f6765465b6'})
    })
    await ordersBtn.click();
    await page.locator("button:has-text('View')").first().click();
    expect(await unauthErrorLabel.textContent()).toBe('You are not authorize to view this order');
})

test('Verify abort calls @APInUI',async({page})=> {
    await page.addInitScript(value => {
        window.localStorage.setItem('token',value);
    },token);
    await page.goto('https://rahulshettyacademy.com/client');
    const ordersBtn = page.locator('button[routerlink*="/myorders"]');
    const yourOrdersLabel = page.locator('h1:has-text("Your Orders")');
    await page.route('https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=*',route => {
        route.abort();
    })
    await ordersBtn.click();
    await page.locator("button:has-text('View')").first().click();
    await expect(yourOrdersLabel).toBeHidden();
})

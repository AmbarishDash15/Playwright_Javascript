const {test,expect,request} = require('@playwright/test');
test.describe.configure({mode: 'serial'})
const loginEmail = 'dash.ambarish15+api@gmail.com';
const loginPayload = {userEmail:loginEmail,userPassword:'Password@123'};
const countryToSelect = 'India';
const orderPayLoad = {orders:[{country:countryToSelect,productOrderedId:'68a961459320a140fe1ca57a'}]};
var token;
var orderID;

test.beforeEach(async() => {
    const APIContext = await request.newContext();
    const APIResponse = await APIContext.post('https://rahulshettyacademy.com/api/ecom/auth/login',{data: loginPayload});
    expect(APIResponse.ok()).toBeTruthy();
    const loginResponseJson = await APIResponse.json();
    token = loginResponseJson.token;
})

test('End to End using API Login @APInUI', async({page}) => {
    const itemToBuy = 'ADIDAS ORIGINAL';
    await page.addInitScript(value => {
        window.localStorage.setItem('token',value);
    },token);
    await page.goto('https://rahulshettyacademy.com/client');
    const itemNameList = page.locator('div.card-body');
    const cartButton = page.locator('button[routerlink*="cart"]');
    const checkOutBtn = page.locator('li.totalRow button');
    const cartItem = page.locator('div li');
    const cartItemName = page.locator('div.cartSection h3');
    const itemCount = await itemNameList.count();
    for(var i = 0;i < itemCount;i++){
        if(await itemNameList.nth(i).locator('b').textContent() === itemToBuy){
            await itemNameList.nth(i).locator('button.w-10').click();
            await expect(page.getByText('Product Added To Cart')).toBeVisible(); //verify success message on screen
            break;
        }
    }
    //verify added item on cart page
    await page.getByText('Product Added To Cart').waitFor({state:'hidden'});
    await cartButton.click();
    await page.waitForLoadState('networkidle');
    await cartItem.first().waitFor();
    await expect(cartItemName).toContainText(itemToBuy);

    //go to check out page and fill details
    const creditCardNoField = page.locator('div.form__cc input').first();
    const expDateMonth = page.locator('select.input').first();
    const expDateYear = page.locator('select.input').last();
    const cvvField = page.locator('div.form__cc input').nth(1);
    const nameOnCardField = page.locator('div.form__cc input').nth(2);
    const applyCouponField = page.locator('div.form__cc input').last();
    const applyCouponBtn = page.locator('button.btn-primary');
    const emailFieldChkOut = page.locator('input.text-validated.ng-untouched');
    const countryInputField = page.locator('[placeholder*="Country"]');
    const countryList = page.locator('section.ta-results');
    const countryListItem = page.locator('span.ng-star-inserted');
    const placeOrderBtn = page.locator('.action__submit');
    const ccNo = '4242424242424242';
    const ccExpMonth = '12';
    const ccExpYear = '30';
    const ccCVV = '123';
    const ccNameOnCard = 'Tester';
    const couponToApply = 'rahulshettyacademy';

    await checkOutBtn.click();
    await creditCardNoField.clear();
    await creditCardNoField.fill(ccNo);
    await expDateMonth.selectOption(ccExpMonth)
    await expDateYear.selectOption(ccExpYear);
    await cvvField.fill(ccCVV);
    await nameOnCardField.fill(ccNameOnCard);
    expect(await emailFieldChkOut.inputValue()).toBe(loginEmail);

    //interacting with type-ahead combobox
    await countryInputField.pressSequentially(countryToSelect,{delay: 100}); 
    await countryList.waitFor({state : 'visible'});
    await countryListItem.last().waitFor({state : 'visible'});
    const countryCount = await countryListItem.count();
    for(var i = 0;i < countryCount;i++){
        const countryName = await countryListItem.nth(i).textContent();
        if(countryName.trim() === countryToSelect){
            await countryListItem.nth(i).click();
            break;
        }
    }
    await applyCouponField.fill(couponToApply);
    await applyCouponBtn.click();
    await expect(page.locator('[style*="green"]')).toBeVisible();

    //Place order, verify confirmation and grab the ORDER ID
    const orderConfirmationLabel = page.locator('h1.hero-primary');
    const orderIDField = page.locator('label.ng-star-inserted');
    const prodNameConfPage = page.locator('td.m-3 div.title');
    await placeOrderBtn.click();
    await orderConfirmationLabel.waitFor({state:'visible'});
    await expect(orderConfirmationLabel).toContainText('Thankyou for the order');
    const orderIDFull = await orderIDField.textContent();
    const orderID = orderIDFull.trim().split(' ')[1];
    const ordersBtn = page.locator('button[routerlink*="/myorders"]');
    await expect( prodNameConfPage).toHaveText(itemToBuy);

    //Go to Orders page and verify order
    await ordersBtn.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1.ng-star-inserted')).toContainText('Your Orders');
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
    await orderSummaryLabel.waitFor({state: 'visible'});
    await expect(orderSummaryLabel).toContainText('order summary');
    expect(await orderSummOrderID.textContent()).toContain(orderID);
    expect(await deliveryAddress.locator('p.text').first().textContent()).toContain(loginEmail);
    expect(await deliveryAddress.locator('p.text').last().textContent()).toContain(countryToSelect);
    expect(await orderSummItemName.textContent()).toContain(itemToBuy);
})

test('Login and Order with API and order UI Validation @APInUI',async({page}) => {
    const itemToBuy = 'ZARA COAT 3';
    await page.addInitScript(value => {
        window.localStorage.setItem('token',value);
    },token);
    const APIContext = await request.newContext({ignoreHTTPSErrors: true});
    const APIOrderResponse = await APIContext.post('https://rahulshettyacademy.com/api/ecom/order/create-order',
        {
            data: orderPayLoad,
            headers: {
                'Authorization' : token,
                'Content-Type' : 'application/json'
            }
        }
    )
    await expect(APIOrderResponse.ok).toBeTruthy();
    const orderResponseJson = await APIOrderResponse.json();
    orderID = orderResponseJson.orders[0];
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
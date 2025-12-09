const {test, expect} = require('@playwright/test')

test('End to End Client App',async({browser}) => {
    const itemToBuy = 'ADIDAS ORIGINAL';
    const loginEmail = 'dash.ambarish15@gmail.com';
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://rahulshettyacademy.com/client');
    await page.waitForLoadState('networkidle');
    const eMailField = page.locator('#userEmail');
    const passwordField = page.locator('#userPassword');
    const loginButton = page.locator('#login');
    const itemNameList = page.locator('div.card-body');
    const cartButton = page.locator('button.btn-custom i.fa-shopping-cart');
    const cartItemName = page.locator('div.cartSection h3');
    const checkOutBtn = page.locator('li.totalRow button');
    await eMailField.fill(loginEmail);
    await passwordField.fill('Password@123');
    await loginButton.click();
    await itemNameList.first().waitFor();
    const itemCount = await itemNameList.count();
    for(var i = 1;i <= itemCount;i++){
        if(await itemNameList.nth(i).locator('b').textContent() === itemToBuy){
            await itemNameList.nth(i).locator('button.w-10').click();
            await expect(page.getByText('Product Added To Cart')).toBeVisible();
            break;
        }
    }
    await cartButton.click();
    const cartItemBool = await page.locator('h3:has-text('+itemToBuy+')')
    expect(cartItemBool).toBeTruthy();
    await checkOutBtn.click();

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
    const country = 'India';

    await creditCardNoField.clear();
    await creditCardNoField.fill(ccNo);
    await expDateMonth.selectOption(ccExpMonth)
    await expDateYear.selectOption(ccExpYear);
    await cvvField.fill(ccCVV);
    await nameOnCardField.fill(ccNameOnCard);
    
    expect(await emailFieldChkOut.inputValue()).toBe(loginEmail);
    await countryInputField.pressSequentially(country,{delay: 100});
    await countryList.waitFor();
    const countryCount = await countryListItem.count();
    for(var i = 0;i < countryCount;i++){
        const countryName = await countryListItem.nth(i).textContent();
        if(countryName.trim() === country){
            await countryListItem.nth(i).click();
            break;
        }
    }

    await applyCouponField.fill(couponToApply);
    await applyCouponBtn.click();
    await expect(page.locator('[style*="green"]')).toBeVisible();
    await placeOrderBtn.click();
    await page.waitForLoadState('networkidle');
    const orderConfirmationLabel = page.locator('h1.hero-primary');
    const orderIDField = page.locator('label.ng-star-inserted');
    const prodNameConfPage = page.locator('td.m-3 div.title');
    expect(await orderConfirmationLabel.textContent()).toContain('Thankyou for the order');
    const orderIDFull = await orderIDField.textContent();
    const orderID = orderIDFull.trim().split(' ')[1];
    const ordersBtn = page.getByRole('button',{name: 'ORDERS'});
    //console.log(orderID);
    expect(await prodNameConfPage.textContent()).toBe(itemToBuy);
    await ordersBtn.click();
    await page.waitForLoadState('networkidle');
    expect(await page.locator('h1:has-text("Your Orders")')).toBeVisible();
    const orderRows = page.locator('tr.ng-star-inserted');
    const orderCount = await orderRows.count();
    for (var i = 0;i<=orderCount;i++){
        //console.log(await orderRows.nth(i).locator('th').textContent())
        if(await orderRows.nth(i).locator('th').textContent() === orderID){
            orderRows.nth(i).locator('button.btn-primary').click();
            break;
        }
    }

    const orderSummaryLabel = page.locator('div.email-title');
    const orderSummOrderID = page.locator('div.col-text');
    const deliveryAddress = page.locator('div.address').last();
    const orderSummItemName = page.locator('div.title');

    await page.waitForLoadState('networkidle');
    expect(await orderSummaryLabel.textContent()).toContain('order summary');
    //expect(await orderSummOrderID.textContent()).toBe(orderID);
    expect(await deliveryAddress.locator('p.text').first().textContent()).toContain(loginEmail);
    expect(await deliveryAddress.locator('p.text').last().textContent()).toContain(country);
    expect(await orderSummItemName.textContent()).toContain(itemToBuy);

















    //await page.pause();
})
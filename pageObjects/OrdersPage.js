const {expect} = require('@playwright/test');
class OrdersPage {
    constructor(page){
        this.page = page;
        this.yourOrdersLabel = this.page.locator('h1.ng-star-inserted');
        this.orderTable = this.page.locator('table tbody');
    }
    async verifyOrdersPageLabel(){
        await this.page.waitForLoadState('networkidle');
        await this.orderTable.waitFor({state: 'attached'});
        await expect(this.yourOrdersLabel).toContainText('Your Orders');
    }
    async verifyPresenceOfOrderID(orderID){
        const orderIDCell = this.page.locator('th',{hasText:orderID});
        await expect(orderIDCell).toBeVisible();
    }
    async clickViewOrderButton(orderID){
        const orderIDCell = this.page.locator('th',{hasText:orderID});
        const rowOrder = this.page.locator('tr',{has: orderIDCell});
        const viewBtn = rowOrder.locator('button',{hasText:'View'});
        await viewBtn.click();
    }
}
module.exports = {OrdersPage};
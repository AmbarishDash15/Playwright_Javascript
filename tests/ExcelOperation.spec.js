const {test, expect} = require('@playwright/test');
const {MiscUtils} = require('../utils/MiscUtils');
const {ExcelUtils} = require('../utils/ExcelUtils');

test('Update Price with Excel operation @FileOpnUI',async({page}) => {
    const itemName = 'Orange';
    const newPrice = '500';
    const fileName = 'download.xlsx'
    const filePath = './downloads/'
    const fileDownloadFullPath = filePath+fileName;
    const miscUtils = new MiscUtils();
    await miscUtils.checkAndDeleteFile(fileDownloadFullPath);
    await page.goto('https://rahulshettyacademy.com/upload-download-test/index.html');
    const downloadBtn = page.locator('#downloadButton');
    const browseInput = page.locator('#fileinput');
    const tableRows = page.locator('div[role="row"]');
    const downloadPromise = page.waitForEvent('download');
    await downloadBtn.click();
    const downloadedFile = await downloadPromise;
    await downloadedFile.saveAs(fileDownloadFullPath);
    const excelUtils = new ExcelUtils(fileDownloadFullPath,'Sheet1');
    await excelUtils.updatePriceForFruit(itemName,'price',newPrice);
    await browseInput.setInputFiles(fileDownloadFullPath);
    await page.getByText('Updated Excel Data Successfully.').waitFor({state: 'visible'});
    const rowCount = await tableRows.count();
    for(var i=1;i<=rowCount;i++){
        var fruitName = await tableRows.nth(i).locator('#cell-2-undefined').textContent();
        if( fruitName === itemName){
            await expect(tableRows.nth(i).locator('#cell-4-undefined')).toContainText(newPrice);
            break;
        }
    }
})

const {test,expect} =require ('@playwright/test');
test('NexusApp login setup',async({page})=>
    {
    await page.goto('/');


await expect (page).toHaveURL(/.*/);

});
const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests/browser',fullyParallel:true,globalTimeout:180000,timeout:30000,
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:'http://127.0.0.1:18905',headless:true,viewport:{width:1280,height:900},trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{command:'node preview.cjs',url:'http://127.0.0.1:18905',reuseExistingServer:false,timeout:15000},
});


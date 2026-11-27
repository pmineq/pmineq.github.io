import test from 'node:test';
import assert from 'node:assert/strict';
import * as routing from '../src/pages/Landing/storeRouting.ts';

test('detects iOS, touch Macs, Android WebViews and desktop without false Mac matches', () => {
  assert.equal(typeof routing.detectOS, 'function', 'OS detection has not been implemented');
  for (const [browser, expected] of [
    [{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Instagram 350',platform:'iPhone'},'ios'],
    [{userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0)',platform:'iPad'},'ios'],
    [{userAgent:'iPod',platform:''},'ios'],
    [{userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',platform:'MacIntel',maxTouchPoints:5},'ios'],
    [{userAgent:'',platform:'iPhone'},'ios'],
    [{userAgent:'Mozilla/5.0 (Linux; Android 15) Threads',platform:'Linux armv8l'},'android'],
    [{userAgent:'',platform:'Android'},'android'],
    [{userAgent:'Mozilla/5.0 (Macintosh)',platform:'MacIntel',maxTouchPoints:0},'other'],
    [{userAgent:'Windows NT 10.0',platform:'Win32',maxTouchPoints:10},'other'],
    [{},'other'],
  ]) assert.equal(routing.detectOS(browser),expected,JSON.stringify(browser));
});

test('browser language produces the exact requested regional store URLs', () => {
  assert.equal(typeof routing.storeDestination, 'function', 'Store matching has not been implemented');
  for (const [language,country,suffix,hl,gl] of [
    ['ko-KR','kr','','ko','KR'], ['ko-US','kr','','ko','KR'],
    ['ja-JP','jp','','ja','JP'], ['th-TH','th','?l=th','th','TH'],
    ['zh-TW','tw','','zh_TW','TW'], ['zh-HK','tw','','zh_TW','TW'],
    ['zh-Hant','tw','','zh_TW','TW'], ['zh-Hant-CN','tw','','zh_TW','TW'],
    ['ZH_hk','tw','','zh_TW','TW'], ['en-GB','us','','en','US'],
    ['fr-FR','us','','en','US'], ['zh-CN','us','','en','US'], ['', 'us','','en','US'],
  ]) {
    const result = routing.storeDestination(language);
    assert.equal(result.country,country,language);
    assert.equal(result.ios,`https://apps.apple.com/${country}/app/zencut/id6816699757${suffix}`,language);
    assert.equal(result.android,`https://play.google.com/store/apps/details?id=com.pmineq.zencut&hl=${hl}&gl=${gl}`,language);
  }
});

test('an explicit country choice updates store region while preserving valid Play language tags', () => {
  assert.equal(typeof routing.storeDestination, 'function');
  assert.equal(routing.storeDestination('zh-Hant','jp').android,'https://play.google.com/store/apps/details?id=com.pmineq.zencut&hl=zh_TW&gl=JP');
  assert.equal(routing.storeDestination('th','th').ios,'https://apps.apple.com/th/app/zencut/id6816699757?l=th');
});

test('mobile redirect waits 1200 ms and opens the detected OS store only once', async () => {
  assert.equal(typeof routing.scheduleStoreRedirect,'function','Automatic redirect has not been implemented');
  for (const os of ['ios','android']) {
    const visits = [];
    const start = Date.now();
    const cancel = routing.scheduleStoreRedirect(os, { ios:'https://ios.example', android:'https://android.example' }, url => visits.push({url, elapsed:Date.now()-start}));
    await new Promise(resolve => setTimeout(resolve,1050));
    assert.equal(visits.length,0,'guide card must remain for 1.2 seconds');
    await new Promise(resolve => setTimeout(resolve,250));
    assert.equal(visits.length,1);
    assert.equal(visits[0].url,os === 'ios' ? 'https://ios.example' : 'https://android.example');
    assert.ok(visits[0].elapsed >= 1190);
    cancel();
  }
});

test('desktop never redirects and a manual choice cancels the pending mobile redirect', async () => {
  assert.equal(typeof routing.scheduleStoreRedirect,'function');
  const visits = [];
  const stores = {ios:'ios',android:'android'};
  routing.scheduleStoreRedirect('other',stores,url => visits.push(url));
  const cancel = routing.scheduleStoreRedirect('ios',stores,url => visits.push(url));
  cancel();
  await new Promise(resolve => setTimeout(resolve,1250));
  assert.deepEqual(visits,[]);
});

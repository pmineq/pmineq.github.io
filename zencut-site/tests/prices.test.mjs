import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCountry, formatStorePrice, priceFor } from '../src/pages/Landing/prices.ts';

test('storefront follows explicit choice, saved country, then browser region independently of language', () => {
  assert.equal(resolveCountry({locale:'ja',languages:['ko-KR']}),'kr');
  assert.equal(resolveCountry({locale:'en',languages:['en-AU']}),'au');
  assert.equal(resolveCountry({locale:'en',languages:['en-GB']}),'gb');
  assert.equal(resolveCountry({locale:'ko',query:'JP',saved:'us',languages:['ko-KR']}),'jp');
  assert.equal(resolveCountry({locale:'ko',query:'invalid',saved:'ca'}),'ca');
  assert.equal(resolveCountry({locale:'th',languages:['th']}),'th');
  assert.equal(resolveCountry({locale:'en',languages:['fr-FR']}),'us');
});
test('displays actual per-platform store prices rather than currency conversion', () => {
  assert.equal(priceFor('jp','ios').amount,150);
  assert.equal(priceFor('jp','android').amount,290);
  assert.equal(priceFor('us','ios').amount,.99);
  assert.equal(priceFor('us','android').amount,1.59);
  assert.equal(priceFor('kr','ios').amount,2200);
  assert.equal(priceFor('kr','android').currency,'KRW');
  assert.match(formatStorePrice('us','ios','en'),/0\.99/);
  assert.match(formatStorePrice('tw','android','zh-Hant'),/56/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLocale } from '../src/pages/Landing/locale.ts';

test('browser languages map to the six app locales, including Chinese scripts', () => {
  for (const [input, expected] of [['ko-KR','ko'],['en-AU','en'],['ja-JP','ja'],['th-TH','th'],['zh-TW','zh-Hant'],['zh-HK','zh-Hant'],['zh-MO','zh-Hant'],['zh-Hant-CN','zh-Hant'],['zh-CN','zh-Hans'],['zh-SG','zh-Hans'],['zh-Hans-TW','zh-Hans']]) assert.equal(resolveLocale({languages:[input]}),expected,input);
});
test('explicit URL overrides saved choice, which overrides browser preference', () => {
  assert.equal(resolveLocale({query:'ja',saved:'ko',languages:['th']}),'ja');
  assert.equal(resolveLocale({query:'invalid',saved:'zh-Hant',languages:['ja']}),'zh-Hant');
  assert.equal(resolveLocale({languages:['fr-FR','ja-JP']}),'ja');
  assert.equal(resolveLocale({languages:['fr-FR']}),'en');
  assert.equal(resolveLocale({}),'en');
});

test('private browsers with blocked storage still resolve the URL language', async () => {
  const { initialLocale } = await import('../src/pages/Landing/locale.ts');
  const original = Object.getOwnPropertyDescriptors(globalThis);
  try {
    Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('Blocked');}});
    Object.defineProperty(globalThis,'location',{configurable:true,value:{search:'?lang=th'}});
    assert.equal(initialLocale(),'th');
  } finally {
    for (const key of ['localStorage','location']) {
      if (original[key]) Object.defineProperty(globalThis,key,original[key]);
      else delete globalThis[key];
    }
  }
});

test('every app locale has complete non-empty page translations', async () => {
  const { messages } = await import('../src/pages/Landing/translations.ts');
  const keys = Object.keys(messages.ko).sort();
  for (const [locale,copy] of Object.entries(messages)) {
    assert.deepEqual(Object.keys(copy).sort(),keys,locale);
    for (const [key,value] of Object.entries(copy)) {
      assert.ok(typeof value === 'string' && value.trim(),`${locale}.${key}`);
    }
  }
});

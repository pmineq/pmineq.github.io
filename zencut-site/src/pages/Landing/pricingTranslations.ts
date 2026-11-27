import type { Locale } from './locale';
export const pricingMessages: Record<Locale, { country: string; verified: string; storeNote: string }> = {
  ko: { country:'스토어 국가/지역', verified:'가격 확인', storeNote:'스토어별 실제 판매가입니다. 최종 결제 금액은 스토어에서 확인해 주세요.' },
  en: { country:'Store country / region', verified:'Prices checked', storeNote:'Actual store prices. The final checkout price is shown in each store.' },
  ja: { country:'ストアの国・地域', verified:'価格確認日', storeNote:'各ストアの実際の販売価格です。最終的なお支払い金額はストアでご確認ください。' },
  th: { country:'ประเทศ / ภูมิภาคของร้านค้า', verified:'ตรวจสอบราคาเมื่อ', storeNote:'ราคาขายจริงของแต่ละร้านค้า โปรดตรวจสอบยอดชำระสุดท้ายที่ร้านค้า' },
  'zh-Hans': { country:'商店国家或地区', verified:'价格核对日期', storeNote:'此为各商店的实际售价，最终付款金额请以商店显示为准。' },
  'zh-Hant': { country:'商店國家或地區', verified:'價格核對日期', storeNote:'此為各商店的實際售價，最終付款金額請以商店顯示為準。' },
};

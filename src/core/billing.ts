// Google Play Billing v mobilní aplikaci (Capacitor, plugin @capgo/native-purchases). Na webu se nic nenačítá.
// ID produktů v Play Console musí být stejná jako ProductId: gems50, gems100, gems550, gems1500, gems3500, pass, starter,
// xmas (spotřební), noads (jednorázový, trvalý).
import { Capacitor } from '@capacitor/core';
import { setIapProvider, ProductId, PRODUCTS, SUBS, SUB_PLAN } from './shop';

/** spotřební = jde koupit znovu (diamanty, Štamgast na 30 dní); noads je trvalý a obnoví se po přeinstalaci */
const CONSUMABLE: ProductId[] = ['gems50', 'gems100', 'gems550', 'gems1500', 'gems3500', 'pass', 'starter', 'xmas', 'milestone'];

export async function initBilling() {
  if (!Capacitor.isNativePlatform()) return;
  const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');
  try {
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported) return;
  } catch {
    return; // bez Google Play – tlačítka ukážou „jen v mobilní aplikaci“
  }
  const prices: Partial<Record<ProductId, string>> = {};
  const trials: Partial<Record<ProductId, boolean>> = {};
  const ids = (Object.keys(PRODUCTS) as ProductId[]).filter((id) => !SUBS.includes(id));
  try {
    const { products } = await NativePurchases.getProducts({ productIdentifiers: ids, productType: PURCHASE_TYPE.INAPP });
    for (const p of products) if (ids.includes(p.identifier as ProductId)) prices[p.identifier as ProductId] = p.priceString;
  } catch {
    /* ceny se ukážou výchozí */
  }
  try {
    const { products } = await NativePurchases.getProducts({ productIdentifiers: SUBS, productType: PURCHASE_TYPE.SUBS });
    for (const p of products) {
      const id = p.identifier as ProductId;
      if (!SUBS.includes(id)) continue;
      prices[id] = p.priceString;
      // zkušební doba zdarma = úvodní fáze s cenou 0 (nastavuje se v Play Console jako nabídka základního plánu)
      trials[id] = p.introductoryPrice?.price === 0;
    }
  } catch {
    /* předplatné v obchodě není */
  }
  setIapProvider({
    price: (id) => prices[id],
    // seznam se nepodařilo načíst → nic neschovávat (dřív to fungovalo i tak)
    has: (id) => (SUBS.includes(id) ? !!prices[id] : !Object.keys(prices).length || !!prices[id]),
    trial: (id) => !!trials[id],
    async subs() {
      const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.SUBS });
      // Google vrací jen platná předplatná (i zrušená do konce zaplaceného období)
      return purchases.filter((p) => p.purchaseState === undefined || p.purchaseState === '1').map((p) => p.productIdentifier as ProductId).filter((id) => SUBS.includes(id));
    },
    manage: () => NativePurchases.manageSubscriptions(),
    async buy(id) {
      if (SUBS.includes(id)) {
        const tr = await NativePurchases.purchaseProduct({ productIdentifier: id, planIdentifier: SUB_PLAN, productType: PURCHASE_TYPE.SUBS, quantity: 1 });
        if (tr?.purchaseState === '2') return 'pending';
        return !!tr && (tr.purchaseState === undefined || tr.purchaseState === '1');
      }
      const tr = await NativePurchases.purchaseProduct({ productIdentifier: id, productType: PURCHASE_TYPE.INAPP, quantity: 1, isConsumable: CONSUMABLE.includes(id) });
      // Android: 1 = zaplaceno, 2 = čeká (platba v hotovosti apod.) – připíše se po zaplacení (unclaimed při spuštění / návratu)
      if (tr?.purchaseState === '2') return 'pending';
      return !!tr && (tr.purchaseState === undefined || tr.purchaseState === '1');
    },
    async owned() {
      const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP });
      return purchases.filter((p) => p.purchaseState === undefined || p.purchaseState === '1').map((p) => p.productIdentifier as ProductId);
    },
    // Dřív čekající platba, která se mezitím zaplatila: Google ji vrací v getPurchases (nespotřebovanou). Bez spotřebování
    // by ji po 3 dnech vrátil. Nejdřív spotřebovat, pak připsat (nikdy dvakrát).
    async unclaimed() {
      const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP });
      const got: ProductId[] = [];
      for (const p of purchases) {
        const id = p.productIdentifier as ProductId;
        if (!CONSUMABLE.includes(id) || p.purchaseState !== '1' || !p.purchaseToken) continue;
        try {
          await NativePurchases.consumePurchase({ purchaseToken: p.purchaseToken });
          got.push(id);
        } catch {
          /* příště */
        }
      }
      return got;
    },
  });
}

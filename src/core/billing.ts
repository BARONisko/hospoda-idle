// Google Play Billing v mobilní aplikaci (Capacitor, plugin @capgo/native-purchases). Na webu se nic nenačítá.
// ID produktů v Play Console musí být stejná jako ProductId: gems100, gems550, pass (spotřební), noads (jednorázový, trvalý).
import { Capacitor } from '@capacitor/core';
import { setIapProvider, ProductId, PRODUCTS } from './shop';

/** spotřební = jde koupit znovu (diamanty, Štamgast na 30 dní); noads je trvalý a obnoví se po přeinstalaci */
const CONSUMABLE: ProductId[] = ['gems100', 'gems550', 'pass'];

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
  const ids = Object.keys(PRODUCTS) as ProductId[];
  try {
    const { products } = await NativePurchases.getProducts({ productIdentifiers: ids, productType: PURCHASE_TYPE.INAPP });
    for (const p of products) if (ids.includes(p.identifier as ProductId)) prices[p.identifier as ProductId] = p.priceString;
  } catch {
    /* ceny se ukážou výchozí */
  }
  setIapProvider({
    price: (id) => prices[id],
    async buy(id) {
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

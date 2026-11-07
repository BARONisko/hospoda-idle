// Nákupy za skutečné peníze – zatím jen rozhraní (jako ads.ts). Na webu se neprodává: tlačítka ukážou
// „jen v mobilní aplikaci“. V aplikaci (Capacitor) se sem připojí Google Play / App Store přes setIapProvider().
export interface IapProvider {
  /** koupí produkt; true = zaplaceno */
  buy(id: ProductId): Promise<boolean>;
  /** cena z obchodu (např. „49 Kč“); jinak se ukáže výchozí */
  price?(id: ProductId): string | undefined;
}

export type ProductId = 'gems100' | 'gems550' | 'pass' | 'noads';
/** produkty: diamanty v balíčku a výchozí cena */
export const PRODUCTS: Record<ProductId, { gems?: number; price: string }> = {
  gems100: { gems: 100, price: '49 Kč' },
  gems550: { gems: 550, price: '199 Kč' },
  pass: { price: '99 Kč' },
  noads: { price: '99 Kč' },
};

let provider: IapProvider | null = null;
export function setIapProvider(p: IapProvider | null) {
  provider = p;
}

export const iap = {
  get available() {
    return !!provider;
  },
  price(id: ProductId) {
    return provider?.price?.(id) ?? PRODUCTS[id].price;
  },
  async buy(id: ProductId): Promise<boolean> {
    if (!provider) return false;
    try {
      return await provider.buy(id);
    } catch {
      return false;
    }
  },
};

// ladění: ?fakeshop=1 – nákup „proběhne“ zdarma
if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('fakeshop')) setIapProvider({ buy: async () => true });

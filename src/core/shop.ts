// Nákupy za skutečné peníze – rozhraní (jako ads.ts). Na webu se neprodává: tlačítka ukážou „jen v mobilní aplikaci“.
// V aplikaci se sem připojí Google Play přes setIapProvider() (core/billing.ts).
export interface IapProvider {
  /** koupí produkt; true = zaplaceno, 'pending' = platba čeká (hotově apod.) – připíše se přes unclaimed() */
  buy(id: ProductId): Promise<boolean | 'pending'>;
  /** cena z obchodu (např. „49 Kč“); jinak se ukáže výchozí */
  price?(id: ProductId): string | undefined;
  /** trvalé nákupy, které hráč vlastní (obnovení po přeinstalaci) */
  owned?(): Promise<ProductId[]>;
  /** zaplacené, ale nepřipsané spotřební nákupy (dřív čekající platba): spotřebuje je a vrátí, co připsat */
  unclaimed?(): Promise<ProductId[]>;
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
const listeners: (() => void)[] = [];
export function setIapProvider(p: IapProvider | null) {
  provider = p;
  listeners.forEach((f) => f());
}
/** zavolá se, když se obchod připojí (hra pak obnoví trvalé nákupy a překreslí ceny) */
export function onIapReady(f: () => void) {
  listeners.push(f);
  if (provider) f();
}

export const iap = {
  get available() {
    return !!provider;
  },
  price(id: ProductId) {
    return provider?.price?.(id) ?? PRODUCTS[id].price;
  },
  async buy(id: ProductId): Promise<boolean | 'pending'> {
    if (!provider) return false;
    try {
      return await provider.buy(id);
    } catch {
      return false;
    }
  },
  async owned(): Promise<ProductId[]> {
    try {
      return (await provider?.owned?.()) ?? [];
    } catch {
      return [];
    }
  },
  async unclaimed(): Promise<ProductId[]> {
    try {
      return (await provider?.unclaimed?.()) ?? [];
    } catch {
      return [];
    }
  },
};

// ladění: ?fakeshop=1 – nákup „proběhne“ zdarma
if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('fakeshop')) setIapProvider({ buy: async () => true });

// Nákupy za skutečné peníze – rozhraní (jako ads.ts). Na webu se neprodává: tlačítka ukážou „jen v mobilní aplikaci“.
// V aplikaci se sem připojí Google Play přes setIapProvider() (core/billing.ts).
export interface IapProvider {
  /** koupí produkt; true = zaplaceno, 'pending' = platba čeká (hotově apod.) – připíše se přes unclaimed() */
  buy(id: ProductId): Promise<boolean | 'pending'>;
  /** cena z obchodu (např. „49 Kč“); jinak se ukáže výchozí */
  price?(id: ProductId): string | undefined;
  /** je produkt založený v obchodě? (nezaložený se nenabízí) */
  has?(id: ProductId): boolean;
  /** má předplatné zkušební dobu zdarma (podle obchodu) */
  trial?(id: ProductId): boolean;
  /** aktivní předplatná */
  subs?(): Promise<ProductId[]>;
  /** otevře správu předplatného v Google Play */
  manage?(): Promise<void>;
  /** trvalé nákupy, které hráč vlastní (obnovení po přeinstalaci) */
  owned?(): Promise<ProductId[]>;
  /** zaplacené, ale nepřipsané spotřební nákupy (dřív čekající platba): spotřebuje je a vrátí, co připsat */
  unclaimed?(): Promise<ProductId[]>;
}

export type ProductId = 'gems50' | 'gems100' | 'gems550' | 'gems1500' | 'gems3500' | 'pass' | 'noads' | 'starter' | 'xmas' | 'milestone' | 'passsub';
/** produkty: diamanty v balíčku a výchozí cena (startovní a vánoční balík: obsah v core/offers.ts) */
export const PRODUCTS: Record<ProductId, { gems?: number; price: string }> = {
  gems50: { gems: 50, price: '25 Kč' },
  gems100: { gems: 100, price: '49 Kč' },
  gems550: { gems: 550, price: '199 Kč' },
  gems1500: { gems: 1500, price: '499 Kč' },
  gems3500: { gems: 3500, price: '999 Kč' },
  pass: { price: '99 Kč' },
  noads: { price: '149 Kč' },
  starter: { price: '49 Kč' },
  xmas: { price: '79 Kč' },
  milestone: { price: '79 Kč' },
  /** Štamgast jako předplatné (měsíční, v Play Console základní plán SUB_PLAN, nabídka 3 dny zdarma) */
  passsub: { price: '99 Kč' },
};
/** předplatná a základní plán v Play Console */
export const SUBS: ProductId[] = ['passsub'];
export const SUB_PLAN = 'monthly';

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
  /** jde produkt teď koupit (obchod připojený a produkt v něm založený) */
  has(id: ProductId) {
    return !!provider && (provider.has?.(id) ?? true);
  },
  trial(id: ProductId) {
    return !!provider?.trial?.(id);
  },
  async subs(): Promise<ProductId[]> {
    try {
      return (await provider?.subs?.()) ?? [];
    } catch {
      return [];
    }
  },
  async manage() {
    try {
      await provider?.manage?.();
    } catch {
      /* nic */
    }
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
if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('fakeshop')) setIapProvider({ buy: async () => true, trial: () => true });

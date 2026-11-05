// Reklamy za odměnu – zatím jen rozhraní. Na webu žádná reklamní síť není, takže tlačítka „×2 za reklamu“
// se neukazují. V mobilní aplikaci (Capacitor) se sem připojí skutečná síť (např. AdMob) přes setAdProvider().
export interface AdProvider {
  /** pustí reklamu za odměnu; true = hráč ji dokoukal */
  showRewarded(): Promise<boolean>;
  /** zakoupené „bez reklam“ – odměny pak bez reklamy */
  noAds?: boolean;
}

let provider: AdProvider | null = null;

export function setAdProvider(p: AdProvider | null) {
  provider = p;
}

export const ads = {
  get available() {
    return !!provider;
  },
  async rewarded(): Promise<boolean> {
    if (!provider) return false;
    if (provider.noAds) return true;
    try {
      return await provider.showRewarded();
    } catch {
      return false;
    }
  },
};

// ladění: ?fakeads=1 – reklama „proběhne“ okamžitě
if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('fakeads')) setAdProvider({ showRewarded: async () => true });

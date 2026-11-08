// AdMob v mobilní aplikaci (Capacitor): reklamy za odměnu + souhlas GDPR (formulář Googlu UMP).
// Na webu se nic nenačítá. Bez skutečného ID reklamní jednotky (VITE_ADMOB_REWARDED při buildu) jdou testovací reklamy Googlu.
import { Capacitor } from '@capacitor/core';
import { setAdProvider } from './ads';

const TEST_REWARDED = 'ca-app-pub-3940256099942544/5224354917';

export async function initAdMob() {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob, AdmobConsentStatus, RewardAdPluginEvents } = await import('@capacitor-community/admob');
  const real = (import.meta.env.VITE_ADMOB_REWARDED as string | undefined) || '';
  const adId = real || TEST_REWARDED;
  const isTesting = !real;
  try {
    await AdMob.initialize({});
    // souhlas (EU): formulář jen když ho Google vyžaduje
    try {
      const info = await AdMob.requestConsentInfo();
      if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) await AdMob.showConsentForm();
    } catch {
      /* bez formuláře – reklamy případně nepersonalizované */
    }
  } catch {
    return; // AdMob nejde – tlačítka „za reklamu“ zůstanou skrytá
  }
  let ready = false;
  const prepare = async () => {
    try {
      await AdMob.prepareRewardVideoAd({ adId, isTesting });
      ready = true;
    } catch {
      ready = false;
    }
  };
  void prepare();
  setAdProvider({
    async showRewarded() {
      if (!ready) await prepare();
      if (!ready) return false;
      ready = false;
      // odměna = událost Rewarded; zavření bez dokoukání = Dismissed (slib showRewardVideoAd by pak visel)
      let got = false;
      const hs = [
        await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => (got = true)),
      ];
      try {
        return await new Promise<boolean>((res) => {
          void AdMob.addListener(RewardAdPluginEvents.Dismissed, () => setTimeout(() => res(got), 300)).then((h) => hs.push(h));
          void AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => res(false)).then((h) => hs.push(h));
          AdMob.showRewardVideoAd().catch(() => res(false));
        });
      } finally {
        hs.forEach((h) => void h.remove());
        void prepare(); // další reklama do zásoby
      }
    },
  });
}

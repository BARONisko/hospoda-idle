// Upozornění na mobilu („hospoda je plná“, „víkend v chrámu“ …) – rozhraní jako ads.ts.
// V mobilní aplikaci (Capacitor) se použije plugin LocalNotifications (přes window.Capacitor, bez závislosti v balíčku):
// upozornění přijdou i při zavřené hře. Na webu (PWA) jde jen Notification API a časovač stránky – upozornění přijde,
// jen dokud prohlížeč stránku na pozadí nechá žít (mobilní prohlížeče ji často brzy uspí). Bez push serveru to jinak nejde.
export interface Note {
  /** stálé číslo druhu upozornění (stejné id = nahradí předchozí) */
  id: number;
  /** kdy (ms od epochy) */
  at: number;
  title: string;
  body: string;
}

export interface NotifyProvider {
  /** požádá o povolení; true = smí se upozorňovat */
  permit(): Promise<boolean>;
  /** naplánuje (předchozí plán zruší) */
  schedule(list: Note[]): Promise<void>;
  /** zruší všechna naplánovaná */
  cancel(): Promise<void>;
}

/** druhy upozornění (id) */
export const NOTE = { full: 1, darts: 2, chest: 3, temple: 4, vip: 5 } as const;

type CapLN = {
  requestPermissions(): Promise<{ display: string }>;
  schedule(o: { notifications: { id: number; title: string; body: string; schedule: { at: Date; allowWhileIdle?: boolean } }[] }): Promise<unknown>;
  cancel(o: { notifications: { id: number }[] }): Promise<unknown>;
};

/** Capacitor LocalNotifications (mobilní aplikace) */
function capacitor(): NotifyProvider | null {
  const ln = (globalThis as { Capacitor?: { Plugins?: { LocalNotifications?: CapLN } } }).Capacitor?.Plugins?.LocalNotifications;
  if (!ln) return null;
  const all = Object.values(NOTE).map((id) => ({ id }));
  return {
    permit: async () => (await ln.requestPermissions()).display === 'granted',
    cancel: async () => {
      await ln.cancel({ notifications: all });
    },
    schedule: async (list) => {
      await ln.cancel({ notifications: all });
      if (list.length) await ln.schedule({ notifications: list.map((n) => ({ id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at), allowWhileIdle: true } })) });
    },
  };
}

/** web: Notification API + časovače (jen dokud stránka žije) */
function web(): NotifyProvider | null {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  let timers: number[] = [];
  const show = async (n: Note) => {
    if (Notification.permission !== 'granted') return;
    const opt = { body: n.body, icon: './icon.png', tag: `pub${n.id}` };
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) return void (await reg.showNotification(n.title, opt));
    } catch {
      /* bez service workeru */
    }
    try {
      new Notification(n.title, opt);
    } catch {
      /* některé mobilní prohlížeče new Notification nedovolí */
    }
  };
  const cancel = async () => {
    timers.forEach((x) => clearTimeout(x));
    timers = [];
  };
  return {
    permit: async () => Notification.permission === 'granted' || (await Notification.requestPermission()) === 'granted',
    cancel,
    schedule: async (list) => {
      await cancel();
      // setTimeout má strop ~24,8 dne
      for (const n of list) timers.push(window.setTimeout(() => void show(n), Math.min(2 ** 31 - 1, Math.max(0, n.at - Date.now()))));
    },
  };
}

let provider: NotifyProvider | null | undefined;
const get = () => (provider === undefined ? (provider = capacitor() ?? web()) : provider);

export function setNotifyProvider(p: NotifyProvider | null) {
  provider = p;
}

export const notify = {
  /** jde vůbec upozorňovat? (jinak se přepínač v nastavení neukáže) */
  get available() {
    return !!get();
  },
  /** jen web: upozornění přijdou, jen dokud prohlížeč stránku nezavře */
  get webOnly() {
    const p = get();
    return !!p && !capacitor();
  },
  async permit() {
    try {
      return (await get()?.permit()) ?? false;
    } catch {
      return false;
    }
  },
  async schedule(list: Note[]) {
    try {
      await get()?.schedule(list.filter((n) => n.at > Date.now() + 30_000));
    } catch {
      /* nic */
    }
  },
  async cancel() {
    try {
      await get()?.cancel();
    } catch {
      /* nic */
    }
  },
};

package cz.baronisko.pubidle;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.games.SnapshotsClient;
import com.google.android.gms.games.snapshot.Snapshot;
import com.google.android.gms.games.snapshot.SnapshotMetadata;
import com.google.android.gms.games.snapshot.SnapshotMetadataChange;
import java.nio.charset.StandardCharsets;

/**
 * Google Play Hry (Play Games Services v2): přihlášení, žebříčky a uložení hry v cloudu (Saved Games).
 * ID hry a žebříčků se doplní při sestavení (GitHub Variables → app/build.gradle → resValue). Bez ID hry
 * se nic nespouští a available() vrátí false (hra skryje tlačítka).
 */
@CapacitorPlugin(name = "PlayGames")
public class PlayGamesPlugin extends Plugin {
    private static final String SNAP = "pubidle";
    private static boolean inited = false;

    /** ID hry z Play Console (prázdné = Play Hry ještě nejsou nastavené) */
    static String appId(Context c) {
        int id = c.getResources().getIdentifier("game_services_project_id", "string", c.getPackageName());
        return id == 0 ? "" : c.getString(id).trim();
    }

    /** zavolat z MainActivity.onCreate – jen když je ID hry vyplněné */
    static void init(Context c) {
        if (inited || appId(c).isEmpty()) return;
        try {
            PlayGamesSdk.initialize(c);
            inited = true;
        } catch (Exception e) {
            inited = false;
        }
    }

    private String lbId(String key) {
        Context c = getContext();
        int id = c.getResources().getIdentifier("pg_lb_" + key, "string", c.getPackageName());
        return id == 0 ? "" : c.getString(id).trim();
    }

    private boolean ready(PluginCall call) {
        if (inited && getActivity() != null) return true;
        JSObject r = new JSObject();
        r.put("ok", false);
        r.put("err", "unavailable");
        call.resolve(r);
        return false;
    }

    @PluginMethod
    public void available(PluginCall call) {
        JSObject r = new JSObject();
        r.put("available", inited);
        r.put("lb", String.join(",", keys()));
        call.resolve(r);
    }

    private java.util.List<String> keys() {
        java.util.List<String> out = new java.util.ArrayList<>();
        for (String k : new String[] { "krigle", "level", "temple" }) if (!lbId(k).isEmpty()) out.add(k);
        return out;
    }

    /** stav přihlášení (v2 přihlašuje automaticky při startu; tohle jen zjistí výsledek) */
    @PluginMethod
    public void status(PluginCall call) {
        if (!ready(call)) return;
        PlayGames.getGamesSignInClient(getActivity()).isAuthenticated().addOnCompleteListener(t -> {
            JSObject r = new JSObject();
            r.put("ok", true);
            r.put("signedIn", t.isSuccessful() && t.getResult() != null && t.getResult().isAuthenticated());
            call.resolve(r);
        });
    }

    /** ruční přihlášení (tlačítko „Přihlásit“) */
    @PluginMethod
    public void signIn(PluginCall call) {
        if (!ready(call)) return;
        PlayGames.getGamesSignInClient(getActivity()).signIn().addOnCompleteListener(t -> {
            JSObject r = new JSObject();
            r.put("ok", true);
            r.put("signedIn", t.isSuccessful() && t.getResult() != null && t.getResult().isAuthenticated());
            call.resolve(r);
        });
    }

    @PluginMethod
    public void submitScore(PluginCall call) {
        if (!ready(call)) return;
        String id = lbId(call.getString("board", ""));
        Long score = call.getLong("score");
        JSObject r = new JSObject();
        if (id.isEmpty() || score == null || score < 0) {
            r.put("ok", false);
            call.resolve(r);
            return;
        }
        PlayGames.getLeaderboardsClient(getActivity()).submitScore(id, score);
        r.put("ok", true);
        call.resolve(r);
    }

    /** okno žebříčků Google Play (board = jeden žebříček, bez board = všechny) */
    @PluginMethod
    public void showBoards(PluginCall call) {
        if (!ready(call)) return;
        String id = lbId(call.getString("board", ""));
        Activity a = getActivity();
        com.google.android.gms.tasks.Task<Intent> task = id.isEmpty()
            ? PlayGames.getLeaderboardsClient(a).getAllLeaderboardsIntent()
            : PlayGames.getLeaderboardsClient(a).getLeaderboardIntent(id);
        task.addOnCompleteListener(t -> {
            JSObject r = new JSObject();
            if (t.isSuccessful() && t.getResult() != null) {
                a.startActivityForResult(t.getResult(), 9004);
                r.put("ok", true);
            } else r.put("ok", false);
            call.resolve(r);
        });
    }

    /** načte uloženou hru z cloudu: data (text), čas uložení, postup, zařízení */
    @PluginMethod
    public void loadCloud(PluginCall call) {
        if (!ready(call)) return;
        SnapshotsClient sc = PlayGames.getSnapshotsClient(getActivity());
        sc.open(SNAP, true, SnapshotsClient.RESOLUTION_POLICY_HIGHEST_PROGRESS).addOnCompleteListener(t -> {
            JSObject r = new JSObject();
            try {
                if (!t.isSuccessful() || t.getResult() == null) throw new Exception("open");
                SnapshotsClient.DataOrConflict<Snapshot> dc = t.getResult();
                Snapshot s = dc.isConflict() ? dc.getConflict().getSnapshot() : dc.getData();
                byte[] b = s.getSnapshotContents().readFully();
                SnapshotMetadata m = s.getMetadata();
                r.put("ok", true);
                r.put("data", b == null ? "" : new String(b, StandardCharsets.UTF_8));
                r.put("at", m.getLastModifiedTimestamp());
                r.put("device", m.getDeviceName());
                // konflikt (dvě zařízení najednou): vyhrává uložení s větším postupem, jinak jen zavřít
                if (dc.isConflict()) sc.resolveConflict(dc.getConflict().getConflictId(), s);
                else sc.discardAndClose(s);
            } catch (Exception e) {
                r.put("ok", false);
                r.put("err", String.valueOf(e.getMessage()));
            }
            call.resolve(r);
        });
    }

    /** uloží hru do cloudu (popis = krátký text v seznamu uložení Google Play, progress = postup pro řešení konfliktu) */
    @PluginMethod
    public void saveCloud(PluginCall call) {
        if (!ready(call)) return;
        String data = call.getString("data", "");
        String desc = call.getString("desc", "");
        Long progress = call.getLong("progress", 0L);
        SnapshotsClient sc = PlayGames.getSnapshotsClient(getActivity());
        sc.open(SNAP, true, SnapshotsClient.RESOLUTION_POLICY_HIGHEST_PROGRESS).addOnCompleteListener(t -> {
            JSObject r = new JSObject();
            try {
                if (!t.isSuccessful() || t.getResult() == null) throw new Exception("open");
                SnapshotsClient.DataOrConflict<Snapshot> dc = t.getResult();
                if (dc.isConflict()) {
                    // konflikt vyřešit (větší postup) a uložit až příště
                    sc.resolveConflict(dc.getConflict().getConflictId(), dc.getConflict().getSnapshot());
                    throw new Exception("conflict");
                }
                Snapshot s = dc.getData();
                s.getSnapshotContents().writeBytes(data.getBytes(StandardCharsets.UTF_8));
                SnapshotMetadataChange ch = new SnapshotMetadataChange.Builder()
                    .setDescription(desc)
                    .setProgressValue(progress == null ? 0L : progress)
                    .build();
                sc.commitAndClose(s, ch).addOnCompleteListener(c2 -> {
                    JSObject r2 = new JSObject();
                    r2.put("ok", c2.isSuccessful());
                    call.resolve(r2);
                });
                return;
            } catch (Exception e) {
                r.put("ok", false);
                r.put("err", String.valueOf(e.getMessage()));
            }
            call.resolve(r);
        });
    }
}

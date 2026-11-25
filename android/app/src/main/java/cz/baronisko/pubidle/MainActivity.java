package cz.baronisko.pubidle;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Google Play Hry (žebříčky, uložení v cloudu) – vlastní plugin, registruje se před startem mostu
        registerPlugin(PlayGamesPlugin.class);
        PlayGamesPlugin.init(getApplicationContext());
        super.onCreate(savedInstanceState);
    }
}

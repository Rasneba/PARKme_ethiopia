package com.aksum.parkme;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureSystemBars();
    }

    @Override
    public void onResume() {
        super.onResume();
        configureSystemBars();
    }

    private void configureSystemBars() {
        android.view.Window window = getWindow();

        WindowCompat.setDecorFitsSystemWindows(window, true);

        window.setStatusBarColor(0xFFFFFFFF);
        WindowInsetsControllerCompat statusCtrl = WindowCompat.getInsetsController(window, window.getDecorView());
        if (statusCtrl != null) {
            statusCtrl.setAppearanceLightStatusBars(true);
        }

        window.setNavigationBarColor(0xFFFFFFFF);
        if (statusCtrl != null) {
            statusCtrl.setAppearanceLightNavigationBars(true);
        }
    }
}

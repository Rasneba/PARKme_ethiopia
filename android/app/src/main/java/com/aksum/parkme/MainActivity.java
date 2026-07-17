package com.aksum.parkme;

import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.plugins.StatusBar;

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
        Window window = getWindow();

        // Prevent edge-to-edge: let the system handle insets natively
        WindowCompat.setDecorFitsSystemWindows(window, true);

        // Status bar: white background, dark icons
        window.setStatusBarColor(0xFFFFFFFF);
        WindowInsetsControllerCompat statusCtrl = WindowCompat.getInsetsController(window, window.getDecorView());
        if (statusCtrl != null) {
            statusCtrl.setAppearanceLightStatusBars(true);
        }

        // Navigation bar: white background, dark icons
        window.setNavigationBarColor(0xFFFFFFFF);
        if (statusCtrl != null) {
            statusCtrl.setAppearanceLightNavigationBars(true);
        }
    }
}

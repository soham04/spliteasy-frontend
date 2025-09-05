import "@/global.css";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Config from "react-native-config";

/**
 * RootLayout
 *
 * Behaviour:
 * - on mount: read token from SecureStore once
 * - if token found: verify `/users/me` once
 * - set `isAuthenticated` + `authLoaded` and then navigate exactly once
 * - while checking, show a spinner (prevents flicker + race redirects)
 */

export default function RootLayout() {
    const router = useRouter();

    const [authLoaded, setAuthLoaded] = useState(false); // finished initial check
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                const token = await SecureStore.getItemAsync("jwt");
                if (!mounted) return;

                if (!token) {
                    console.log("[RootLayout] no token found");
                    setIsAuthenticated(false);
                    setAuthLoaded(true);
                    return;
                }

                // Validate token with backend (one request)
                try {
                    const res = await fetch(`${Config.API_URL}/api/v1/users/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!mounted) return;

                    if (res.ok) {
                        const payload = await res.json();
                        console.log("[RootLayout] authenticated:", payload?.data?.email ?? "unknown email");
                        setIsAuthenticated(true);
                    } else {
                        console.log("[RootLayout] token invalid or expired, deleting token");
                        await SecureStore.deleteItemAsync("jwt");
                        setIsAuthenticated(false);
                    }
                } catch (err) {
                    console.warn("[RootLayout] validation request failed:", err);
                    // conservative: treat as not authenticated
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error("[RootLayout] checkAuth error:", err);
                setIsAuthenticated(false);
            } finally {
                if (mounted) setAuthLoaded(true);
            }
        };

        checkAuth();

        return () => {
            mounted = false;
        };
    }, []);

    // Navigate once after initial check completes.
    useEffect(() => {
        if (!authLoaded) return;

        if (isAuthenticated) {
            // go to main app
            console.log("[RootLayout] routing to (tabs)");
            router.replace("/(tabs)");
        } else {
            // go to welcome/login
            console.log("[RootLayout] routing to / (welcome)");
            router.replace("/");
        }
        // we only want this to run once after authLoaded; don't add router to deps to avoid double-firing
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoaded, isAuthenticated]);

    // While initial auth check is ongoing, show a simple loader to avoid render flicker.
    if (!authLoaded) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 12, color: "#444" }}>Checking authentication…</Text>
            </View>
        );
    }

    // After authLoaded, render the regular stack; navigation already handled above
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="profile-completion" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="group-detail" />
            <Stack.Screen name="expense-detail" />
            <Stack.Screen name="create-group" />
        </Stack>
    );
}
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';

// Ensure auth session is completed
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            // For Expo Go, use the expo linking URL
            // For standalone apps, use the custom scheme
            const redirectUrl = makeRedirectUri({
                scheme: 'simpananku',
                path: 'auth/callback',
            });

            console.log('Redirect URL:', redirectUrl);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                }
            });

            if (error) throw error;

            if (data?.url) {
                console.log('OAuth URL:', data.url);

                // Open browser for OAuth
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    redirectUrl
                );

                console.log('Browser result:', result);

                if (result.type === 'success' && result.url) {
                    // Parse the callback URL - check both hash and query params
                    const url = new URL(result.url);

                    // Try hash params first (implicit flow)
                    let access_token: string | null = null;
                    let refresh_token: string | null = null;

                    if (url.hash) {
                        const hashParams = new URLSearchParams(url.hash.substring(1));
                        access_token = hashParams.get('access_token');
                        refresh_token = hashParams.get('refresh_token');
                    }

                    // Fall back to query params (PKCE flow)
                    if (!access_token) {
                        const queryParams = new URLSearchParams(url.search);
                        access_token = queryParams.get('access_token');
                        refresh_token = queryParams.get('refresh_token');
                    }

                    console.log('Tokens found:', { access_token: !!access_token, refresh_token: !!refresh_token });

                    if (access_token && refresh_token) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token,
                        });
                        if (sessionError) throw sessionError;
                    } else {
                        // If no tokens, try to get session from URL code
                        const code = new URLSearchParams(url.search).get('code');
                        if (code) {
                            console.log('Found code, exchanging for session');
                            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                            if (exchangeError) throw exchangeError;
                        }
                    }
                } else if (result.type === 'cancel') {
                    console.log('User cancelled login');
                }
            }
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert('Error', error.message || 'Gagal login dengan Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logoImage}
                    />
                    <Text style={styles.logoText}>SimpananKu :3</Text>
                    <Text style={styles.tagline}>Simpan catatan Broo :3</Text>
                </View>

                {/* Google Login Button */}
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#4285F4" />
                    ) : (
                        <>
                            <View style={styles.googleIconContainer}>
                                <Text style={styles.googleIcon}>G</Text>
                            </View>
                            <Text style={styles.googleButtonText}>
                                Masuk dengan Google
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Footer */}
                <Text style={styles.footer}>
                    Dengan masuk, kamu setuju dengan{'\n'}
                    <Text style={styles.footerLink}>Ketentuan Layanan</Text> kami
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f9ff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 32,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoImage: {
        width: 120,
        height: 120,
        borderRadius: 24,
        marginBottom: 20,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 14,
        color: '#64748b',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        paddingVertical: 16,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    googleIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4285F4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    googleIcon: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    footer: {
        marginTop: 32,
        textAlign: 'center',
        fontSize: 12,
        color: '#94a3b8',
        lineHeight: 18,
    },
    footerLink: {
        color: '#3b82f6',
    },
});

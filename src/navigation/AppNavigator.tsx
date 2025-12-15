import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AddEditScreen from '../screens/AddEditScreen';

const Stack = createNativeStackNavigator();

// Handle OAuth callback
WebBrowser.maybeCompleteAuthSession();

export default function AppNavigator() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        // Handle deep links for OAuth callback
        const handleDeepLink = async (url: string) => {
            if (url.includes('access_token') || url.includes('code=')) {
                // Extract tokens from URL
                const parsedUrl = new URL(url);
                const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
                const queryParams = new URLSearchParams(parsedUrl.search);

                const access_token = hashParams.get('access_token') || queryParams.get('access_token');
                const refresh_token = hashParams.get('refresh_token') || queryParams.get('refresh_token');

                if (access_token && refresh_token) {
                    await supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    });
                }
            }
        };

        // Listen for incoming links
        const linkingSubscription = Linking.addEventListener('url', (event) => {
            handleDeepLink(event.url);
        });

        // Check if app was opened from a link
        Linking.getInitialURL().then((url) => {
            if (url) handleDeepLink(url);
        });

        return () => {
            subscription.unsubscribe();
            linkingSubscription.remove();
        };
    }, []);

    if (loading) {
        return null;
    }

    // Deep linking configuration
    const linking = {
        prefixes: ['simpananku://', 'exp://'],
        config: {
            screens: {
                Home: 'home',
                AddEdit: 'add-edit',
                Login: 'login',
            },
        },
    };

    return (
        <NavigationContainer linking={linking}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {session ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen
                            name="AddEdit"
                            component={AddEditScreen}
                            options={{
                                animation: 'slide_from_bottom',
                            }}
                        />
                    </>
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

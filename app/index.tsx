import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Config from "react-native-config";

const WelcomeScreen = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const handleEmailLogin = async () => {
    try {
      const res = await fetch(`${Config.API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.jwt) {
        await SecureStore.setItemAsync("jwt", data.jwt);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login failed", data.message || "Invalid credentials");
      }
    } catch (err) {
      Alert.alert("Error", "Could not log in");
      console.error(err);
    }
  };

  const goToSignup = () => {
    // Move to profile completion for full registration
    router.push({
      pathname: "/profile-completion",
      params: { email, password, provider: "email" },
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await GoogleSignin.signIn();

      // ✅ Null / cancel check
      if (!result) {
        Alert.alert("Cancelled", "Google sign-in was cancelled.");
        return;
      }

      const idToken = result.data?.idToken;
      const user = result.data?.user;

      if (!idToken) {
        Alert.alert("Error", "No ID token returned from Google.");
        return;
      }

      if (!user || !user.email) {
        Alert.alert("Error", "No user info returned from Google.");
        return;
      }

      // ✅ Send token to backend
      const response = await fetch(`${Config.API_URL}/api/v1/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await response.json();

      if (data.jwt) {
        // Existing user
        await SecureStore.setItemAsync("jwt", data.jwt);
        router.replace("/(tabs)");
      } else if (data.status === "new_user") {
        // New user → profile completion
        router.push({
          pathname: "/profile-completion",
          params: {
            email: data.email,
            name: data.name,
            provider: "google",
            token: idToken,
          },
        });
      } else {
        Alert.alert("Error", "Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      Alert.alert("Sign-In failed", error?.message || "Please try again.");
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#111827', '#4B5563']}
        className="flex-1"
      >
        {/* Header Section */}
        <View className="pt-16 pb-8 px-6 items-center">
          <View className="w-24 h-24 rounded-full bg-white/10 items-center justify-center mb-6">
            <Image
              source={require('../assets/images/icon.png')}
              style={{ width: 72, height: 72, borderRadius: 36 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-3xl font-bold text-white text-center mb-2">
            Split Easy
          </Text>
          <Text className="text-gray-300 text-center px-8">
            Split bills easily with friends and family
          </Text>
        </View>

        {/* Auth Card */}
        <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-12">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {'Welcome Back!'}
          </Text>
          <Text className="text-gray-500 mb-8">
            {'Sign in to continue'}
          </Text>

          {/* Auth Form */}
          <View className="mb-6">

            {/* Email Input */}
            <View className="mb-4">
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                <Mail size={20} color="#6B7280" />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-gray-500">Email Address</Text>
                  <View className="flex-row items-center">
                    <TextInput
                      className="flex-1 text-gray-900"
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                <Lock size={20} color="#6B7280" />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-gray-500">Password</Text>
                  <View className="flex-row items-center">
                    <TextInput
                      className="flex-1 text-gray-900"
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff size={20} color="#6B7280" />
                      ) : (
                        <Eye size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Forgot Password (only for login) */}
            <TouchableOpacity className="items-end mb-6">
              <Text className="text-blue-500 font-medium">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Auth Button */}
            <TouchableOpacity
              className="bg-[#84CC16] rounded-xl py-4 items-center mb-6"
              onPress={handleEmailLogin}
            >
              <Text className="text-white font-bold text-lg">
                {'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Social Login */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="text-gray-500 mx-4">or continue with</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              <View className="flex-row justify-center gap-4 mb-6">
                {/* <TouchableOpacity
                  className="bg-gray-100 rounded-full w-12 h-12 items-center justify-center"
                  onPress={handleGoogleSignIn}
                >
                  <Image
                    source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Google_%22G%22_Logo.svg" }}
                    className="w-8 h-8"
                    resizeMode="contain"
                  />
                </TouchableOpacity> */}

                <GoogleSigninButton
                  size={GoogleSigninButton.Size.Icon}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={handleGoogleSignIn}
                  disabled={false}
                />

              </View>
            </View>

            {/* Toggle Auth Mode */}
            <View className="flex-row justify-center">
              <Text className="text-gray-500">
                {"Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={goToSignup}>
                <Text className="text-blue-500 font-medium">
                  {'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

export default WelcomeScreen;
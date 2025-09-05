import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Camera, Lock, Mail, Smartphone, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ProfileScreen = () => {
    const router = useRouter();

    const params = useLocalSearchParams<{ name?: string, email?: string; provider?: string, token?: string }>();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState(params.email || "");
    const isGoogleAuth = params.provider === "google";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Using one of the avatar images from the tool
    const profileImage = 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fHVzZXJ8ZW58MHx8MHx8fDA%3D';
    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert("Missing Information", "Please enter your name");
            return;
        }
        if (!phone.trim()) {
            Alert.alert("Missing Information", "Please enter your phone number");
            return;
        }
        if (!gender) {
            Alert.alert("Missing Information", "Please select your gender");
            return;
        }

        try {
            let res;

            if (isGoogleAuth) {
                // ✅ Google signup
                res = await fetch(`https://d5a0296a002a.ngrok-free.app/api/v1/auth/google/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token: params.token,
                        email,
                        name,
                        phone,
                        gender,
                    }),
                });
            } else {
                // ✅ Email signup
                if (!password || !confirmPassword) {
                    Alert.alert("Error", "Password is required");
                    return;
                }
                if (password !== confirmPassword) {
                    Alert.alert("Error", "Passwords do not match");
                    return;
                }

                res = await fetch(`https://d5a0296a002a.ngrok-free.app/api/v1/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        password,
                        name,
                        phone,
                        gender,
                    }),
                });
            }

            const data = await res.json();

            if (data.jwt) {
                await SecureStore.setItemAsync("jwt", data.jwt);
                router.replace("/(tabs)");
            } else {
                Alert.alert("Error", data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Profile completion error:", error);
            Alert.alert("Error", "Something went wrong while saving profile.");
        }
    };


    const genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
        { label: 'Prefer not to say', value: 'prefer_not_to_say' }
    ];

    return (
        <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ flexGrow: 1 }}>
            <LinearGradient colors={["#111827", "#4B5563"]} className="flex-1">
                {/* Header Section */}
                <View className="pt-16 pb-8 px-6 items-center">
                    <Text className="text-3xl font-bold text-white text-center mb-2">Complete Your Profile</Text>
                    <Text className="text-gray-300 text-center px-8">
                        We need a few more details to complete your account
                    </Text>
                </View>

                {/* Profile Card */}
                <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-12">
                    {/* Profile Picture Section */}
                    <View className="items-center mb-8">
                        <View className="relative">
                            <Image
                                source={{ uri: profileImage }}
                                className="w-24 h-24 rounded-full border-4 border-green-500"
                            />
                            <TouchableOpacity className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-2 border-white">
                                <Camera size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Profile Form */}
                    <View className="mb-6">
                        {/* Email */}
                        <View className="mb-6">
                            <Text className="text-gray-500 text-sm mb-2">Email</Text>
                            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                                <Mail size={20} color="#6B7280" />
                                {isGoogleAuth ? (
                                    <Text className="flex-1 text-gray-900 ml-3" numberOfLines={1}>
                                        {email}
                                    </Text>
                                ) : (
                                    <TextInput
                                        className="flex-1 text-gray-900 ml-3"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                )}
                            </View>
                        </View>

                        {/* Name Input */}
                        <View className="mb-6">
                            <Text className="text-gray-500 text-sm mb-2">Full Name</Text>
                            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                                <User size={20} color="#6B7280" />
                                <TextInput
                                    className="flex-1 text-gray-900 ml-3"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        {/* Phone Input */}
                        <View className="mb-6">
                            <Text className="text-gray-500 text-sm mb-2">Phone Number</Text>
                            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                                <Smartphone size={20} color="#6B7280" />
                                <TextInput
                                    className="flex-1 text-gray-900 ml-3"
                                    placeholder="Enter your phone number"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        {/* Gender */}
                        <View className="mb-8">
                            <Text className="text-gray-500 text-sm mb-2">Gender</Text>
                            <View className="bg-gray-100 rounded-xl overflow-hidden">
                                {genderOptions.map((option, index) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        className={`py-3 px-4 ${index !== genderOptions.length - 1 ? "border-b border-gray-200" : ""
                                            } ${gender === option.value ? "bg-green-50" : "bg-transparent"}`}
                                        onPress={() => setGender(option.value)}
                                    >
                                        <Text
                                            className={`text-center ${gender === option.value ? "text-green-600 font-medium" : "text-gray-700"
                                                }`}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Passwords (only for email signup) */}
                        {!isGoogleAuth && (
                            <>
                                <View className="mb-6">
                                    <Text className="text-gray-500 text-sm mb-2">Password</Text>
                                    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                                        <Lock size={20} color="#6B7280" />
                                        <TextInput
                                            className="flex-1 text-gray-900 ml-3"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry
                                        />
                                    </View>
                                </View>

                                <View className="mb-6">
                                    <Text className="text-gray-500 text-sm mb-2">Confirm Password</Text>
                                    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                                        <Lock size={20} color="#6B7280" />
                                        <TextInput
                                            className="flex-1 text-gray-900 ml-3"
                                            placeholder="Confirm your password"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Submit */}
                        <TouchableOpacity
                            className="bg-[#84CC16] rounded-xl py-4 items-center"
                            onPress={handleSubmit}
                        >
                            <Text className="text-white font-bold text-lg">Save Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </ScrollView>
    );
};

export default ProfileScreen;
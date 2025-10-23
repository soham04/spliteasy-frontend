import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
    Bell,
    Camera,
    ChevronRight,
    Download,
    Globe,
    HelpCircle,
    Lock,
    LogOut,
    Mail,
    Shield,
    Smartphone,
    User
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import Config from "react-native-config";
import { useAuthStore } from './../../hooks/Auth';

type UserProfile = {
    id: number;
    email: string;
    name: string;
    phone: string;
    gender: string | boolean | null;
};

const ProfileScreen = () => {
    const router = useRouter();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);

    const jwt = useAuthStore((state) => state.jwt);
    const setJwt = useAuthStore((state) => state.setJwt);

    const [user, setUser] = useState<UserProfile | null>(null);

    const handleEditProfile = () => {
        Alert.alert('Edit Profile', 'This would open the profile editing screen');
    };

    const handleExportData = () => {
        Alert.alert('Export Data', 'Your data export has started. You will receive an email when it\'s ready.');
    };

    const handleHelp = () => {
        Alert.alert('Help Center', 'This would open the help center');
    };

    const handleChangePassword = () => {
        Alert.alert('Change Password', 'This would open the password change screen');
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive' }
            ]
        );
    };

    const handleLogout = async () => {
        try {
            // clear secure storage
            await SecureStore.deleteItemAsync("jwt");
            await SecureStore.deleteItemAsync("user");

            // debug: confirm deletion
            const leftover = await SecureStore.getItemAsync("jwt");
            console.log("after delete, jwt:", leftover);

            // navigate to welcome screen
            router.replace("/");

            // optionally also clear any client global state (e.g. zustand)
            // setJwt(null);
        } catch (err) {
            console.error("Logout failed", err);
            // show user-friendly message
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await SecureStore.getItemAsync("jwt");
                if (!token) {
                    setUser(null);
                    return;
                }

                const res = await fetch(`${Config.API_URL}/api/v1/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    setUser(null);
                    return;
                }

                const json = await res.json();
                console.log("Fetched user:", json);
                setUser(json.data); // ✅ only set actual user object
            } catch (err) {
                console.error("Failed to fetch user:", err);
                setUser(null);
            }
        };

        loadUser();
    }, []);

    // build a safe seed string
    const seed = encodeURIComponent((user?.name ?? 'anonymous').replace(/\s+/g, ''));

    // use the PNG endpoint (Image can render this)
    const avatarUri = `https://api.dicebear.com/7.x/identicon/png?seed=${seed}`;

    return (
        <SafeAreaView className="flex-1 bg-[#111827]">
            <View className="flex-1 bg-gray-50">
                <ScrollView className="flex-1 px-4 py-6">
                    {/* Profile Header */}
                    <View className="items-center mb-8">
                        <View className="relative">
                            <Image
                                source={{ uri: avatarUri }}
                                style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: '#10B981' }}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-2 border-white"
                                onPress={handleEditProfile}
                            >
                                <Camera size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 mt-4">
                            {user?.name || "Loading..."}
                        </Text>
                        <Text className="text-gray-500 mt-1">
                            {user?.email || ""}
                        </Text>
                        <Text className="text-green-600 font-medium mt-2">Premium Member</Text>
                    </View>

                    {/* Personal Information Section */}
                    <View className="bg-white rounded-xl shadow-sm mb-6">
                        <View className="p-4 border-b border-gray-100">
                            <Text className="text-lg font-semibold text-gray-900">Personal Information</Text>
                        </View>

                        <TouchableOpacity
                            className="flex-row items-center p-4"
                            onPress={handleEditProfile}
                        >
                            <User size={20} color="#6B7280" />
                            <Text className="flex-1 ml-4 text-gray-700">Edit Profile</Text>
                            <ChevronRight size={20} color="#6B7280" />
                        </TouchableOpacity>

                        <View className="flex-row items-center p-4">
                            <Mail size={20} color="#6B7280" />
                            <Text className="flex-1 ml-4 text-gray-700">{user?.email}</Text>
                        </View>

                        <View className="flex-row items-center p-4">
                            <Smartphone size={20} color="#6B7280" />
                            <Text className="flex-1 ml-4 text-gray-700">
                                {user?.phone || "Not provided"}
                            </Text>
                        </View>
                    </View>

                    {/* Notification Settings */}
                    <View className="bg-white rounded-xl shadow-sm mb-6">
                        <View className="p-4 border-b border-gray-100">
                            <View className="flex-row items-center">
                                <Bell size={20} color="#6B7280" />
                                <Text className="text-lg font-semibold text-gray-900 ml-2">Notifications</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between p-4">
                            <Text className="text-gray-700">Enable Notifications</Text>
                            <Switch
                                trackColor={{ false: "#D1D5DB", true: "#84CC16" }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#D1D5DB"
                                onValueChange={setNotificationsEnabled}
                                value={notificationsEnabled}
                            />
                        </View>

                        {notificationsEnabled && (
                            <>
                                <View className="flex-row items-center justify-between p-4 border-t border-gray-100">
                                    <Text className="text-gray-700 ml-8">Email Notifications</Text>
                                    <Switch
                                        trackColor={{ false: "#D1D5DB", true: "#84CC16" }}
                                        thumbColor="#FFFFFF"
                                        ios_backgroundColor="#D1D5DB"
                                        onValueChange={setEmailNotifications}
                                        value={emailNotifications}
                                    />
                                </View>

                                <View className="flex-row items-center justify-between p-4 border-t border-gray-100">
                                    <Text className="text-gray-700 ml-8">SMS Notifications</Text>
                                    <Switch
                                        trackColor={{ false: "#D1D5DB", true: "#84CC16" }}
                                        thumbColor="#FFFFFF"
                                        ios_backgroundColor="#D1D5DB"
                                        onValueChange={setSmsNotifications}
                                        value={smsNotifications}
                                    />
                                </View>

                                <View className="flex-row items-center justify-between p-4 border-t border-gray-100">
                                    <Text className="text-gray-700 ml-8">Push Notifications</Text>
                                    <Switch
                                        trackColor={{ false: "#D1D5DB", true: "#84CC16" }}
                                        thumbColor="#FFFFFF"
                                        ios_backgroundColor="#D1D5DB"
                                        onValueChange={setPushNotifications}
                                        value={pushNotifications}
                                    />
                                </View>
                            </>
                        )}
                    </View>

                    {/* Preferences */}
                    <View className="bg-white rounded-xl shadow-sm mb-6">
                        <View className="p-4 border-b border-gray-100">
                            <View className="flex-row items-center">
                                <Globe size={20} color="#6B7280" />
                                <Text className="text-lg font-semibold text-gray-900 ml-2">Preferences</Text>
                            </View>
                        </View>

                        <TouchableOpacity className="flex-row items-center justify-between p-4">
                            <Text className="text-gray-700">Currency</Text>
                            <View className="flex-row items-center">
                                <Text className="text-gray-500 mr-2">USD ($)</Text>
                                <ChevronRight size={20} color="#6B7280" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-between p-4 border-t border-gray-100">
                            <Text className="text-gray-700">Language</Text>
                            <View className="flex-row items-center">
                                <Text className="text-gray-500 mr-2">English</Text>
                                <ChevronRight size={20} color="#6B7280" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Data & Privacy */}
                    <View className="bg-white rounded-xl shadow-sm mb-6">
                        <View className="p-4 border-b border-gray-100">
                            <View className="flex-row items-center">
                                <Shield size={20} color="#6B7280" />
                                <Text className="text-lg font-semibold text-gray-900 ml-2">Data & Privacy</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4"
                            onPress={handleExportData}
                        >
                            <View className="flex-row items-center">
                                <Download size={20} color="#6B7280" />
                                <Text className="ml-4 text-gray-700">Export Data</Text>
                            </View>
                            <ChevronRight size={20} color="#6B7280" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4 border-t border-gray-100"
                            onPress={handleChangePassword}
                        >
                            <View className="flex-row items-center">
                                <Lock size={20} color="#6B7280" />
                                <Text className="ml-4 text-gray-700">Change Password</Text>
                            </View>
                            <ChevronRight size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Help & Support */}
                    <View className="bg-white rounded-xl shadow-sm mb-6">
                        <View className="p-4 border-b border-gray-100">
                            <View className="flex-row items-center">
                                <HelpCircle size={20} color="#6B7280" />
                                <Text className="text-lg font-semibold text-gray-900 ml-2">Help & Support</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4"
                            onPress={handleHelp}
                        >
                            <Text className="text-gray-700">Help Center</Text>
                            <ChevronRight size={20} color="#6B7280" />
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-between p-4 border-t border-gray-100">
                            <Text className="text-gray-700">Contact Us</Text>
                            <ChevronRight size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Account Management */}
                    <View className="bg-white rounded-xl shadow-sm mb-6">
                        <View className="p-4 border-b border-gray-100">
                            <Text className="text-lg font-semibold text-gray-900">Account Management</Text>
                        </View>

                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4"
                            onPress={handleLogout}
                        >
                            <View className="flex-row items-center">
                                <LogOut size={20} color="#DC2626" />
                                <Text className="ml-4 text-red-600 font-medium">Logout</Text>
                            </View>
                            <ChevronRight size={20} color="#DC2626" />
                        </TouchableOpacity>

                        {/* <TouchableOpacity
                            className="flex-row items-center justify-between p-4 border-t border-gray-100"
                            onPress={handleDeleteAccount}
                        >
                            <View className="flex-row items-center">
                                <Trash2 size={20} color="#DC2626" />
                                <Text className="ml-4 text-red-600 font-medium">Delete Account</Text>
                            </View>
                            <ChevronRight size={20} color="#DC2626" />
                        </TouchableOpacity> */}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default ProfileScreen;

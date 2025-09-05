import { Tabs } from "expo-router";
import { Calendar, Plus, User, Users, Wallet } from "lucide-react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#3B82F6",
                tabBarInactiveTintColor: "#6B7280",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => <Wallet size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name="add-expense"
                options={{
                    title: "Add",
                    tabBarIcon: ({ color }) => <Plus size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name="activity-feed"
                options={{
                    title: "Activity",
                    tabBarIcon: ({ color }) => <Calendar size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name="groups"
                options={{
                    title: "Groups",
                    tabBarIcon: ({ color }) => <Users size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <User size={20} color={color} />,
                }}
            />
        </Tabs>
    );
}

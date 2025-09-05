import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Car, Coffee, Pizza, Plus, ShoppingCart, Users, Wallet } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const ExpenseSplitterHomeScreen = () => {
  const router = useRouter();
  const [netBalance, setNetBalance] = useState(24.50);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, title: "Dinner at Italian Place", amount: 32.40, date: "Today", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHx8MA%3D%3D", type: "debit" },
    { id: 2, title: "Uber Ride", amount: 12.50, date: "Yesterday", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fHVzZXJ8ZW58MHx8MHx8fDA%3D", type: "credit" },
    { id: 3, title: "Groceries", amount: 45.75, date: "May 12", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHVzZXJ8ZW58MHx8MHx8fDA%3D", type: "debit" },
  ]);
  const [quickActions] = useState([
    { id: 1, title: "Equal Split", icon: <Users size={24} color="#111827" />, color: "bg-blue-100" },
    { id: 2, title: "Food", icon: <Pizza size={24} color="#111827" />, color: "bg-orange-100" },
    { id: 3, title: "Transport", icon: <Car size={24} color="#111827" />, color: "bg-green-100" },
    { id: 4, title: "Shopping", icon: <ShoppingCart size={24} color="#111827" />, color: "bg-purple-100" },
  ]);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Good afternoon,</Text>
            <Text className="text-lg text-gray-600">Alex!</Text>
          </View>
          <TouchableOpacity className="bg-gray-100 rounded-full p-3">
            <Wallet size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View className="rounded-2xl overflow-hidden shadow-lg">
          <LinearGradient
            colors={["#111827", "#4B5563"]}
            style={{ borderRadius: 16 }}
            className="p-10"
          >
            <View className='p-4'>
              <Text className="text-gray-300 text-sm mb-1">Your balance</Text>
              <Text className="text-white text-3xl font-bold mb-4">
                {netBalance >= 0
                  ? `+$${netBalance.toFixed(2)}`
                  : `-$${Math.abs(netBalance).toFixed(2)}`}
              </Text>

              <View className="flex-row justify-between">
                <View>
                  <Text className="text-gray-300 text-xs">You'll receive</Text>
                  <Text className="text-green-400 font-bold">$64.20</Text>
                </View>
                <View>
                  <Text className="text-gray-300 text-xs">You owe</Text>
                  <Text className="text-red-400 font-bold">$39.70</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>


      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Quick actions</Text>
            <TouchableOpacity>
              <Text className="text-blue-500">See all</Text>
            </TouchableOpacity>
          </View>

          {/* Grid */}
          <View className="flex-row flex-wrap justify-between">
            {/* First Static Card */}
            <TouchableOpacity className="w-[48%] mb-4">
              <View className="bg-white rounded-xl p-4 shadow-sm">
                <View className="bg-blue-100 rounded-full w-12 h-12 items-center justify-center mb-3">
                  <Plus size={24} color="#111827" />
                </View>
                <Text className="font-medium text-gray-900">New expense</Text>
              </View>
            </TouchableOpacity>

            {/* Dynamic Cards */}
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} className="w-[48%] mb-4">
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <View
                    className={`${action.color} rounded-full w-12 h-12 items-center justify-center mb-3`}
                  >
                    {action.icon}
                  </View>
                  <Text className="font-medium text-gray-900">{action.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        {/* Recent Activity */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Recent activity</Text>
            <TouchableOpacity onPress={() => { router.replace('/(tabs)/activity-feed') }}>
              <Text className="text-blue-500">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl shadow-sm">
            {recentActivity.map((activity, index) => (
              <TouchableOpacity
                key={activity.id}
                className={`flex-row items-center p-4 ${index !== recentActivity.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <Image
                  source={{ uri: activity.avatar }}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">{activity.title}</Text>
                  <Text className="text-gray-500 text-sm">{activity.date}</Text>
                </View>
                <Text className={`font-bold ${activity.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                  {activity.type === 'credit' ? `+$${activity.amount.toFixed(2)}` : `-$${activity.amount.toFixed(2)}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Groups Preview */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Your groups</Text>
            <TouchableOpacity onPress={() => { router.replace('/(tabs)/groups') }}>
              <Text className="text-blue-500">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center mb-3">
                <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center">
                  <Users size={20} color="#111827" />
                </View>
                <Text className="font-bold text-gray-900 ml-3">Apartment</Text>
              </View>
              <Text className="text-gray-500 text-sm mb-2">4 members</Text>
              <Text className="text-green-500 font-bold">$24.50</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center mb-3">
                <View className="bg-orange-100 w-10 h-10 rounded-full items-center justify-center">
                  <Coffee size={20} color="#111827" />
                </View>
                <Text className="font-bold text-gray-900 ml-3">Friends</Text>
              </View>
              <Text className="text-gray-500 text-sm mb-2">6 members</Text>
              <Text className="text-red-500 font-bold">-$12.30</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

    </View>
  );
};

export default ExpenseSplitterHomeScreen;
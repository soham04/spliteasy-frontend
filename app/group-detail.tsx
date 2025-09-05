import { useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft,
    Calendar,
    Check,
    DollarSign,
    Edit3,
    Plus,
    Trash2,
    UserPlus,
    X
} from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GroupDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('expenses');
    const [newMemberName, setNewMemberName] = useState('');
    const [isAddingMember, setIsAddingMember] = useState(false);

    const groupData = {
        id: '1',
        name: 'Apartment Sharing',
        members: 4,
        balance: -24.50,
        image: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8R3JvdXAlMjBwZW9wbGUlMjBmcmllbmRzJTIwdGVhbSUyMHRvZ2V0aGVyfGVufDB8fDB8fHww',
        lastActivity: '2 days ago',
        isActive: true
    };

    const members = [
        { id: '1', name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHx8MA%3D%3D', balance: -12.25 },
        { id: '2', name: 'Taylor Smith', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fHVzZXJ8ZW58MHx8MHx8fDA%3D', balance: 8.75 },
        { id: '3', name: 'Jordan Williams', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHVzZXJ8ZW58MHx8MHx8fDA%3D', balance: -4.50 },
        { id: '4', name: 'Morgan Davis', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fHVzZXJ8ZW58MHx8MHx8fDA%3D', balance: 8.00 }
    ];

    const expenses = [
        { id: '1', title: 'Groceries', amount: 45.75, paidBy: 'Alex Johnson', date: '2023-05-15', category: 'Food' },
        { id: '2', title: 'Electricity Bill', amount: 85.20, paidBy: 'Taylor Smith', date: '2023-05-10', category: 'Utilities' },
        { id: '3', title: 'Netflix Subscription', amount: 15.99, paidBy: 'Jordan Williams', date: '2023-05-05', category: 'Entertainment' },
        { id: '4', title: 'Dinner Out', amount: 68.40, paidBy: 'Morgan Davis', date: '2023-05-01', category: 'Food' }
    ];

    const handleAddMember = () => {
        if (newMemberName.trim()) {
            console.log(`Adding member: ${newMemberName}`);
            setNewMemberName('');
            setIsAddingMember(false);
        }
    };

    const handleRemoveMember = (memberId: string) => {
        console.log(`Removing member with ID: ${memberId}`);
    };

    const handleSettleBalance = (memberId: string) => {
        console.log(`Settling balance for member ID: ${memberId}`);
    };

    const renderMemberItem = ({ item }: { item: any }) => (
        <View className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 shadow-sm">
            <View className="flex-row items-center">
                <Image
                    source={{ uri: item.avatar }}
                    className="w-12 h-12 rounded-full"
                />
                <View className="ml-3">
                    <Text className="font-semibold text-gray-900">{item.name}</Text>
                    <Text className={`text-sm ${item.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.balance >= 0 ? '+' : ''}{item.balance.toFixed(2)}
                    </Text>
                </View>
            </View>

            <View className="flex-row">
                <TouchableOpacity
                    className="bg-green-100 rounded-full p-2 mr-2"
                    onPress={() => handleSettleBalance(item.id)}
                >
                    <DollarSign size={16} color="#16A34A" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="bg-red-100 rounded-full p-2"
                    onPress={() => handleRemoveMember(item.id)}
                >
                    <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderExpenseItem = ({ item }: { item: any }) => (
        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <View className="flex-row justify-between items-start">
                <View>
                    <Text className="font-semibold text-gray-900">{item.title}</Text>
                    <Text className="text-gray-600 text-sm mt-1">Paid by {item.paidBy}</Text>
                </View>
                <Text className="font-bold text-lg text-gray-900">${item.amount.toFixed(2)}</Text>
            </View>

            <View className="flex-row items-center mt-3">
                <View className="bg-blue-100 rounded-full px-3 py-1">
                    <Text className="text-blue-700 text-xs font-medium">{item.category}</Text>
                </View>
                <View className="flex-row items-center ml-3">
                    <Calendar size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-sm ml-1">{item.date}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 pt-12 pb-4 shadow-sm">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity className="mr-3">
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900 flex-1">{groupData.name}</Text>
                    <TouchableOpacity className="bg-green-500 rounded-full p-2">
                        <Edit3 size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center">
                    <Image
                        source={{ uri: groupData.image }}
                        className="w-16 h-16 rounded-xl"
                    />
                    <View className="ml-4">
                        <Text className="text-2xl font-bold text-gray-900">{groupData.members} Members</Text>
                        <View className="flex-row items-center mt-1">
                            <DollarSign size={16} color={groupData.balance >= 0 ? "#16A34A" : "#DC2626"} />
                            <Text className={`text-lg font-semibold ml-1 ${groupData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {groupData.balance >= 0 ? '+' : ''}{groupData.balance.toFixed(2)}
                            </Text>
                        </View>
                        <Text className="text-gray-500 text-sm mt-1">Last activity: {groupData.lastActivity}</Text>
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-white border-b border-gray-200">
                <TouchableOpacity
                    className={`flex-1 py-4 items-center ${activeTab === 'expenses' ? 'border-b-2 border-green-500' : ''}`}
                    onPress={() => setActiveTab('expenses')}
                >
                    <Text className={`font-medium ${activeTab === 'expenses' ? 'text-green-600' : 'text-gray-500'}`}>Expenses</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-4 items-center ${activeTab === 'members' ? 'border-b-2 border-green-500' : ''}`}
                    onPress={() => setActiveTab('members')}
                >
                    <Text className={`font-medium ${activeTab === 'members' ? 'text-green-600' : 'text-gray-500'}`}>Members</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-4 items-center ${activeTab === 'settle' ? 'border-b-2 border-green-500' : ''}`}
                    onPress={() => setActiveTab('settle')}
                >
                    <Text className={`font-medium ${activeTab === 'settle' ? 'text-green-600' : 'text-gray-500'}`}>Settle</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 px-4 py-4">
                {activeTab === 'expenses' && (
                    <View>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold text-gray-900">Recent Expenses</Text>
                            <TouchableOpacity className="flex-row items-center bg-green-500 rounded-full px-4 py-2">
                                <Plus size={16} color="white" />
                                <Text className="text-white font-medium ml-1">Add</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={expenses}
                            keyExtractor={(item) => item.id}
                            renderItem={renderExpenseItem}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}

                {activeTab === 'members' && (
                    <View>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold text-gray-900">Group Members</Text>
                            <TouchableOpacity
                                className="flex-row items-center bg-green-500 rounded-full px-4 py-2"
                                onPress={() => setIsAddingMember(true)}
                            >
                                <UserPlus size={16} color="white" />
                                <Text className="text-white font-medium ml-1">Add</Text>
                            </TouchableOpacity>
                        </View>

                        {isAddingMember && (
                            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                                <Text className="font-semibold text-gray-900 mb-2">Add New Member</Text>
                                <View className="flex-row">
                                    <TextInput
                                        className="flex-1 bg-gray-100 rounded-lg px-4 py-2 mr-2"
                                        placeholder="Enter name"
                                        value={newMemberName}
                                        onChangeText={setNewMemberName}
                                    />
                                    <TouchableOpacity
                                        className="bg-green-500 rounded-lg px-4 py-2 mr-2"
                                        onPress={handleAddMember}
                                    >
                                        <Check size={20} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="bg-gray-200 rounded-lg px-4 py-2"
                                        onPress={() => setIsAddingMember(false)}
                                    >
                                        <X size={20} color="#111827" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <FlatList
                            data={members}
                            keyExtractor={(item) => item.id}
                            renderItem={renderMemberItem}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}

                {activeTab === 'settle' && (
                    <View>
                        <View className="bg-white rounded-xl shadow-sm p-5 mb-4">
                            <Text className="text-lg font-semibold text-gray-900 mb-3">Settle Group Balance</Text>
                            <Text className="text-gray-600 mb-4">
                                The total group balance is {groupData.balance >= 0 ? '+' : ''}{groupData.balance.toFixed(2)}.
                                Here's how you can settle it:
                            </Text>

                            <View className="bg-green-50 rounded-lg p-4 mb-4">
                                <Text className="font-medium text-green-800">Recommended Settlement</Text>
                                <Text className="text-green-700 mt-1">
                                    Alex owes $12.25 to the group. Taylor and Morgan can settle with Alex directly.
                                </Text>
                            </View>

                            <TouchableOpacity className="bg-green-500 rounded-xl py-3 items-center">
                                <Text className="text-white font-semibold">Record Settlement</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="bg-white rounded-xl shadow-sm p-5">
                            <Text className="text-lg font-semibold text-gray-900 mb-3">Settlement History</Text>
                            <Text className="text-gray-500 text-center py-8">No settlements recorded yet</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default GroupDetailScreen;
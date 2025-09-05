import { useRouter } from 'expo-router';
import {
    ChevronRight,
    DollarSign,
    Eye,
    Plus,
    Search,
    UserPlus,
    Users
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const router = useRouter();

const GroupsScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Mock data for groups
    const groups = [
        {
            id: '1',
            name: 'Apartment Sharing',
            members: 4,
            balance: -24.50,
            image: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8R3JvdXAlMjBwZW9wbGUlMjBmcmllbmRzJTIwdGVhbSUyMHRvZ2V0aGVyfGVufDB8fDB8fHww',
            lastActivity: '2 days ago',
            isActive: true
        },
        {
            id: '2',
            name: 'Vacation Trip',
            members: 6,
            balance: 120.75,
            image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QnVzaW5lc3MlMjBoYW5kc2hha2V8ZW58MHx8MHx8fDA%3D',
            lastActivity: '1 week ago',
            isActive: true
        },
        {
            id: '3',
            name: 'Work Project',
            members: 3,
            balance: 0,
            image: 'https://images.unsplash.com/photo-1576267423048-15c0040fec78?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y29sbGFib3JhdGlvbiUyMHN1Y2Nlc3N8ZW58MHx8MHx8fDA%3D',
            lastActivity: '3 weeks ago',
            isActive: false
        },
        {
            id: '4',
            name: 'Family Dinner',
            members: 8,
            balance: -15.25,
            image: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8RmluYW5jZSUyMGFjY291bnRpbmd8ZW58MHx8MHx8fDA%3D',
            lastActivity: 'Yesterday',
            isActive: true
        }
    ];

    const filteredGroups = groups.filter(group => {
        const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'all' ||
            (selectedFilter === 'active' && group.isActive) ||
            (selectedFilter === 'inactive' && !group.isActive);
        return matchesSearch && matchesFilter;
    });

    const handleCreateGroup = () => {
        router.push("/create-group");
    };

    const handleViewGroup = (groupId: string) => {
        router.push({
            pathname: "/group-detail",
            params: { id: groupId },
        });
    };

    const handleAddMembers = (groupId: string) => {
        console.log(`Add members to group ${groupId}`);
    };

    const handleSettleBalance = (groupId: string) => {
        console.log(`Settle balance for group ${groupId}`);
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 pt-12 pb-4 shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-gray-900">Groups</Text>
                    <TouchableOpacity
                        className="bg-green-500 rounded-full p-3 shadow-md"
                        onPress={handleCreateGroup}
                    >
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
                    <Search size={20} color="#6B7280" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-700"
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filter Options */}
                <View className="flex-row mb-2">
                    <TouchableOpacity
                        className={`px-4 py-2 rounded-full mr-2 ${selectedFilter === 'all' ? 'bg-green-100 border border-green-500' : 'bg-gray-100'}`}
                        onPress={() => setSelectedFilter('all')}
                    >
                        <Text className={`text-sm font-medium ${selectedFilter === 'all' ? 'text-green-700' : 'text-gray-600'}`}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`px-4 py-2 rounded-full mr-2 ${selectedFilter === 'active' ? 'bg-green-100 border border-green-500' : 'bg-gray-100'}`}
                        onPress={() => setSelectedFilter('active')}
                    >
                        <Text className={`text-sm font-medium ${selectedFilter === 'active' ? 'text-green-700' : 'text-gray-600'}`}>Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`px-4 py-2 rounded-full ${selectedFilter === 'inactive' ? 'bg-green-100 border border-green-500' : 'bg-gray-100'}`}
                        onPress={() => setSelectedFilter('inactive')}
                    >
                        <Text className={`text-sm font-medium ${selectedFilter === 'inactive' ? 'text-green-700' : 'text-gray-600'}`}>Inactive</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Groups List */}
            <ScrollView className="flex-1 px-4 py-4">
                {filteredGroups.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-12">
                        <Text className="text-gray-500 text-lg">No groups found</Text>
                        <Text className="text-gray-400 mt-2">Try changing your search or filter</Text>
                    </View>
                ) : (
                    filteredGroups.map((group) => (
                        <View
                            key={group.id}
                            className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
                        >
                            <TouchableOpacity
                                className="flex-row items-center p-4"
                                onPress={() => handleViewGroup(group.id)}
                            >
                                <View className="relative">
                                    <Image
                                        source={{ uri: group.image }}
                                        className="w-16 h-16 rounded-xl"
                                    />
                                    <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border-2 border-white">
                                        <Users size={12} color="#6B7280" />
                                    </View>
                                </View>

                                <View className="flex-1 ml-4">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-lg font-semibold text-gray-900">{group.name}</Text>
                                        <Text className="text-xs text-gray-500">{group.lastActivity}</Text>
                                    </View>

                                    <View className="flex-row items-center mt-1">
                                        <Users size={14} color="#6B7280" />
                                        <Text className="text-gray-600 text-sm ml-1">{group.members} members</Text>
                                    </View>

                                    <View className="flex-row items-center mt-1">
                                        <DollarSign size={14} color={group.balance >= 0 ? "#16A34A" : "#DC2626"} />
                                        <Text
                                            className={`text-sm font-medium ml-1 ${group.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {group.balance >= 0 ? '+' : ''}{group.balance.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>

                                <ChevronRight size={20} color="#6B7280" />
                            </TouchableOpacity>

                            {/* Group Actions */}
                            <View className="flex-row border-t border-gray-100 px-4 py-3">
                                <TouchableOpacity
                                    className="flex-row items-center bg-blue-50 rounded-lg px-3 py-2 mr-2"
                                    onPress={() => handleAddMembers(group.id)}
                                >
                                    <UserPlus size={16} color="#3B82F6" />
                                    <Text className="text-blue-600 text-sm font-medium ml-1">Add Members</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="flex-row items-center bg-green-50 rounded-lg px-3 py-2 mr-2"
                                    onPress={() => handleSettleBalance(group.id)}
                                >
                                    <DollarSign size={16} color="#16A34A" />
                                    <Text className="text-green-600 text-sm font-medium ml-1">Settle</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2"
                                    onPress={() => handleViewGroup(group.id)}
                                >
                                    <Eye size={16} color="#6B7280" />
                                    <Text className="text-gray-600 text-sm font-medium ml-1">View</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}

                {/* Stats Summary */}
                <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Group Summary</Text>

                    <View className="flex-row justify-between">
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-gray-900">4</Text>
                            <Text className="text-gray-600 text-sm">Total Groups</Text>
                        </View>

                        <View className="items-center">
                            <Text className="text-2xl font-bold text-green-600">3</Text>
                            <Text className="text-gray-600 text-sm">Active</Text>
                        </View>

                        <View className="items-center">
                            <Text className="text-2xl font-bold text-red-600">1</Text>
                            <Text className="text-gray-600 text-sm">Inactive</Text>
                        </View>

                        <View className="items-center">
                            <Text className="text-2xl font-bold text-blue-600">129.00</Text>
                            <Text className="text-gray-600 text-sm">Total Balance</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default GroupsScreen;
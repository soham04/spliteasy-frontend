import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft,
    Check
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CreateGroupScreen = () => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [errors, setErrors] = useState({
        name: '',
        members: ''
    });

    // Mock participants data
    const participants = [
        { id: 1, name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHx8MA%3D%3D' },
        { id: 2, name: 'Taylor Smith', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fHVzZXJ8ZW58MHx8MHx8fDA%3D' },
        { id: 3, name: 'Jordan Williams', avatar: 'https://images.unsplash.com/photo-1605993439219-9d09d2020fa5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTN8fHVzZXJ8ZW58MHx8MHx8fDA%3D' },
        { id: 4, name: 'Morgan Lee', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHVzZXJ8ZW58MHx8MHx8fDA%3D' },
        { id: 5, name: 'Casey Brown', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fHVzZXJ8ZW58MHx8MHx8fDA%3D' },
        { id: 6, name: 'Riley Davis', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTd8fHVzZXJ8ZW58MHx8MHx8fDA%3D' },
    ];

    // Handle member selection
    const toggleMember = (id: number) => {
        if (selectedMembers.includes(id)) {
            setSelectedMembers(selectedMembers.filter(memberId => memberId !== id));
        } else {
            setSelectedMembers([...selectedMembers, id]);
        }
    };

    // Validate form
    const validateForm = () => {
        let isValid = true;
        const newErrors = { name: '', members: '' };

        if (!groupName.trim()) {
            newErrors.name = 'Group name is required';
            isValid = false;
        }

        if (selectedMembers.length < 1) {
            newErrors.members = 'Select at least one member';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle form submission
    const handleSubmit = () => {
        if (validateForm()) {
            Alert.alert(
                'Group Created',
                `Successfully created group: ${groupName}`,
                [{ text: 'OK', onPress: () => console.log('Group created') }]
            );
            // Reset form
            setGroupName('');
            setGroupDescription('');
            setSelectedMembers([]);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <LinearGradient
                colors={['#111827', '#1e293b']}
                className="h-16 pt-10 px-4 flex-row items-center justify-between"
            >
                <TouchableOpacity className="flex-row items-center">
                    <ArrowLeft color="white" size={24} />
                    <Text className="text-white text-lg font-medium ml-2">Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Create Group</Text>
                <TouchableOpacity>
                    <Check color="white" size={24} />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView className="flex-1 px-4 py-6">
                {/* Group Name */}
                <View className="mb-6">
                    <Text className="text-[#111827] text-lg font-semibold mb-2">Group Name</Text>
                    <TextInput
                        value={groupName}
                        onChangeText={setGroupName}
                        placeholder="Enter group name"
                        className={`bg-white rounded-xl p-4 text-base border ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.name ? <Text className="text-red-500 mt-1">{errors.name}</Text> : null}
                </View>

                {/* Group Description */}
                <View className="mb-6">
                    <Text className="text-[#111827] text-lg font-semibold mb-2">Description (Optional)</Text>
                    <TextInput
                        value={groupDescription}
                        onChangeText={setGroupDescription}
                        placeholder="Enter group description"
                        multiline
                        numberOfLines={3}
                        className="bg-white rounded-xl p-4 text-base border border-gray-200 h-24"
                        textAlignVertical="top"
                    />
                </View>

                {/* Group Members */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-[#111827] text-lg font-semibold">Members</Text>
                        <Text className="text-gray-500">{selectedMembers.length} selected</Text>
                    </View>

                    {errors.members ? <Text className="text-red-500 mb-2">{errors.members}</Text> : null}

                    <View className="flex-row flex-wrap">
                        {participants.map((participant) => (
                            <TouchableOpacity
                                key={participant.id}
                                onPress={() => toggleMember(participant.id)}
                                className={`mr-3 mb-3 items-center justify-center rounded-xl p-3 ${selectedMembers.includes(participant.id) ? 'bg-[#84CC16]' : 'bg-white'} border border-gray-200`}
                            >
                                <Image
                                    source={{ uri: participant.avatar }}
                                    className="w-12 h-12 rounded-full mb-1"
                                />
                                <Text
                                    className={`text-sm font-medium ${selectedMembers.includes(participant.id) ? 'text-white' : 'text-[#111827]'}`}
                                    numberOfLines={1}
                                >
                                    {participant.name.split(' ')[0]}
                                </Text>
                                {selectedMembers.includes(participant.id) && (
                                    <View className="absolute top-1 right-1 bg-[#84CC16] rounded-full p-1">
                                        <Check color="white" size={12} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View className="px-4 pb-6">
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-[#84CC16] rounded-xl py-4 items-center justify-center"
                >
                    <Text className="text-white text-lg font-bold">Create Group</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CreateGroupScreen;
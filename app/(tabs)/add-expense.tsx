import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import {
    Calendar,
    Paperclip,
    User,
    Users as UsersIcon,
    X
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Config from 'react-native-config';

type SplitTypeUI = 'equal' | 'percentage' | 'shares' | 'exact';
type SplitTypeAPI = 'EQUAL' | 'PERCENTAGE' | 'SHARES' | 'EXACT';
type StatusAPI = 'PENDING' | 'SETTLED';
type CategoryAPI = 'FOOD' | 'TRAVEL' | 'SHOPPING' | 'HOUSING' | 'TRANSPORT' | 'UTILITIES' | 'ENTERTAINMENT' | 'OTHER';

type Me = { id: number; email: string; name: string };
type Friend = { userId: number; name: string; email: string; avatarUrl?: string | null };
type SearchUser = { id: number; name: string; email: string };
type Group = { id: number; groupName: string; members?: { id: number; name: string; email: string }[] };

const uiToApiSplit: Record<SplitTypeUI, SplitTypeAPI> = {
    equal: 'EQUAL',
    percentage: 'PERCENTAGE',
    shares: 'SHARES',
    exact: 'EXACT',
};

const categoryMap: Record<string, CategoryAPI> = {
    food: 'FOOD',
    travel: 'TRAVEL',
    shopping: 'SHOPPING',
    housing: 'HOUSING',
    transport: 'TRANSPORT',
    utilities: 'UTILITIES',
    entertainment: 'ENTERTAINMENT',
    other: 'OTHER',
};

async function getJwt() {
    return SecureStore.getItemAsync('jwt');
}

export default function AddExpenseScreen() {
    // form
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
    const [splitType, setSplitType] = useState<SplitTypeUI>('equal');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [date] = useState(new Date().toLocaleDateString());
    const [notes, setNotes] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [expenseType, setExpenseType] = useState<'individual' | 'group'>('individual');
    const [currency] = useState<'USD'>('USD');

    // auth / me
    const [me, setMe] = useState<Me | null>(null);

    // friends & search
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    // groups
    const [groups, setGroups] = useState<Group[]>([]);
    const [groupsLoading, setGroupsLoading] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
    const [groupMembers, setGroupMembers] = useState<{ id: number; name: string; email: string }[]>([]);

    // saving / validation
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({ title: '', amount: '', participants: '', category: '' });

    const categories = [
        { id: 'food', name: 'Food & Dining', color: '#FECACA' },
        { id: 'travel', name: 'Travel', color: '#BFDBFE' },
        { id: 'shopping', name: 'Shopping', color: '#DDD6FE' },
        { id: 'housing', name: 'Housing', color: '#BBF7D0' },
        { id: 'transport', name: 'Transport', color: '#A5F3FC' },
        { id: 'utilities', name: 'Utilities', color: '#FFE4B5' },
        { id: 'entertainment', name: 'Entertainment', color: '#FBCFE8' },
        { id: 'other', name: 'Other', color: '#E5E7EB' },
    ];
    const splitTypes = [
        { id: 'equal', name: 'Equal Split' },
        { id: 'percentage', name: 'Percentage' },
        { id: 'shares', name: 'Shares' },
        { id: 'exact', name: 'Exact Amounts' },
    ];

    // load current user
    useEffect(() => {
        (async () => {
            try {
                const token = await getJwt();
                if (!token) return;
                const res = await fetch(`${Config.API_URL}/api/v1/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const json = await res.json();
                if (json?.data) setMe({ id: json.data.id, email: json.data.email, name: json.data.name });
            } catch (e) {
                console.warn('load me failed', e);
            }
        })();
    }, []);

    // load friends
    const loadFriends = async () => {
        try {
            setFriendsLoading(true);
            const token = await getJwt();
            if (!token) return;
            const res = await fetch(`${Config.API_URL}/api/v1/friends`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const text = await res.text();
            let data: Friend[] = [];
            try { data = JSON.parse(text); } catch { data = []; }
            if (Array.isArray(data)) setFriends(data);
        } catch (e) {
            console.warn('load friends failed', e);
        } finally {
            setFriendsLoading(false);
        }
    };

    useEffect(() => { loadFriends(); }, []);

    // load groups (user's groups)
    const loadGroups = async () => {
        try {
            setGroupsLoading(true);
            const token = await getJwt();
            if (!token) return;
            const res = await fetch(`${Config.API_URL}/api/v1/groups`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const text = await res.text();
            let json: any = null;
            try { json = JSON.parse(text); } catch { json = null; }
            // API returns { success: true, data: [ ... ] }
            const arr: Group[] = json?.data ?? [];
            setGroups(Array.isArray(arr) ? arr : []);
        } catch (e) {
            console.warn('load groups failed', e);
        } finally {
            setGroupsLoading(false);
        }
    };

    useEffect(() => { loadGroups(); }, []);

    // when selecting group load group details (members)
    const loadGroupDetails = async (groupId: number | null) => {
        setGroupMembers([]);
        setSelectedParticipants([]);
        if (!groupId) return;
        try {
            const token = await getJwt();
            if (!token) return;
            const res = await fetch(`${Config.API_URL}/api/v1/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const text = await res.text();
            let json: any = null;
            try { json = JSON.parse(text); } catch { json = null; }
            const members = json?.data?.members ?? [];
            if (Array.isArray(members)) {
                setGroupMembers(members.map((m: any) => ({ id: m.id, name: m.name, email: m.email })));
                // pre-select group members as participants
                setSelectedParticipants(members.map((m: any) => m.id));
            }
        } catch (e) {
            console.warn('load group details failed', e);
        }
    };

    useEffect(() => {
        loadGroupDetails(selectedGroup);
    }, [selectedGroup]);

    // search users (debounced)
    useEffect(() => {
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        searchDebounce.current = setTimeout(async () => {
            try {
                setSearchLoading(true);
                const token = await getJwt();
                const params = new URLSearchParams({ q: searchQuery.trim(), page: '0', size: '10' });
                const res = await fetch(`${Config.API_URL}/api/v1/users/search?${params.toString()}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const text = await res.text();
                let payload: any = null;
                try { payload = JSON.parse(text); } catch { payload = null; }
                const content: SearchUser[] = payload?.content ?? [];
                setSearchResults(content);
            } catch (e) {
                console.warn('search failed', e);
            } finally {
                setSearchLoading(false);
            }
        }, 350);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // friend request (add)
    const sendFriendRequest = async (toUserId: number) => {
        try {
            const token = await getJwt();
            if (!token) { Alert.alert('Auth', 'Please login again.'); return; }
            const res = await fetch(`${Config.API_URL}/api/v1/friends/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ toUserId }),
            });
            if (res.ok) {
                Alert.alert('Request sent', 'Friend request sent successfully');
            } else {
                const t = await res.text();
                Alert.alert('Failed', t || 'Could not send request');
            }
        } catch (e) {
            console.error('friend request error', e);
            Alert.alert('Error', 'Could not send friend request');
        }
    };

    // participants toggling
    const toggleParticipant = (id: number) => {
        setSelectedParticipants(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const participantIds = useMemo(() => {
        const ids = new Set<number>(selectedParticipants);
        if (me?.id) ids.add(me.id); // ensure payer included
        return Array.from(ids);
    }, [selectedParticipants, me]);

    // validation & utilities
    const validateForm = () => {
        let isValid = true;
        const newErrors = { title: '', amount: '', participants: '', category: '' };
        if (!title.trim()) { newErrors.title = 'Title is required'; isValid = false; }
        if (!amount || Number.isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { newErrors.amount = 'Valid amount is required'; isValid = false; }
        if (expenseType === 'individual' && selectedParticipants.length === 0) { newErrors.participants = 'Select at least one participant'; isValid = false; }
        if (expenseType === 'group' && !selectedGroup) { newErrors.participants = 'Select a group'; isValid = false; }
        if (!selectedCategory) { newErrors.category = 'Select a category'; isValid = false; }
        setErrors(newErrors);
        return isValid;
    };

    const buildEqualShares = (total: number, ids: number[]) => {
        if (ids.length === 0) return {};
        const shares: Record<string, number> = {};
        const base = Math.floor((total / ids.length) * 100) / 100;
        let sum = 0;
        ids.forEach((id, idx) => {
            if (idx === ids.length - 1) shares[id.toString()] = parseFloat((total - sum).toFixed(2));
            else { shares[id.toString()] = parseFloat(base.toFixed(2)); sum += base; }
        });
        return shares;
    };

    // submit expense
    const submitToAPI = async () => {
        if (!me?.id) { Alert.alert('Auth', 'Please log in again.'); return; }
        if (!validateForm()) return;
        if (splitType !== 'equal') { Alert.alert('Coming soon', 'Only Equal Split is implemented right now.'); return; }
        const jwt = await getJwt();
        if (!jwt) { Alert.alert('Auth', 'Missing token'); return; }

        const total = parseFloat(amount);
        const body: any = {
            amount: total,
            currency,
            description: title,
            payerId: me.id,
            participantIds,
            groupId: expenseType === 'group' ? selectedGroup : null,
            splitType: uiToApiSplit[splitType],
            participantShares: buildEqualShares(total, participantIds),
            status: 'PENDING' as StatusAPI,
            category: categoryMap[selectedCategory!],
        };
        if (!body.groupId) delete body.groupId;

        try {
            setSaving(true);
            const res = await fetch(`${Config.API_URL}/api/v1/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
                body: JSON.stringify(body),
            });
            const text = await res.text();
            let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }
            if (!res.ok || data?.success === false) {
                console.error('Create expense failed:', data);
                Alert.alert('Failed', data?.message || 'Could not create expense.');
                return;
            }
            Alert.alert('Success', 'Expense added successfully!');
            // reset
            setTitle(''); setAmount(''); setSelectedParticipants([]); setSplitType('equal'); setSelectedCategory(null);
            setNotes(''); setAttachments([]); setExpenseType('individual'); setSelectedGroup(null); setGroupMembers([]);
        } catch (e) {
            console.error('Create expense error', e);
            Alert.alert('Error', 'Something went wrong while creating the expense.');
        } finally { setSaving(false); }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#111827]">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#F5F7F9]">
                <LinearGradient colors={['#111827', '#1e293b']} className="h-16 pt-10 px-4 ">
                    <View className="flex-row items-center justify-between py-4 h-16 relative">
                        <Text className="absolute left-0 right-0 text-center text-white text-xl font-bold">Add Expense</Text>
                    </View>
                </LinearGradient>

                <ScrollView className="flex-1 px-4 py-6">
                    {/* Title, Amount, Expense Type */}
                    <View className="mb-6">
                        <Text className="text-[#111827] text-lg font-semibold mb-2">Title</Text>
                        <TextInput value={title} onChangeText={setTitle} placeholder="Enter expense title"
                            className={`bg-white rounded-xl p-4 text-base border ${errors.title ? 'border-red-500' : 'border-gray-200'}`} />
                        {errors.title ? <Text className="text-red-500 mt-1">{errors.title}</Text> : null}
                    </View>

                    <View className="mb-6">
                        <Text className="text-[#111827] text-lg font-semibold mb-2">Amount</Text>
                        <View className="relative">
                            <Text className="absolute left-4 top-4 text-gray-500 text-lg">$</Text>
                            <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00"
                                className={`bg-white rounded-xl p-4 pl-10 text-base border ${errors.amount ? 'border-red-500' : 'border-gray-200'}`} />
                        </View>
                        {errors.amount ? <Text className="text-red-500 mt-1">{errors.amount}</Text> : null}
                    </View>

                    <View className="mb-6">
                        <Text className="text-[#111827] text-lg font-semibold mb-3">Expense Type</Text>
                        <View className="flex-row bg-white rounded-xl p-1 border border-gray-200">
                            <TouchableOpacity onPress={() => setExpenseType('individual')}
                                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${expenseType === 'individual' ? 'bg-[#84CC16]' : 'bg-transparent'}`}>
                                <User color={expenseType === 'individual' ? 'white' : '#111827'} size={20} />
                                <Text className={`font-medium ml-2 ${expenseType === 'individual' ? 'text-white' : 'text-[#111827]'}`}>Individual</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setExpenseType('group')}
                                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${expenseType === 'group' ? 'bg-[#84CC16]' : 'bg-transparent'}`}>
                                <UsersIcon color={expenseType === 'group' ? 'white' : '#111827'} size={20} />
                                <Text className={`font-medium ml-2 ${expenseType === 'group' ? 'text-white' : 'text-[#111827]'}`}>Group</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Participants / Groups */}
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-[#111827] text-lg font-semibold">{expenseType === 'individual' ? 'Participants (Friends)' : 'Select Group'}</Text>
                            <View className="flex-row items-center">
                                <UsersIcon color="#111827" size={18} />
                                <Text className="text-[#84CC16] text-base font-medium ml-1">Add</Text>
                            </View>
                        </View>
                        {errors.participants ? <Text className="text-red-500 mb-2">{errors.participants}</Text> : null}

                        {expenseType === 'individual' ? (
                            <>
                                <View className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="text-[#111827] font-semibold">Your Friends</Text>
                                        {friendsLoading && <ActivityIndicator />}
                                    </View>

                                    {friends.length === 0 ? (
                                        <Text className="text-gray-500">You have no friends yet. Search below to add some!</Text>
                                    ) : (
                                        <View className="flex-row flex-wrap">
                                            {friends.map((f) => (
                                                <TouchableOpacity key={f.userId} onPress={() => toggleParticipant(f.userId)}
                                                    className={`mr-2 mb-2 px-3 py-2 rounded-full border ${selectedParticipants.includes(f.userId) ? 'bg-[#84CC16] border-[#84CC16]' : 'bg-white border-gray-200'}`}>
                                                    <Text className={`${selectedParticipants.includes(f.userId) ? 'text-white' : 'text-[#111827]'} font-medium`}>{f.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <View className="bg-white rounded-xl border border-gray-200 p-3">
                                    <Text className="text-[#111827] font-semibold mb-2">Search Users</Text>
                                    <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search by name or email" className="bg-gray-100 rounded-lg p-3 mb-3" autoCapitalize="none" />
                                    {searchLoading ? <ActivityIndicator /> : (
                                        <>
                                            {searchResults.length === 0 ? <Text className="text-gray-500">No results</Text> : (
                                                searchResults.map((u) => {
                                                    const isFriend = friends.some((f) => f.userId === u.id);
                                                    const selected = selectedParticipants.includes(u.id);
                                                    return (
                                                        <View key={u.id} className="flex-row items-center justify-between py-2">
                                                            <View>
                                                                <Text className="text-[#111827] font-medium">{u.name}</Text>
                                                                <Text className="text-gray-500">{u.email}</Text>
                                                            </View>
                                                            {isFriend ? (
                                                                <TouchableOpacity onPress={() => toggleParticipant(u.id)} className={`px-3 py-2 rounded-lg ${selected ? 'bg-[#84CC16]' : 'bg-gray-100'}`}>
                                                                    <Text className={selected ? 'text-white font-medium' : 'text-[#111827] font-medium'}>{selected ? 'Selected' : 'Select'}</Text>
                                                                </TouchableOpacity>
                                                            ) : (
                                                                <TouchableOpacity onPress={() => sendFriendRequest(u.id)} className="px-3 py-2 rounded-lg bg-blue-600">
                                                                    <Text className="text-white font-medium">Add Friend</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    );
                                                })
                                            )}
                                        </>
                                    )}
                                </View>
                            </>
                        ) : (
                            // Group selection only — NO create inside this screen
                            <View>
                                <View className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="text-[#111827] font-semibold">Your Groups</Text>
                                        {groupsLoading && <ActivityIndicator />}
                                    </View>

                                    {groups.length === 0 ? (
                                        <Text className="text-gray-500">You have no groups yet. Create a group from the Groups screen first.</Text>
                                    ) : (
                                        <View className="flex-row flex-wrap">
                                            {groups.map((g) => (
                                                <TouchableOpacity key={g.id} onPress={() => setSelectedGroup(g.id)}
                                                    className={`mr-2 mb-2 px-4 py-3 rounded-xl ${selectedGroup === g.id ? 'bg-[#84CC16]' : 'bg-white'} border border-gray-200`}>
                                                    <Text className={`font-medium ${selectedGroup === g.id ? 'text-white' : 'text-[#111827]'}`}>{g.groupName}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                {selectedGroup ? (
                                    <View className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
                                        <Text className="text-[#111827] font-semibold mb-2">Group Members</Text>
                                        {groupMembers.length === 0 ? <Text className="text-gray-500">Loading members…</Text> : (
                                            groupMembers.map(m => (
                                                <View key={m.id} className="flex-row items-center justify-between py-2">
                                                    <Text className="text-[#111827]">{m.name}</Text>
                                                    <Text className="text-gray-500">{m.email}</Text>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                ) : null}
                            </View>
                        )}
                    </View>

                    {/* remaining fields (split type, category, etc.) */}
                    <View className="mb-6">
                        <Text className="text-[#111827] text-lg font-semibold mb-3">Split Type</Text>
                        <View className="flex-row flex-wrap">
                            {splitTypes.map(t => (
                                <TouchableOpacity key={t.id} onPress={() => setSplitType(t.id as SplitTypeUI)}
                                    className={`mr-2 mb-2 px-4 py-2 rounded-full ${splitType === t.id ? 'bg-[#84CC16]' : 'bg-white'} border border-gray-200`}>
                                    <Text className={`font-medium ${splitType === t.id ? 'text-white' : 'text-[#111827]'}`}>{t.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-[#111827] text-lg font-semibold mb-3">Category</Text>
                        <View className="flex-row flex-wrap">
                            {categories.map(c => (
                                <TouchableOpacity key={c.id} onPress={() => setSelectedCategory(c.id)}
                                    className={`mr-2 mb-2 items-center justify-center rounded-xl p-3 ${selectedCategory === c.id ? 'bg-[#84CC16]' : 'bg-white'} border border-gray-200`} style={{ width: '23%' }}>
                                    <View className="w-10 h-10 rounded-full items-center justify-center mb-1" style={{ backgroundColor: c.color }} />
                                    <Text className={`text-xs font-medium text-center ${selectedCategory === c.id ? 'text-white' : 'text-[#111827]'}`}>{c.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-[#111827] text-lg font-semibold mb-2">Date</Text>
                        <TouchableOpacity className="flex-row items-center bg-white rounded-xl p-4 border border-gray-200">
                            <Calendar color="#111827" size={20} />
                            <Text className="text-[#111827] text-base ml-3">{date}</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mb-6">
                        <Text className="text-[#111827] text-lg font-semibold mb-2">Notes</Text>
                        <TextInput value={notes} onChangeText={setNotes} placeholder="Add notes (optional)" multiline numberOfLines={3}
                            className="bg-white rounded-xl p-4 text-base border border-gray-200 h-24" textAlignVertical="top" />
                    </View>

                    <View className="mb-8">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-[#111827] text-lg font-semibold">Attachments</Text>
                            <TouchableOpacity onPress={() => Alert.alert('Add Attachment', 'Camera/Gallery coming soon')} className="flex-row items-center">
                                <Paperclip color="#111827" size={18} />
                                <Text className="text-[#84CC16] text-base font-medium ml-1">Add</Text>
                            </TouchableOpacity>
                        </View>

                        {attachments.length === 0 ? (
                            <View className="bg-white rounded-xl p-6 items-center justify-center border border-dashed border-gray-300">
                                <Paperclip color="#6B7280" size={24} />
                                <Text className="text-gray-500 mt-2 text-center">No attachments added yet</Text>
                            </View>
                        ) : (
                            <View className="flex-row">
                                {attachments.map((uri, idx) => (
                                    <View key={idx} className="relative mr-3">
                                        <Image source={{ uri }} className="w-16 h-16 rounded-lg" />
                                        <TouchableOpacity className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1" onPress={() => setAttachments(attachments.filter((_, i) => i !== idx))}>
                                            <X color="white" size={12} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Save */}
                <View className="px-4 pb-6">
                    <TouchableOpacity onPress={submitToAPI} disabled={saving} className="bg-[#84CC16] rounded-xl py-4 items-center justify-center">
                        <Text className="text-white text-lg font-bold">{saving ? 'Saving…' : 'Save Expense'}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
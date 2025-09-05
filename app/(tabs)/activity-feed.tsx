import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
    Calendar,
    Car,
    CheckCircle,
    Coffee,
    DollarSign,
    Edit3,
    Filter,
    Pizza,
    ShoppingBag,
    User,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Config from "react-native-config";

type ExpenseAPI = {
    id: number;
    amount: number;
    currency?: string;
    description?: string;
    groupId?: number | null;
    payerId?: number;
    payerName?: string;
    participantIds?: number[];
    participantNames?: string[];
    splitType?: string;
    participantShares?: Record<string, number>;
    status?: string;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
};

async function getJwt() {
    return SecureStore.getItemAsync("jwt");
}

const getCategoryIcon = (category?: string) => {
    switch ((category || "").toLowerCase()) {
        case "food":
            return <Pizza size={16} color="#111827" />;
        case "transport":
            return <Car size={16} color="#111827" />;
        case "shopping":
            return <ShoppingBag size={16} color="#111827" />;
        default:
            return <Coffee size={16} color="#111827" />;
    }
};

const getTypeIcon = (status?: string) => {
    switch ((status || "").toLowerCase()) {
        case "expense":
            return <DollarSign size={16} color="#DC2626" />;
        case "settled":
        case "settlement":
            return <CheckCircle size={16} color="#16A34A" />;
        case "edit":
            return <Edit3 size={16} color="#6B7280" />;
        default:
            return <DollarSign size={16} color="#111827" />;
    }
};

export default function ActivityFeedScreen() {
    const router = useRouter();

    // pagination
    const [page, setPage] = useState(0);
    const [size] = useState(10);

    // data
    const [expenses, setExpenses] = useState<ExpenseAPI[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buildQuery = useCallback(() => {
        const params: Record<string, string> = {
            "pageable.page": String(page),
            "pageable.size": String(size),
        };
        const qs = new URLSearchParams(params).toString();
        return qs ? `?${qs}` : "";
    }, [page, size]);

    const loadExpenses = useCallback(
        async (opts: { append?: boolean } = {}) => {
            if (opts.append) setLoadingMore(true);
            else setLoading(true);
            setError(null);

            try {
                const jwt = await getJwt();
                if (!jwt) {
                    setError("Missing auth token — please sign in.");
                    setExpenses([]);
                    return;
                }

                const qs = buildQuery();
                const url = `${Config.API_URL}/api/v1/expenses${qs}`;
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${jwt}` },
                });

                const text = await res.text();
                let payload: any = null;
                try {
                    payload = JSON.parse(text);
                } catch {
                    payload = null;
                }

                const pageData = payload?.data ?? null;
                const content: ExpenseAPI[] = pageData?.content ?? (Array.isArray(payload) ? payload : []);

                if (opts.append) {
                    setExpenses((prev) => [...prev, ...(Array.isArray(content) ? content : [])]);
                } else {
                    setExpenses(Array.isArray(content) ? content : []);
                }

                setTotalPages(pageData?.totalPages ?? 0);
            } catch (err) {
                console.error("loadExpenses failed", err);
                setError("Failed to load activity.");
            } finally {
                setLoading(false);
                setLoadingMore(false);
                setRefreshing(false);
            }
        },
        [buildQuery]
    );

    // initial load & reload when page changes
    useEffect(() => {
        loadExpenses({ append: page > 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(0);
        await loadExpenses({ append: false });
        setRefreshing(false);
    };

    const loadMore = () => {
        if (loadingMore) return;
        if (page + 1 >= (totalPages || Infinity)) return;
        setPage((p) => p + 1);
    };

    // direct view (no local filters)
    const view = useMemo(() => expenses, [expenses]);

    return (
        <SafeAreaView className="flex-1 bg-[#111827]">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <LinearGradient colors={["#111827", "#1e293b"]} className="h-16 pt-10 px-4">
                    <View className="flex-row items-center justify-between py-4 h-16 relative">
                        <Text className="absolute left-0 right-0 text-center text-white text-xl font-bold">Activity Feed</Text>
                    </View>
                </LinearGradient>

                <View className="flex-1 bg-white">
                    {loading && !refreshing ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" />
                        </View>
                    ) : error ? (
                        <View className="flex-1 items-center justify-center px-6">
                            <Text className="text-[#111827] text-lg font-bold mb-2">Something went wrong</Text>
                            <Text className="text-gray-500 text-center mb-4">{error}</Text>
                            <TouchableOpacity onPress={() => loadExpenses()} className="bg-[#84CC16] px-4 py-2 rounded">
                                <Text className="text-white">Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : view.length === 0 ? (
                        <View className="flex-1 items-center justify-center py-12 px-6">
                            <View className="bg-white rounded-full p-4 mb-4">
                                <Filter size={32} color="#6B7280" />
                            </View>
                            <Text className="text-[#111827] text-xl font-bold mb-2">No Activity Found</Text>
                            <Text className="text-[#6B7280] text-center px-8">No expenses available</Text>
                        </View>
                    ) : (
                        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
                            {view.map((activity) => {
                                const amount = Number(activity.amount || 0).toFixed(2);
                                const title = activity.description ?? (activity.payerName ? `${activity.payerName}'s expense` : `Expense #${activity.id}`);
                                const participantNames: string[] = activity.participantNames ?? [];

                                return (
                                    <TouchableOpacity
                                        key={activity.id}
                                        onPress={() => router.push(`/expense-detail/${activity.id}`)}
                                        className="bg-white rounded-xl shadow-sm mb-4"
                                    >
                                        <View className="p-4">
                                            <View className="flex-row justify-between items-start mb-3">
                                                <View className="flex-1">
                                                    <View className="flex-row items-center mb-1">
                                                        <View className="mr-2">{getTypeIcon(activity.status)}</View>
                                                        <Text className="text-[#111827] text-lg font-bold">{title}</Text>
                                                    </View>
                                                    <Text className="text-[#6B7280] text-sm">
                                                        {activity.splitType ? `${activity.splitType} • ${activity.category ?? ""}` : activity.category ?? ""}
                                                    </Text>
                                                </View>
                                                <Text className="text-[#111827] text-lg font-bold">${amount}</Text>
                                            </View>

                                            {/* Participants */}
                                            <View className="mb-3">
                                                <View className="flex-row items-center mb-2">
                                                    <User size={16} color="#6B7280" />
                                                    <Text className="text-[#6B7280] text-sm ml-1">Participants</Text>
                                                </View>
                                                <View className="flex-row flex-wrap">
                                                    {participantNames.length > 0 ? (
                                                        participantNames.map((n, idx) => (
                                                            <View key={`${activity.id}-p-${idx}`} className="flex-row items-center mr-3 mb-2">
                                                                <View className="w-6 h-6 rounded-full bg-gray-200 mr-1 items-center justify-center">
                                                                    <Text className="text-xs">{n.split(" ")[0].slice(0, 1)}</Text>
                                                                </View>
                                                                <Text className="text-[#111827] text-sm">{n.split(" ")[0]}</Text>
                                                            </View>
                                                        ))
                                                    ) : (
                                                        (activity.participantIds ?? []).slice(0, 6).map((id) => (
                                                            <View key={`${activity.id}-pid-${id}`} className="flex-row items-center mr-3 mb-2">
                                                                <View className="w-6 h-6 rounded-full bg-gray-200 mr-1 items-center justify-center">
                                                                    <Text className="text-xs">{String(id).slice(-1)}</Text>
                                                                </View>
                                                                <Text className="text-[#111827] text-sm">User {id}</Text>
                                                            </View>
                                                        ))
                                                    )}
                                                </View>
                                            </View>

                                            {/* Footer */}
                                            <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                                                {activity.category && (
                                                    <View className="flex-row items-center">
                                                        <View className="bg-gray-100 rounded-full p-1 mr-2">{getCategoryIcon(activity.category)}</View>
                                                        <Text className="text-[#6B7280] text-sm capitalize">{(activity.category || "").toLowerCase()}</Text>
                                                    </View>
                                                )}
                                                <View className="flex-row items-center">
                                                    <Calendar size={16} color="#6B7280" />
                                                    <Text className="text-[#6B7280] text-sm ml-1">
                                                        {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : "—"}
                                                    </Text>
                                                </View>
                                                <View className="bg-gray-100 rounded-full px-2 py-1">
                                                    <Text className="text-[#6B7280] text-xs uppercase">{(activity.status || "expense").toString().toLowerCase()}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}

                            {/* Load more */}
                            {loadingMore ? (
                                <View className="items-center py-4"><ActivityIndicator /></View>
                            ) : page + 1 < (totalPages || Infinity) ? (
                                <View className="items-center py-4">
                                    <TouchableOpacity onPress={loadMore} className="bg-[#84CC16] px-4 py-2 rounded">
                                        <Text className="text-white">Load more</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                        </ScrollView>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
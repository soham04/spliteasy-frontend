// app/expense-detail/[id].tsx
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
    ArrowLeft,
    Calendar,
    Download,
    Share2
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
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
    payerEmail?: string; // some APIs include
    participantIds?: number[];
    participantNames?: string[];
    splitType?: string;
    participantShares?: Record<string, number>;
    status?: string;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
    notes?: string | null;
    attachments?: string[] | null;
};

async function getJwt() {
    return SecureStore.getItemAsync("jwt");
}

function initialsFromName(name?: string) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ExpenseDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const id = params.id;

    const [expense, setExpense] = useState<ExpenseAPI | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Missing expense id");
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const jwt = await getJwt();
                if (!jwt) {
                    setError("Not authenticated. Please login.");
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${Config.API_URL}/api/v1/expenses/${id}`, {
                    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
                });

                const text = await res.text();
                let payload: any = null;
                try {
                    payload = JSON.parse(text);
                } catch {
                    payload = null;
                }

                const data = payload?.data ?? null;
                if (!res.ok || !data) {
                    setError(payload?.message ?? "Failed to fetch expense");
                    setExpense(null);
                    setLoading(false);
                    return;
                }

                setExpense(data);
            } catch (e) {
                console.error("fetch expense failed", e);
                setError("Error loading expense");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleEdit = () => {
        router.push(`/expense-detail/${id}/edit`);
    };

    const handleDelete = async () => {
        Alert.alert("Delete", "Delete this expense?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const jwt = await getJwt();
                        if (!jwt) throw new Error("not authenticated");
                        const res = await fetch(`${Config.API_URL}/api/v1/expenses/${id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${jwt}` },
                        });
                        if (res.ok) {
                            Alert.alert("Deleted", "Expense deleted");
                            router.back();
                        } else {
                            const txt = await res.text();
                            Alert.alert("Failed", txt || "Could not delete");
                        }
                    } catch (err) {
                        console.error("delete failed", err);
                        Alert.alert("Error", "Could not delete expense");
                    }
                },
            },
        ]);
    };

    const handleDownload = () => {
        Alert.alert("Download", "Download receipt not implemented yet");
    };
    const handleShare = () => {
        Alert.alert("Share", "Share not implemented yet");
    };

    return (
        <SafeAreaView className="flex-1 bg-[#111827]">
            <LinearGradient colors={["#111827", "#1e293b"]} >
                <View className="flex-row items-center justify-between py-4 h-16 relative px-2">
                    <TouchableOpacity className="flex-row items-center" onPress={() => router.back()}>
                        <ArrowLeft color="white" size={24} />
                        <Text className="text-white text-lg font-medium ml-2">Back</Text>
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Expense Details</Text>
                    <View className="flex-row">
                        <TouchableOpacity onPress={handleShare} className="mr-3">
                            <Share2 color="white" size={24} />
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={handleEdit}>
                            <Edit3 color="white" size={24} />
                        </TouchableOpacity> */}
                    </View>
                </View>

            </LinearGradient>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-xl font-bold text-gray-900 mb-2">Error</Text>
                    <Text className="text-gray-600 text-center mb-4">{error}</Text>
                    <TouchableOpacity onPress={() => router.back()} className="bg-[#84CC16] px-4 py-2 rounded">
                        <Text className="text-white">Go Back</Text>
                    </TouchableOpacity>
                </View>
            ) : !expense ? (
                <View className="flex-1 items-center justify-center">
                    <Text>No expense data</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 py-6 bg-white">
                    {/* Header block */}
                    <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
                        <View className="flex-row justify-between items-start mb-4">
                            <View>
                                <Text className="text-2xl font-bold text-gray-900">{expense.description ?? `Expense #${expense.id}`}</Text>
                                <Text className="text-gray-500">{expense.category ?? ""}</Text>
                            </View>
                            <Text className="text-3xl font-bold text-green-600">${Number(expense.amount || 0).toFixed(2)}</Text>
                        </View>

                        <View className="flex-row items-center mb-3">
                            <Calendar size={18} color="#6B7280" />
                            <Text className="text-gray-600 ml-2">{expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : "-"}</Text>
                        </View>
                    </View>

                    {/* PAID BY card */}
                    <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">Paid By</Text>
                        <View className="flex-row items-center">
                            {/* Avatar (if you have an avatar URL in response put it here) */}
                            {/*
                 Some APIs return payer info as object; common keys: payerName, payerId, payerEmail
                 If your API returns a nested payer object, adapt accordingly.
              */}
                            <View className="w-14 h-14 rounded-full bg-gray-200 mr-4 items-center justify-center">
                                {/* You can replace with Image if you have url */}
                                <Text className="text-lg font-bold text-gray-700">
                                    {initialsFromName(expense.payerName)}
                                </Text>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text className="text-base font-medium text-gray-900">{expense.payerName ?? `User ${expense.payerId ?? "—"}`}</Text>
                                {/* If API provides email show it, otherwise hide */}
                                {expense.payerEmail ? (
                                    <Text className="text-gray-500">{expense.payerEmail}</Text>
                                ) : null}
                                {/* Show payer id as fallback */}
                                {!expense.payerEmail && expense.payerId ? (
                                    <Text className="text-gray-500">ID: {expense.payerId}</Text>
                                ) : null}
                            </View>

                            <View className="items-end">
                                <Text className="text-sm text-gray-500">Paid</Text>
                                <Text className="text-lg font-bold">${Number(expense.amount || 0).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Split Details */}
                    <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-semibold text-gray-900">Split Details</Text>
                            <Text className="text-gray-500">{expense.splitType ?? ""}</Text>
                        </View>

                        <View className="border-t border-gray-100 pt-4">
                            {(expense.participantNames ?? expense.participantIds ?? []).map((p: any, idx: number) => {
                                const name = typeof p === "string" ? p : typeof p === "object" && p.name ? p.name : `User ${p}`;
                                const key = typeof p === "object" && p.id ? String(p.id) : String(p);
                                const share = expense.participantShares ? expense.participantShares[key] : undefined;
                                const displayShare = share ?? (expense.amount ? (expense.amount / Math.max(1, (expense.participantNames?.length ?? expense.participantIds?.length ?? 1))) : 0);
                                return (
                                    <View key={idx} className="flex-row items-center justify-between py-3">
                                        <View className="flex-row items-center">
                                            <View className="w-10 h-10 rounded-full bg-gray-200 mr-3 items-center justify-center">
                                                <Text className="text-sm">{(typeof name === "string" ? name.split(" ")[0].slice(0, 1) : "?").toUpperCase()}</Text>
                                            </View>
                                            <Text className="font-medium text-gray-900">{name}</Text>
                                        </View>
                                        <Text className="font-medium text-gray-900">${Number(displayShare).toFixed(2)}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Notes */}
                    {expense.notes ? (
                        <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
                            <Text className="text-lg font-semibold text-gray-900 mb-3">Notes</Text>
                            <Text className="text-gray-600">{expense.notes}</Text>
                        </View>
                    ) : null}

                    {/* Attachments */}
                    {(expense.attachments ?? []).length > 0 && (
                        <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
                            <Text className="text-lg font-semibold text-gray-900 mb-3">Attachments</Text>
                            <View className="flex-row">
                                {(expense.attachments ?? []).map((uri, i) => (
                                    <TouchableOpacity key={i} className="relative mr-3" onPress={handleDownload}>
                                        <Image source={{ uri }} className="w-20 h-20 rounded-lg" />
                                        <View className="absolute bottom-1 right-1 bg-black bg-opacity-50 rounded-full p-1">
                                            <Download size={12} color="white" />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Actions */}
                    <View className="flex-row mb-6">
                        <TouchableOpacity onPress={handleEdit} className="flex-1 bg-white rounded-xl py-4 items-center mr-3 border border-gray-200">
                            <Text className="text-gray-900 font-medium">Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleDelete} className="flex-1 bg-red-50 rounded-xl py-4 items-center border border-red-100">
                            <Text className="text-red-600 font-medium">Delete</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
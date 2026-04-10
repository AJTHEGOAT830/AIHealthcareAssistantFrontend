import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

const LOCAL_IP = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.41";

interface Scan {
    modality: string;
    label: string;
    time: string;
}

interface Chat {
    content: string;
    is_bot: boolean;
    time: string;
}

export default function HistoryScreen() {
    const [scans, setScans] = useState<Scan[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper to format the ISO string into a readable date and time
    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const loadHistory = async () => {
        try {
            const uid = await AsyncStorage.getItem('user_id');
            if (!uid) return;

            const res = await fetch(`http://${LOCAL_IP}:5000/get-history?user_id=${uid}`);
            const data = await res.json();

            setScans(data.scans || []);
            setChats(data.chats || []);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    // Refreshes data every time the user views this screen
    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2D9CDB" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Health Dashboard</Text>

            {/* DIAGNOSTIC SCANS SECTION */}
            <Text style={styles.sectionTitle}>Diagnostic Scans</Text>
            {scans.length === 0 ? (
                <Text style={styles.emptyText}>No scans recorded yet.</Text>
            ) : (
                scans.map((item, index) => (
                    <View key={index} style={styles.scanCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.modality}>{item.modality.toUpperCase()}</Text>
                            <Text style={styles.date}>{formatDateTime(item.time)}</Text>
                        </View>
                        <Text style={styles.label}>{item.label}</Text>
                    </View>
                ))
            )}

            {/* CHAT HISTORY SECTION */}
            <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Recent Conversations</Text>
            {chats.length === 0 ? (
                <Text style={styles.emptyText}>No chat history found.</Text>
            ) : (
                chats.filter(c => !c.is_bot).map((chat, index) => (
                    <View key={index} style={styles.chatCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.chatText} numberOfLines={2}>"{chat.content}"</Text>
                            <Text style={styles.date}>{formatDateTime(chat.time)}</Text>
                        </View>
                    </View>
                ))
            )}

            <View style={{ height: 50 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0D0D', padding: 20 },
    centered: { flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', alignItems: 'center' },
    header: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 25 },
    sectionTitle: { color: '#2D9CDB', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    emptyText: { color: '#666', fontStyle: 'italic', marginLeft: 5 },
    scanCard: {
        backgroundColor: '#1A1A1A',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2D9CDB'
    },
    chatCard: {
        backgroundColor: '#1A1A1A',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#555'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    modality: { color: '#2D9CDB', fontWeight: 'bold', fontSize: 11 },
    date: { color: '#555', fontSize: 10 },
    label: { color: '#fff', fontSize: 15, marginTop: 5, fontWeight: '500' },
    chatText: { color: '#bbb', fontSize: 14, fontStyle: 'italic', flex: 1, marginRight: 10 }
});
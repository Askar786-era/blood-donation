import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator, Modal, Vibration
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import BASE_URL from '../config';

let socket = null;

export default function DashboardScreen({ navigation }) {
  const [donorInfo, setDonorInfo] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Call State
  const [incomingCall, setIncomingCall] = useState(null); // Stores caller info
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => {
    // Connect Socket Safely
    socket = io(BASE_URL, {
      transports: ['websocket'],
      forceNew: true
    });

    socket.on('connect', () => console.log('Connected to socket'));
    
    // Listen for Incoming Calls
    socket.on('callIncoming', (data) => {
      // data should contain { callerName, callerPhone }
      setIncomingCall(data);
      setShowCallModal(true);
      Vibration.vibrate([500, 500, 500], true); // Repeat vibration
    });

    loadDonor();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      Vibration.cancel();
    };
  }, []);

  const loadDonor = async () => {
    try {
      const data = await AsyncStorage.getItem('donorInfo');
      if (data) {
        const parsed = JSON.parse(data);
        setDonorInfo(parsed);
        const savedOnline = await AsyncStorage.getItem('isOnline');
        if (savedOnline === 'true') {
          setIsOnline(true);
          socket.emit('donorOnline', parsed.phone);
        }
      } else {
        navigation.replace('Login');
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const toggleOnline = async () => {
    if (!donorInfo) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    await AsyncStorage.setItem('isOnline', String(newStatus));

    if (newStatus) {
      socket.emit('donorOnline', donorInfo.phone);
      Alert.alert('Online ✅', 'You are now visible to seekers.');
    } else {
      socket.emit('donorOffline', donorInfo.phone);
      Alert.alert('Offline', 'You are no longer visible.');
    }
  };

  const handleAcceptCall = () => {
    Vibration.cancel();
    setShowCallModal(false);
    Alert.alert('Call Accepted', 'Connecting you to ' + (incomingCall?.callerName || 'Seeker') + '...');
    // Here you would add WebRTC logic later
  };

  const handleDeclineCall = () => {
    Vibration.cancel();
    setShowCallModal(false);
    socket.emit('callDeclined', { to: incomingCall?.callerPhone });
  };

  if (loading || !donorInfo) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#cc0000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Incoming Call Modal */}
      <Modal visible={showCallModal} animationType="slide" transparent={false}>
        <View style={s.callContainer}>
          <View style={s.callHeader}>
            <Text style={s.incomingText}>INCOMING BLOOD REQUEST</Text>
            <View style={s.callerCircle}>
              <Text style={s.callerInitial}>{incomingCall?.callerName?.[0] || '?'}</Text>
            </View>
            <Text style={s.callerName}>{incomingCall?.callerName || 'Unknown Seeker'}</Text>
            <Text style={s.callerSub}>Needs your help urgently!</Text>
          </View>

          <View style={s.callActions}>
            <TouchableOpacity style={[s.callBtn, s.declineBtn]} onPress={handleDeclineCall}>
              <Text style={s.callBtnIcon}>✖</Text>
              <Text style={s.callBtnText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.callBtn, s.acceptBtn]} onPress={handleAcceptCall}>
              <Text style={s.callBtnIcon}>📞</Text>
              <Text style={s.callBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={async () => {
          await AsyncStorage.clear();
          navigation.replace('Home');
        }}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Profile Card (Instagram Style) */}
        <View style={s.profileHeader}>
          <View style={s.profileImage}>
            <Text style={s.profileInitial}>{donorInfo.fullName[0]}</Text>
          </View>
          <Text style={s.nameText}>{donorInfo.fullName}</Text>
          <Text style={s.bloodPill}>{donorInfo.bloodGroup} Donor</Text>
          <Text style={s.locText}>📍 {donorInfo.city}, {donorInfo.state}</Text>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          <View style={s.statBox}><Text style={s.statNum}>0</Text><Text style={s.statLabel}>Donations</Text></View>
          <View style={s.statDivider} />
          <View style={s.statBox}><Text style={s.statNum}>0</Text><Text style={s.statLabel}>Lives Saved</Text></View>
          <View style={s.statDivider} />
          <View style={s.statBox}><Text style={s.statNum}>0</Text><Text style={s.statLabel}>Requests</Text></View>
        </View>

        {/* Online Toggle Card */}
        <View style={s.statusCard}>
          <View>
            <Text style={s.statusTitle}>Availability Status</Text>
            <Text style={s.statusDesc}>{isOnline ? 'You are visible to seekers' : 'You are currently hidden'}</Text>
          </View>
          <TouchableOpacity 
            style={[s.toggleBtn, isOnline ? s.btnOn : s.btnOff]} 
            onPress={toggleOnline}
          >
            <Text style={s.toggleBtnText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoText}>Keep your status **ONLINE** when you are ready to help. You will receive a call notification if someone needs your blood type.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  backText: { color: '#666', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  logoutText: { color: '#cc0000', fontWeight: '600' },

  content: { paddingBottom: 30 },
  profileHeader: { alignItems: 'center', paddingVertical: 30 },
  profileImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#cc0000', justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5 },
  profileInitial: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  nameText: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  bloodPill: { backgroundColor: '#ffebee', color: '#cc0000', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginTop: 8, fontWeight: 'bold', fontSize: 13 },
  locText: { fontSize: 13, color: '#888', marginTop: 10 },

  statsRow: { flexDirection: 'row', paddingVertical: 20, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#eee', marginTop: 10 },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 11, color: '#aaa', marginTop: 2 },
  statDivider: { width: 0.5, height: '80%', backgroundColor: '#eee' },

  statusCard: { margin: 20, padding: 25, borderRadius: 20, backgroundColor: '#f9f9f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#efefef' },
  statusTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  toggleBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  btnOn: { backgroundColor: '#28a745' },
  btnOff: { backgroundColor: '#cc0000' },
  toggleBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  infoBox: { paddingHorizontal: 30, marginTop: 10 },
  infoText: { fontSize: 12, color: '#aaa', textAlign: 'center', lineHeight: 18 },

  // Incoming Call Styles
  callContainer: { flex: 1, backgroundColor: '#cc0000', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 50 },
  callHeader: { alignItems: 'center' },
  incomingText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 40 },
  callerCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  callerInitial: { color: '#fff', fontSize: 60, fontWeight: 'bold' },
  callerName: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  callerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 10 },
  callActions: { flexDirection: 'row', gap: 60, width: '100%', justifyContent: 'center' },
  callBtn: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  declineBtn: { backgroundColor: '#ff4b2b' },
  acceptBtn: { backgroundColor: '#28a745' },
  callBtnIcon: { color: '#fff', fontSize: 24 },
  callBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 5, position: 'absolute', bottom: -25 },
});

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, SafeAreaView, Image, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [donorInfo, setDonorInfo] = useState(null);

  useEffect(() => {
    loadUser();
    const unsubscribe = navigation.addListener('focus', loadUser);
    return unsubscribe;
  }, [navigation]);

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('donorInfo');
      setDonorInfo(data ? JSON.parse(data) : null);
    } catch (e) {}
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Modern Header */}
      <View style={s.header}>
        <View>
          <Text style={s.logo}>STF</Text>
          <Text style={s.logoSub}>Stranger To Friends</Text>
        </View>
        <View style={s.headerRight}>
          {donorInfo ? (
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={s.userCircle}>
              <Text style={s.userInitial}>{donorInfo.fullName[0]}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.loginPill}>
              <Text style={s.loginPillText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        
        {/* Story-style Stats (Instagram Feel) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.storyContainer}>
          <View style={s.storyItem}>
            <View style={[s.storyCircle, { borderColor: '#cc0000' }]}><Text style={s.storyEmoji}>❤️</Text></View>
            <Text style={s.storyText}>Donors</Text>
          </View>
          <View style={s.storyItem}>
            <View style={[s.storyCircle, { borderColor: '#007bff' }]}><Text style={s.storyEmoji}>🔍</Text></View>
            <Text style={s.storyText}>Requests</Text>
          </View>
          <View style={s.storyItem}>
            <View style={[s.storyCircle, { borderColor: '#28a745' }]}><Text style={s.storyEmoji}>✔</Text></View>
            <Text style={s.storyText}>Saved</Text>
          </View>
          <View style={s.storyItem}>
             <View style={[s.storyCircle, { borderColor: '#ffc107' }]}><Text style={s.storyEmoji}>📍</Text></View>
             <Text style={s.storyText}>Nearby</Text>
          </View>
        </ScrollView>

        {/* Hero Card */}
        <View style={s.heroCard}>
          <Text style={s.heroTitle}>{'Save a Life,\nBecome a Hero.'}</Text>
          <Text style={s.heroDesc}>Connect with blood donors instantly. Your one donation can save up to 3 lives.</Text>
          <TouchableOpacity style={s.mainBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={s.mainBtnText}>Register Now →</Text>
          </TouchableOpacity>
        </View>

        {/* Action Feed (Instagram Style) */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={s.feedRow}>
          <TouchableOpacity style={s.feedCard} onPress={() => navigation.navigate('Search')}>
            <View style={[s.feedIconBg, { backgroundColor: '#ffebee' }]}>
              <Text style={s.feedIcon}>🔎</Text>
            </View>
            <Text style={s.feedLabel}>Find Blood</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.feedCard} onPress={() => navigation.navigate('Register')}>
            <View style={[s.feedIconBg, { backgroundColor: '#e8f5e9' }]}>
              <Text style={s.feedIcon}>🩸</Text>
            </View>
            <Text style={s.feedLabel}>Donate</Text>
          </TouchableOpacity>
        </View>

        {/* How it Works - Modernized */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>How it works</Text>
        </View>

        {[
          { icon: '📝', title: 'Register', desc: 'Join our community of heroes.' },
          { icon: '🔍', title: 'Find Match', desc: 'Search for the right blood type.' },
          { icon: '📞', title: 'Connect', desc: 'Call and coordinate directly.' }
        ].map((item, index) => (
          <View key={index} style={s.stepItem}>
             <View style={s.stepIconWrap}><Text style={{fontSize: 20}}>{item.icon}</Text></View>
             <View>
               <Text style={s.stepTitle}>{item.title}</Text>
               <Text style={s.stepDesc}>{item.desc}</Text>
             </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#efefef'
  },
  logo: { fontSize: 24, fontWeight: 'bold', color: '#cc0000', letterSpacing: -1 },
  logoSub: { fontSize: 9, color: '#aaa', marginTop: -5, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  userCircle: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#cc0000', justifyContent: 'center', alignItems: 'center' },
  userInitial: { color: '#fff', fontWeight: 'bold' },
  loginPill: { backgroundColor: '#cc0000', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  loginPillText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  
  scrollContent: { paddingBottom: 20 },
  
  storyContainer: { paddingVertical: 15, paddingHorizontal: 15 },
  storyItem: { alignItems: 'center', marginRight: 20 },
  storyCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, padding: 3, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', marginBottom: 5 },
  storyEmoji: { fontSize: 28 },
  storyText: { fontSize: 11, color: '#444', fontWeight: '500' },

  heroCard: { 
    margin: 20, padding: 25, borderRadius: 25, backgroundColor: '#cc0000',
    shadowColor: '#cc0000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10
  },
  heroTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', lineHeight: 38 },
  heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 10, lineHeight: 20 },
  mainBtn: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginTop: 20, alignItems: 'center' },
  mainBtnText: { color: '#cc0000', fontWeight: 'bold', fontSize: 16 },

  sectionHeader: { paddingHorizontal: 20, marginTop: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },

  feedRow: { flexDirection: 'row', paddingHorizontal: 15, justifyContent: 'space-between' },
  feedCard: { width: (width / 2) - 25, backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0' },
  feedIconBg: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  feedIcon: { fontSize: 24 },
  feedLabel: { fontWeight: 'bold', fontSize: 14, color: '#333' },

  stepItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, marginBottom: 20 },
  stepIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  stepTitle: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  stepDesc: { fontSize: 12, color: '#888' },
});

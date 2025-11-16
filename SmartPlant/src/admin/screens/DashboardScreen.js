import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { UserIcon, MailIcon, FeedbackIcon, LogoutIcon } from '../Icons';
import { useAdminContext } from '../AdminContext';
import { getAuth } from 'firebase/auth';
import AdminBottomNavBar from '../components/AdminBottomNavBar';

const DashboardScreen = ({ navigation }) => {
  const { users, mails, feedbacks, handleLogout } = useAdminContext();
  const navigate = (screen) => navigation.navigate(screen);
  const [userName, setUserName] = useState('Admin');
  const [greeting, setGreeting] = useState('Good morning!');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const currentUserData = users.find(u => u.firebase_uid === user.uid);
      if (currentUserData) {
        setUserName(currentUserData.name);
      }
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning!');
    else if (hour < 18) setGreeting('Good afternoon!');
    else setGreeting('Good evening!');
  }, [users]);

  const unreadMails = mails.filter(m => !m.read).length;

  // ==== Feedback totals ====
  const totalFeedbacks = feedbacks.length;
  const pendingFeedbacks = feedbacks.filter(f => {
    const notes = f?.admin_notes;
    return !notes || String(notes).trim() === '';
  }).length;

  // ==== Plant counts (unchanged) ====
  const plantCount = users.reduce((acc, user) => acc + (user.plantId || 0), 0);
  const commonCount = Math.floor(plantCount * 0.8);
  const rareCount = Math.floor(plantCount * 0.15);
  const endangeredCount = plantCount - commonCount - rareCount;

  const currentUserData = users.find(u => u.firebase_uid === getAuth().currentUser?.uid);
  const photoURL = currentUserData?.details?.profile_pic;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => {
              if (currentUserData) {
                navigation.navigate('EditUser', { user: currentUserData });
              } else {
                Alert.alert("Error", "Could not find your user data to edit.");
              }
            }}
          >
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: currentUserData?.color || '#c8b6a6' }]}>
                <Text style={styles.avatarText}>{(userName || 'A').charAt(0)}</Text>
              </View>
            )}
            <View>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleLogout(navigation)}>
            <LogoutIcon color="#3C3633" />
          </TouchableOpacity>
        </View>

        <View style={styles.hr} />

        {/* Quick Menus */}
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={() => navigate('AccountManagement')} style={styles.menuItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
              <UserIcon size={24} color="#ef4444" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Accounts</Text>
              <Text style={styles.menuSubtitle}>{users.length} users</Text>
            </View>
            <Text style={styles.menuValue}>{users.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigate('MailManagement')} style={styles.menuItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
              <MailIcon size={24} color="#3b82f6" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Mailbox</Text>
              <Text style={styles.menuSubtitle}>{unreadMails} unread</Text>
            </View>
            <Text style={styles.menuValue}>{unreadMails}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigate('FeedbackManagement')} style={styles.menuItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
              <FeedbackIcon size={24} color="#22c55e" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Feedback</Text>
              {/* Show pending count in subtitle */}
              <Text style={styles.menuSubtitle}>{pendingFeedbacks} pending</Text>
            </View>
            {/* Show total feedback on the right big number */}
            <Text style={styles.menuValue}>{totalFeedbacks}</Text>
          </TouchableOpacity>
        </View>


        {/* IoT Dashboard Section */}
        <View style={styles.iotContainer}>
          <Text style={styles.iotTitle}>IoT Dashboard</Text>
          <Text style={styles.iotSubtitle}>
            View live sensor readings, radar sweep, motion & sound events in real time.
          </Text>

          <TouchableOpacity
            style={styles.iotButton}
            onPress={() => navigate('Back')}
            activeOpacity={0.9}
          >
            <Text style={styles.iotButtonText}>Open IoT Dashboard</Text>
          </TouchableOpacity>

          <View style={styles.iotChipsRow}>
            <View style={[styles.iotChip, { backgroundColor: '#eef2ff' }]}>
              <Text style={styles.iotChipText}>Ultrasonic Radar</Text>
            </View>
            <View style={[styles.iotChip, { backgroundColor: '#ecfeff' }]}>
              <Text style={styles.iotChipText}>Temperature & Humidity</Text>
            </View>
            <View style={[styles.iotChip, { backgroundColor: '#f0fdf4' }]}>
              <Text style={styles.iotChipText}>Motion & Sound Events</Text>
            </View>
          </View>
        </View>

        {/*AI Agent Plant Assistant Section */}
        <View style={styles.agentContainer}>
          <Text style={styles.agentTitle}>AI Agent Plant Assistant</Text>
          <Text style={styles.agentSubtitle}>
            Ask the AI to analyze nearby IoT sensor readings and check plant conditions.
          </Text>

          <TouchableOpacity
            style={styles.agentButton}
            onPress={() => navigate('AIChatScreen')}
            activeOpacity={0.9}
          >
            <Text style={styles.agentButtonText}>Chat With AI Agent</Text>
          </TouchableOpacity>

         
        </View>


      </ScrollView>

      <AdminBottomNavBar navigation={navigation} activeScreen="Dashboard" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5', paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, paddingBottom: 0 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 16, alignItems: 'center', justifyContent: 'center' },
  greetingText: { fontSize: 16, color: '#75685a' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#3C3633' },
  avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  hr: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  menuContainer: { gap: 16 },
  menuItem: {
    backgroundColor: 'white', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.20, shadowRadius: 1.41, elevation: 2,
  },
  iconContainer: { padding: 12, borderRadius: 8, marginRight: 16 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontWeight: 'bold', color: '#3C3633' },
  menuSubtitle: { fontSize: 14, color: '#75685a' },
  menuValue: { fontSize: 24, fontWeight: 'bold', color: '#3C3633' },
  iotContainer: {
    marginTop: 24, backgroundColor: 'white', padding: 16, borderRadius: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.20, shadowRadius: 1.41, elevation: 2,
  },
  iotTitle: { fontSize: 18, fontWeight: 'bold', color: '#3C3633', marginBottom: 6 },
  iotSubtitle: { color: '#75685a', marginBottom: 16 },
  iotButton: {
    backgroundColor: '#3C3633', paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  iotButtonText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
  iotChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  iotChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  iotChipText: { color: '#374151', fontSize: 12, fontWeight: '600' },

  agentContainer: {
    marginTop: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },

  agentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C3633',
    marginBottom: 6,
  },

  agentSubtitle: {
    color: '#75685a',
    marginBottom: 16,
  },

  agentButton: {
    backgroundColor: "#578C5B",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  agentButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },

});

export default DashboardScreen;

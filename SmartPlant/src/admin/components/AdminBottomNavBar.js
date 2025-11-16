import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, UserIcon, MailIcon, FeedbackIcon } from '../Icons';

const AdminBottomNavBar = ({ navigation, activeScreen }) => {
    const navigate = (screen) => navigation.navigate(screen);
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.navBar, { paddingBottom: 4 + insets.bottom }]}>
            <TouchableOpacity onPress={() => navigate('Dashboard')} style={styles.navItem}>
                <HomeIcon color={activeScreen === 'Dashboard' ? '#A59480' : '#75685a'} />
                <Text style={[styles.navText, activeScreen === 'Dashboard' && styles.activeNavText]}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate('AccountManagement')} style={styles.navItem}>
                <UserIcon color={activeScreen === 'AccountManagement' ? '#A59480' : '#75685a'} />
                <Text style={[styles.navText, activeScreen === 'AccountManagement' && styles.activeNavText]}>Accounts</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate('MailManagement')} style={styles.navItem}>
                <MailIcon color={activeScreen === 'MailManagement' ? '#A59480' : '#75685a'} />
                <Text style={[styles.navText, activeScreen === 'MailManagement' && styles.activeNavText]}>Mail</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate('FeedbackManagement')} style={styles.navItem}>
                <FeedbackIcon color={activeScreen === 'FeedbackManagement' ? '#A59480' : '#75685a'} />
                <Text style={[styles.navText, activeScreen === 'FeedbackManagement' && styles.activeNavText]}>Feedback</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 4,
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 12,
        color: '#75685a',
    },
    activeNavText: {
        color: '#A59480',
    },
});

export default AdminBottomNavBar;

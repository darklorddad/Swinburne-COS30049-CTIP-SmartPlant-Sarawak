import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
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
            const currentUserData = users.find(u => u.id === user.uid);
            if (currentUserData) {
                setUserName(currentUserData.name);
            }
        }

        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting('Good morning!');
        } else if (hour < 18) {
            setGreeting('Good afternoon!');
        } else {
            setGreeting('Good evening!');
        }
    }, [users]);

    const unreadMails = mails.filter(m => !m.read).length;
    const pendingFeedbacks = feedbacks.filter(f => f.status === 'pending').length;
    const plantCount = users.reduce((acc, user) => acc + (user.plantId || 0), 0);
    const commonCount = Math.floor(plantCount * 0.8);
    const rareCount = Math.floor(plantCount * 0.15);
    const endangeredCount = plantCount - commonCount - rareCount;
    const currentUserData = users.find(u => u.id === getAuth().currentUser?.uid);
    const photoURL = currentUserData?.details?.profile_pic;

    return (
        <View style={{flex: 1}}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center'}} onPress={() => navigation.navigate('EditProfile', { email: getAuth().currentUser?.email })}>
                        {photoURL ? (
                            <Image source={{ uri: photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, {backgroundColor: currentUserData?.color || '#c8b6a6'}]}>
                                <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
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
                            <Text style={styles.menuSubtitle}>{pendingFeedbacks} pending</Text>
                        </View>
                        <Text style={styles.menuValue}>{pendingFeedbacks}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.distributionContainer}>
                    <Text style={styles.distributionTitle}>Plant Rarity Distribution</Text>
                    <View style={styles.progressItemsContainer}>
                        <View>
                            <View style={styles.progressLabelContainer}>
                                <Text style={styles.progressLabel}>Common</Text>
                                <Text style={styles.progressValue}>{commonCount} / {plantCount}</Text>
                            </View>
                            <View style={styles.progressBarBackground}>
                                <View style={[styles.progressBar, { width: `${(commonCount / plantCount) * 100}%`, backgroundColor: '#A59480' }]} />
                            </View>
                        </View>
                        <View>
                            <View style={styles.progressLabelContainer}>
                                <Text style={styles.progressLabel}>Rare</Text>
                                <Text style={styles.progressValue}>{rareCount} / {plantCount}</Text>
                            </View>
                            <View style={styles.progressBarBackground}>
                                <View style={[styles.progressBar, { width: `${(rareCount / plantCount) * 100}%`, backgroundColor: '#C8B6A6' }]} />
                            </View>
                        </View>
                        <View>
                            <View style={styles.progressLabelContainer}>
                                <Text style={styles.progressLabel}>Endangered</Text>
                                <Text style={styles.progressValue}>{endangeredCount} / {plantCount}</Text>
                            </View>
                            <View style={styles.progressBarBackground}>
                                <View style={[styles.progressBar, { width: `${(endangeredCount / plantCount) * 100}%`, backgroundColor: '#f87171' }]} />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <AdminBottomNavBar navigation={navigation} activeScreen="Dashboard" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFBF5',
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 0,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    greetingText: {
        fontSize: 16,
        color: '#75685a',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    avatarText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    hr: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 16,
    },
    menuContainer: {
        gap: 16,
    },
    menuItem: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    iconContainer: {
        padding: 12,
        borderRadius: 8,
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontWeight: 'bold',
        color: '#3C3633',
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#75685a',
    },
    menuValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    distributionContainer: {
        marginTop: 24,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    distributionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3C3633',
        marginBottom: 16,
    },
    progressItemsContainer: {
        gap: 16,
    },
    progressLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressLabel: {
        fontWeight: '600',
        color: '#4b5563',
        fontSize: 14,
    },
    progressValue: {
        color: '#6b7280',
        fontSize: 14,
    },
    progressBarBackground: {
        width: '100%',
        backgroundColor: '#e5e7eb',
        borderRadius: 9999,
        height: 10,
    },
    progressBar: {
        height: 10,
        borderRadius: 9999,
    },
});

export default DashboardScreen;

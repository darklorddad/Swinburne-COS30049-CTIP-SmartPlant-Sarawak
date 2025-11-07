import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { BackIcon, EditIcon, TrashIcon } from '../Icons';
import { useAdminContext } from '../AdminContext';

const UserProfileScreen = ({ route, navigation }) => {
    const { handleDeleteUser, plantIdentities, feedbacks } = useAdminContext();
    const { user } = route.params;

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>User not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const onDelete = (userId) => {
        handleDeleteUser(userId);
        navigation.navigate('AccountManagement');
    };

    const plantsIddCount = plantIdentities.filter(p => p.user_id === user.id).length;
    const reportsCount = feedbacks.filter(f => f.user_id == user.id).length;

    return (
        <View style={styles.outerContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('AccountManagement')}>
                    <BackIcon color="#3C3633" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>User Profile</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('EditUser', { user: user })}>
                        <EditIcon color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(user.id)} style={styles.actionButton}>
                        <TrashIcon color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
            
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.profileHeader}>
                        {user.details.profile_pic ? (
                        <Image source={{ uri: user.details.profile_pic }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, {backgroundColor: user.color || '#c8b6a6'}]}>
                            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                        </View>
                    )}
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userRole}>{user.details.role.charAt(0).toUpperCase() + user.details.role.slice(1)}</Text>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusIndicator, { backgroundColor: user.status === 'active' ? '#22c55e' : '#9ca3af' }]} />
                        <Text style={styles.statusText}>{user.status}</Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Information</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>User ID</Text>
                        <Text style={styles.infoValue}>{user.id}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user.details.email || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Contact</Text>
                        <Text style={styles.infoValue}>{user.details.contact || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Address</Text>
                        <Text style={styles.infoValue}>{user.details.address || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Gender</Text>
                        <Text style={styles.infoValue}>{user.details.gender || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Age</Text>
                        <Text style={styles.infoValue}>{user.details.age || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Date of Birth</Text>
                        <Text style={styles.infoValue}>{user.details.date_of_birth || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>NRIC</Text>
                        <Text style={styles.infoValue}>{user.details.nric || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Postcode</Text>
                        <Text style={styles.infoValue}>{user.details.postcode || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Race</Text>
                        <Text style={styles.infoValue}>{user.details.race || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Occupation</Text>
                        <Text style={styles.infoValue}>{user.details.occupation || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Division</Text>
                        <Text style={styles.infoValue}>{user.details.division || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Login Method</Text>
                        <Text style={styles.infoValue}>{user.details.login_method || 'N/A'}</Text>
                    </View>
                    <View style={styles.hr} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Created At</Text>
                        <Text style={styles.infoValue}>{user.details.created_at && user.details.created_at.seconds ? new Date(user.details.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}</Text>
                    </View>
                </View>
                
                <View style={styles.activityCard}>
                    <Text style={styles.cardTitle}>Activity</Text>
                    <View style={styles.activityContainer}>
                        <View style={styles.activityItem}>
                            <Text style={styles.activityValue}>{plantsIddCount}</Text>
                            <Text style={styles.activityLabel}>Plants ID'd</Text>
                        </View>
                        <View style={styles.activityItem}>
                            <Text style={styles.activityValue}>{reportsCount}</Text>
                            <Text style={styles.activityLabel}>Reports</Text>
                        </View>
                        <View style={styles.activityItem}>
                            <Text style={styles.activityValue}>{reportsCount}</Text>
                            <Text style={styles.activityLabel}>Feedbacks</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#f8fafc',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3C3633',
        flex: 1,
        textAlign: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 999,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 32,
    },
    profileHeader: {
        alignItems: 'center',
        paddingTop: 16,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3C3633',
        marginTop: 16,
    },
    userRole: {
        fontSize: 16,
        color: '#75685a',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    statusIndicator: {
        height: 10,
        width: 10,
        borderRadius: 5,
    },
    statusText: {
        fontSize: 14,
        textTransform: 'capitalize',
        color: '#4b5563',
    },
    infoCard: {
        marginTop: 32,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3C3633',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    infoLabel: {
        fontWeight: '600',
        color: '#6b7280',
        fontSize: 14,
    },
    infoValue: {
        fontSize: 14,
        color: '#3C3633',
    },
    hr: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 8,
    },
    activityCard: {
        marginTop: 24,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    activityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    activityItem: {
        alignItems: 'center',
    },
    activityValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#A59480',
    },
    activityLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
});

export default UserProfileScreen;

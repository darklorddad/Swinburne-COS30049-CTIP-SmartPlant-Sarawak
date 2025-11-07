import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Image } from 'react-native';
import { BackIcon, StarIcon } from '../Icons';
import SearchBar from '../components/SearchBar';
import { useAdminContext } from '../AdminContext';
import AdminBottomNavBar from '../components/AdminBottomNavBar';

const MailManagementScreen = ({ navigation }) => {
    const { mails, users, handleToggleMailRead } = useAdminContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [expandedGroups, setExpandedGroups] = useState({ Today: true });

    const onToggleRead = (mailId, currentStatus) => {
        handleToggleMailRead(mailId, currentStatus);
    };

    const toggleGroup = (title) => {
        setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const filteredMails = mails.filter(mail => {
        const matchesSearch = (mail.title && mail.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
                              (mail.message && mail.message.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchesSearch) return false;
        if (filter === 'unread') return !mail.read;
        if (filter === 'read') return mail.read;
        return true;
    });

    const groupedMails = filteredMails.reduce((acc, mail) => {
        (acc[mail.timeGroup] = acc[mail.timeGroup] || []).push(mail);
        return acc;
    }, {});

    const sections = Object.keys(groupedMails).map(group => ({
        title: group,
        data: expandedGroups[group] ? groupedMails[group] : []
    }));

    const renderMailItem = ({ item }) => {
        const sender = users.find(u => u.id === item.userId);
        const senderName = sender ? sender.name : 'System';
        const profilePic = sender ? sender.details.profile_pic : null;

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('MailDetail', { mail: item })}
                onLongPress={() => onToggleRead(item.id, item.read)}
                delayLongPress={200}
                style={styles.mailItem}
            >
                {profilePic ? (
                    <Image source={{ uri: profilePic }} style={styles.mailStatusIndicator} />
                ) : (
                    <View style={[styles.mailStatusIndicator, { backgroundColor: sender?.color || '#A59480', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={styles.avatarText}>{senderName.charAt(0)}</Text>
                    </View>
                )}
                <View style={styles.mailContent}>
                    <Text style={styles.mailFrom} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.mailSubject} numberOfLines={1}>{item.message}</Text>
                </View>
                <View style={styles.mailMeta}>
                    <Text style={styles.mailDate}>{item.createdAt && item.createdAt.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                    <BackIcon color="#3C3633" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mail Management</Text>
                <View style={{ width: 24 }} />
            </View>
            <View style={{paddingHorizontal: 16}}>
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                <View style={[styles.filterContainer]}>
                  <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterButton, filter === 'all' && styles.activeFilter]}>
                      <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setFilter('unread')} style={[styles.filterButton, filter === 'unread' && styles.activeFilter]}>
                      <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>Unread</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setFilter('read')} style={[styles.filterButton, filter === 'read' && styles.activeFilter]}>
                      <Text style={[styles.filterText, filter === 'read' && styles.activeFilterText]}>Read</Text>
                  </TouchableOpacity>
                </View>
            </View>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMailItem}
                renderSectionHeader={({ section: { title } }) => (
                    <TouchableOpacity onPress={() => toggleGroup(title)} style={styles.groupHeaderContainer}>
                        <Text style={styles.groupHeader}>{title}</Text>
                        <Text style={styles.groupHeaderIcon}>{expandedGroups[title] ? '▼' : '▶'}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.noMailText}>No mail found.</Text>}
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, }}
                style={styles.list}
            />
        <AdminBottomNavBar navigation={navigation} activeScreen="MailManagement" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFBF5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingBottom: 8,
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
        marginVertical: 8,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeFilter: {
        backgroundColor: '#A59480',
        borderRadius: 8,
    },
    filterText: {
        fontWeight: '600',
        color: '#75685a',
    },
    activeFilterText: {
        color: 'white',
    },
    list: {
        marginTop: 16,
    },
    groupHeader: {
        fontWeight: 'bold',
        color: '#3C3633',
    },
    groupHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    groupHeaderIcon: {
        fontWeight: 'bold',
        color: '#3C3633',
        fontSize: 16,
    },
    mailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    mailStatusIndicator: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    mailContent: {
        flex: 1,
        minWidth: 0,
    },
    mailFrom: {
        fontWeight: 'bold',
        color: '#3C3633',
    },
    mailSubject: {
        color: '#75685a',
        fontSize: 14,
    },
    mailMeta: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },
    mailDate: {
        fontSize: 12,
        color: '#75685a',
        marginBottom: 4,
    },
    starButton: {
        padding: 4,
    },
    noMailText: {
        textAlign: 'center',
        color: '#75685a',
        marginTop: 32,
    },
    avatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default MailManagementScreen;

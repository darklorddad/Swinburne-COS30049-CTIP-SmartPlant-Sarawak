import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { BackIcon } from '../Icons';
import SearchBar from '../components/SearchBar';
import { useAdminContext } from '../AdminContext';
import AdminBottomNavBar from '../components/AdminBottomNavBar';

const FeedbackManagementScreen = ({ navigation }) => {
    const { feedbacks } = useAdminContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const filteredFeedbacks = feedbacks.filter(
      feedback =>
        (feedback.report_type && feedback.report_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (feedback.description && feedback.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderFeedbackItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('FeedbackDetail', { feedback: item })} style={styles.feedbackItem}>
            <View style={styles.avatar} />
            <View style={styles.content}>
                <Text style={styles.subject} numberOfLines={1}>{item.report_type}</Text>
                <Text style={styles.body} numberOfLines={1}>{item.description}</Text>
            </View>
            <View style={styles.meta}>
                <Text style={styles.time}>{new Date(item.created_at.seconds * 1000).toLocaleDateString()}</Text>
                {item.admin_notes && item.admin_notes.length > 0 && 
                    <View style={styles.repliedBadge}>
                        <Text style={styles.repliedText}>Replied</Text>
                    </View>
                }
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                    <BackIcon color="#3C3633" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Feedback Management</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={{paddingHorizontal: 16}}>
                <SearchBar value={searchQuery} onChange={setSearchQuery}/>
                <View style={[styles.filterContainer]}>
                  <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterButton, filter === 'all' && styles.activeFilter]}>
                      <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
                  </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={filteredFeedbacks}
                renderItem={renderFeedbackItem}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No feedback found</Text>
                    </View>
                }
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, }}
                style={styles.list}
            />
        <AdminBottomNavBar navigation={navigation} activeScreen="FeedbackManagement" />
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
    list: {
        flex: 1,
    },
    feedbackItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
        marginRight: 16,
    },
    content: {
        flex: 1,
        minWidth: 0,
    },
    subject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    body: {
        color: '#75685a',
        fontSize: 14,
    },
    meta: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },
    time: {
        color: '#75685a',
        fontSize: 12,
        marginBottom: 4,
    },
    repliedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#dcfce7',
        borderRadius: 999,
    },
    repliedText: {
        color: '#166534',
        fontSize: 12,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
    },
    emptyText: {
        color: '#75685a',
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
});

export default FeedbackManagementScreen;

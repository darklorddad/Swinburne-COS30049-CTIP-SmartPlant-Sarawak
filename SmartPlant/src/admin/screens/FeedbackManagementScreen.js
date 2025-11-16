import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { BackIcon } from '../Icons';
import SearchBar from '../components/SearchBar';
import { useAdminContext } from '../AdminContext';
import AdminBottomNavBar from '../components/AdminBottomNavBar';

const safeLower = (v) => (typeof v === 'string' ? v.toLowerCase() : '');

const displayDate = (item) => {
  const ts = item?.createdAt || item?.created_at;
  if (ts?.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
  if (typeof ts === 'string' || ts instanceof Date) return new Date(ts).toLocaleDateString();
  return '—';
};

const FeedbackManagementScreen = ({ navigation }) => {
  const { feedbacks, users } = useAdminContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredFeedbacks = feedbacks.filter((f) => {
    const subject = f.title ?? f.report_type ?? '';
    const body = f.details ?? f.description ?? '';
    const hay = `${subject} ${body}`;
    const matchesSearch = safeLower(hay).includes(safeLower(searchQuery));
    if (!matchesSearch) return false;

    if (filter === 'read') {
        return f.admin_notes && String(f.admin_notes).trim() !== '';
    }
    if (filter === 'unread') {
        return !f.admin_notes || String(f.admin_notes).trim() === '';
    }
    return true;
  });

  const renderFeedbackItem = ({ item }) => {
    // Find the user account to get profile pic / name
    const account = users.find(u => u.firebase_uid === item.user_id);
    const photoURL = account?.details?.profile_pic;
    const senderName = account?.name || 'Unknown User';
    const subject = item.title ?? item.report_type ?? 'Feedback';
    const body = item.details ?? item.description ?? '';
    const replied = !!(item.admin_notes && String(item.admin_notes).trim() !== '');

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('FeedbackDetail', { feedback: item })}
        style={styles.feedbackItem}
      >
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatarImg} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: account?.color || '#e5e7eb', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={styles.avatarText}>{(senderName || 'U').charAt(0)}</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.subject} numberOfLines={1}>{senderName}</Text>
          <Text style={styles.body} numberOfLines={1}>{subject}</Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.time}>{displayDate(item)}</Text>
          {replied && (
            <View style={styles.repliedBadge}>
              <Text style={styles.repliedText}>Replied</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <BackIcon color="#3C3633" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback Management</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <View style={[styles.filterContainer]}>
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('unread')}
            style={[styles.filterButton, filter === 'unread' && styles.activeFilter]}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>Unread</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('read')}
            style={[styles.filterButton, filter === 'read' && styles.activeFilter]}
          >
            <Text style={[styles.filterText, filter === 'read' && styles.activeFilterText]}>Read</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredFeedbacks}
        renderItem={renderFeedbackItem}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No feedback found</Text>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}
        style={styles.list}
      />

      <AdminBottomNavBar navigation={navigation} activeScreen="FeedbackManagement" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 8, paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#3C3633' },
  list: { flex: 1 },

  feedbackItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 16 },
  avatarImg: { width: 40, height: 40, borderRadius: 20, marginRight: 16 },

  content: { flex: 1, minWidth: 0 },
  subject: { fontSize: 16, fontWeight: 'bold', color: '#3C3633' },
  body: { color: '#75685a', fontSize: 14 },

  meta: { alignItems: 'flex-end', marginLeft: 8 },
  time: { color: '#75685a', fontSize: 12, marginBottom: 4 },
  repliedBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#dcfce7', borderRadius: 999 },
  repliedText: { color: '#166534', fontSize: 12 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 50 },
  emptyText: { color: '#75685a' },

  filterContainer: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 8, marginVertical: 8 },
  filterButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeFilter: { backgroundColor: '#A59480', borderRadius: 8 },
  filterText: { fontWeight: '600', color: '#75685a' },
  activeFilterText: { color: 'white' },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default FeedbackManagementScreen;

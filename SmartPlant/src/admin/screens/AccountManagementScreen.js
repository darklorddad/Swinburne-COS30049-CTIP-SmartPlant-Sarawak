import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { BackIcon, PlusIcon, StarIcon } from '../Icons';
import SearchBar from '../components/SearchBar';
import { useAdminContext } from '../AdminContext';
import AdminBottomNavBar from '../components/AdminBottomNavBar';

const AccountManagementScreen = ({ navigation }) => {
    const { users, handleToggleUserFavourite } = useAdminContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const navigate = (screen, params) => navigation.navigate(screen, params);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        
        if (filter === 'all') return true;
        if (filter === 'favourite') return user.favourite;
        return user.status === filter;
    });

    const renderUser = ({ item }) => (
        <TouchableOpacity onPress={() => navigate('UserProfile', { user: item })} style={styles.userTile}>
            {item.details.profile_pic ? (
                <Image source={{ uri: item.details.profile_pic }} style={styles.userTileImage} />
            ) : (
                <View style={[styles.userTileInitial, {backgroundColor: item.color || '#c8b6a6'}]}>
                    <Text style={styles.userTileInitialText}>{(item.name || 'U').charAt(0)}</Text>
                </View>
            )}
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleToggleUserFavourite(item.id); }} style={styles.starButton}>
                <StarIcon filled={item.favourite} />
            </TouchableOpacity>
            <View style={styles.userNameContainer}>
                <Text style={styles.userNameText} numberOfLines={1}>{item.name || 'Unnamed User'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('Dashboard')}><BackIcon color="#3C3633" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Account Management</Text>
                <TouchableOpacity onPress={() => navigate('AddUser')}><PlusIcon color="#3C3633" /></TouchableOpacity>
            </View>
            <View style={{paddingHorizontal: 16}}>
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <View style={[styles.filterContainer]}>
                <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterButton, filter === 'all' && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('active')} style={[styles.filterButton, filter === 'active' && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('inactive')} style={[styles.filterButton, filter === 'inactive' && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === 'inactive' && styles.activeFilterText]}>Inactive</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('favourite')} style={[styles.filterButton, filter === 'favourite' && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === 'favourite' && styles.activeFilterText]}>Favourite</Text>
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                ListEmptyComponent={<Text style={styles.noUsersText}>No accounts found</Text>}
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: 16 }}
            />
        <AdminBottomNavBar navigation={navigation} activeScreen="AccountManagement" />
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
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
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
        fontSize: 14,
        color: '#75685a',
    },
    activeFilterText: {
        color: 'white',
    },
    row: {
        justifyContent: 'space-between',
        marginTop: 16,
    },
    userTile: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    userTileImage: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        resizeMode: 'cover',
    },
    userTileInitial: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userTileInitialText: {
        color: 'white',
        fontSize: 48,
        fontWeight: 'bold',
    },
    userNameContainer: {
        position: 'absolute',
        bottom: 8,
        left: 16,
        right: 16,
    },
    userNameText: {
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    noUsersText: {
        textAlign: 'center',
        color: '#75685a',
        marginTop: 32,
    },
    starButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
    },
});

export default AccountManagementScreen;

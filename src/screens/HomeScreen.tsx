import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    RefreshControl,
    Alert,
    ScrollView as RNScrollView,
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { TextEntry, TextCategory, CATEGORY_CONFIG } from '../lib/types';
import EntryCard from '../components/EntryCard';

const CATEGORIES: (TextCategory | 'all' | 'favorites')[] = [
    'all', 'favorites', 'link', 'username', 'password', 'number', 'phone', 'text', 'note', 'gatau'
];

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const [entries, setEntries] = useState<TextEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<TextCategory | 'all' | 'favorites'>('all');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailNote, setDetailNote] = useState<TextEntry | null>(null);

    const fetchEntries = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('text_entries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEntries(data || []);
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchEntries();

        const unsubscribe = navigation.addListener('focus', () => {
            fetchEntries();
        });

        return unsubscribe;
    }, [fetchEntries, navigation]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchEntries();
    };

    const handleLogout = async () => {
        setShowLogoutModal(false);
        await supabase.auth.signOut();
    };

    const handleDelete = (id: string) => {
        setDeleteNoteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteNoteId) return;
        try {
            await supabase.from('text_entries').delete().eq('id', deleteNoteId);
            fetchEntries();
        } catch (error) {
            Alert.alert('Error', 'Gagal menghapus note');
        }
        setShowDeleteModal(false);
        setDeleteNoteId(null);
    };

    const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
        try {
            await supabase
                .from('text_entries')
                .update({ is_favorite: isFavorite })
                .eq('id', id);
            fetchEntries();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const filteredEntries = entries.filter((entry) => {
        const matchesSearch =
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedCategory === 'all') return matchesSearch;
        if (selectedCategory === 'favorites') return matchesSearch && entry.is_favorite;
        return matchesSearch && entry.category === selectedCategory;
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    const renderCategoryItem = ({ item }: { item: TextCategory | 'all' | 'favorites' }) => {
        const isActive = selectedCategory === item;
        const isSpecial = item === 'all' || item === 'favorites';
        const config = !isSpecial ? CATEGORY_CONFIG[item as TextCategory] : null;

        const label = isSpecial
            ? (item === 'all' ? 'Semua' : 'Favorit')
            : config?.label;

        return (
            <TouchableOpacity
                style={[
                    styles.categoryButton,
                    isActive && styles.categoryButtonActive,
                    isActive && config && { borderColor: config.color, backgroundColor: config.bg }
                ]}
                onPress={() => setSelectedCategory(item)}
            >
                <Text style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                    isActive && config && { color: config.color }
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.headerLogo}
                    />
                    <View>
                        <Text style={styles.headerTitle}>Note Kamu :3</Text>
                        <Text style={styles.headerSubtitle}>Ada {entries.length} Note tersimpan</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => setShowLogoutModal(true)}
                    style={styles.logoutButton}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Cari Note..."
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Entries List with Categories as Header */}
            <FlatList
                data={filteredEntries}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoriesInList}
                        contentContainerStyle={{ paddingRight: 20 }}
                    >
                        {CATEGORIES.map((item) => {
                            const isActive = selectedCategory === item;
                            const isSpecial = item === 'all' || item === 'favorites';
                            const config = !isSpecial ? CATEGORY_CONFIG[item as TextCategory] : null;
                            const label = isSpecial
                                ? (item === 'all' ? 'Semua' : 'Favorit')
                                : config?.label;

                            return (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.categoryButton,
                                        isActive && styles.categoryButtonActive,
                                        isActive && config && { borderColor: config.color, backgroundColor: config.bg }
                                    ]}
                                    onPress={() => setSelectedCategory(item)}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        isActive && styles.categoryTextActive,
                                        isActive && config && { color: config.color }
                                    ]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📂</Text>
                        <Text style={styles.emptyTitle}>
                            {searchQuery ? 'Tidak ditemukan' : 'Belum ada note'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery ? 'Coba kata kunci lain' : 'Mulai simpan catatan Anda'}
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#3b82f6"
                    />
                }
                renderItem={({ item }) => (
                    <EntryCard
                        entry={item}
                        onEdit={() => navigation.navigate('AddEdit', { entry: item })}
                        onDelete={() => handleDelete(item.id)}
                        onToggleFavorite={(isFavorite) => handleToggleFavorite(item.id, isFavorite)}
                        onPress={() => {
                            setDetailNote(item);
                            setShowDetailModal(true);
                        }}
                    />
                )}
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddEdit', {})}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Logout Modal */}
            <Modal
                visible={showLogoutModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}>
                            <Text style={styles.modalIcon}>⎋</Text>
                        </View>
                        <Text style={styles.modalTitle}>Keluar?</Text>
                        <Text style={styles.modalMessage}>
                            Kamu yakin ingin keluar dari akun ini?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setShowLogoutModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalConfirmBtn}
                                onPress={handleLogout}
                            >
                                <Text style={styles.modalConfirmText}>Ya, Keluar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.deleteIconContainer}>
                            <Text style={styles.deleteModalIcon}>✕</Text>
                        </View>
                        <Text style={styles.modalTitle}>Hapus Note?</Text>
                        <Text style={styles.modalMessage}>
                            Data yang dihapus tidak dapat dikembalikan.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalConfirmBtn}
                                onPress={confirmDelete}
                            >
                                <Text style={styles.modalConfirmText}>Ya, Hapus</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Note Detail Modal */}
            <Modal
                visible={showDetailModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDetailModal(false)}
            >
                <TouchableOpacity
                    style={styles.detailModalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDetailModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.detailModalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.detailModalHeader}>
                            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                <Text style={styles.detailCloseBtn}>Tutup</Text>
                            </TouchableOpacity>
                        </View>
                        {detailNote && (
                            <RNScrollView style={styles.detailScrollView} showsVerticalScrollIndicator={false}>
                                <View style={[
                                    styles.detailCategoryBadge,
                                    { backgroundColor: CATEGORY_CONFIG[detailNote.category].bg }
                                ]}>
                                    <Text style={[
                                        styles.detailCategoryText,
                                        { color: CATEGORY_CONFIG[detailNote.category].color }
                                    ]}>
                                        {CATEGORY_CONFIG[detailNote.category].label}
                                    </Text>
                                </View>
                                <Text style={styles.detailTitle}>{detailNote.title}</Text>
                                <Text style={styles.detailContent} selectable>
                                    {detailNote.content}
                                </Text>
                                <Text style={styles.detailTimestamp}>
                                    Dibuat: {new Date(detailNote.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </Text>
                            </RNScrollView>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLogo: {
        width: 44,
        height: 44,
        borderRadius: 12,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    logoutButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#dc2626',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 20,
        marginTop: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
        color: '#94a3b8',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        color: '#1e293b',
        fontSize: 15,
    },
    categoriesInList: {
        marginLeft: -20,
        paddingLeft: 20,
        marginTop: 12,
        marginBottom: 12,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryButtonActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
    },
    categoryText: {
        color: '#64748b',
        fontSize: 13,
        fontWeight: '600',
    },
    categoryTextActive: {
        color: '#3b82f6',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        flexGrow: 1,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 60,
    },
    emptyIcon: {
        fontSize: 56,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    fab: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    fabText: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: '300',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 28,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
    },
    modalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalIcon: {
        fontSize: 28,
        color: '#1e293b',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        marginRight: 8,
    },
    modalCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    modalConfirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        marginLeft: 8,
    },
    modalConfirmText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    deleteIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    deleteModalIcon: {
        fontSize: 28,
        color: '#dc2626',
    },
    // Detail Modal Styles
    detailModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    detailModalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 40,
    },
    detailModalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    detailCloseBtn: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b82f6',
    },
    detailScrollView: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    detailCategoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 12,
    },
    detailCategoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    detailTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    detailContent: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 26,
        marginBottom: 24,
    },
    detailTimestamp: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 20,
    },
});

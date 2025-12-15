import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { TextEntry, TextCategory, CATEGORY_CONFIG, CreateTextEntry } from '../lib/types';

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as TextCategory[];

export default function AddEditScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const editEntry: TextEntry | undefined = route.params?.entry;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<TextCategory>('text');
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editEntry) {
            setTitle(editEntry.title);
            setContent(editEntry.content);
            setCategory(editEntry.category);
            setIsFavorite(editEntry.is_favorite);
        }
    }, [editEntry]);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Error', 'Masukkan title dan content');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (editEntry) {
                const { error } = await supabase
                    .from('text_entries')
                    .update({
                        title: title.trim(),
                        content: content.trim(),
                        category,
                        is_favorite: isFavorite,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editEntry.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('text_entries')
                    .insert({
                        title: title.trim(),
                        content: content.trim(),
                        category,
                        is_favorite: isFavorite,
                        user_id: user?.id,
                    });

                if (error) throw error;
            }

            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {editEntry ? 'Edit Note' : 'Tambah Note'}
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                style={styles.form}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <Text style={styles.label}>Judul</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Masukkan judul..."
                    placeholderTextColor="#94a3b8"
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Category */}
                <Text style={styles.label}>Kategori</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                >
                    {CATEGORIES.map((cat) => {
                        const config = CATEGORY_CONFIG[cat];
                        const isActive = category === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryItem,
                                    isActive && { borderColor: config.color, backgroundColor: config.bg }
                                ]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={styles.categoryEmoji}>{config.icon}</Text>
                                <Text style={[
                                    styles.categoryLabel,
                                    isActive && { color: config.color }
                                ]}>
                                    {config.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Content */}
                <Text style={styles.label}>Konten</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Masukkan konten..."
                    placeholderTextColor="#94a3b8"
                    value={content}
                    onChangeText={setContent}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                />

                {/* Favorite Toggle */}
                <TouchableOpacity
                    style={styles.favoriteToggle}
                    onPress={() => setIsFavorite(!isFavorite)}
                >
                    <Text style={styles.favoriteIcon}>{isFavorite ? '⭐' : '☆'}</Text>
                    <Text style={styles.favoriteText}>Tandai sebagai favorit</Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {editEntry ? 'Update' : 'Simpan'}
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 20,
        color: '#1e293b',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    form: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginTop: 20,
    },
    input: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#1e293b',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    textArea: {
        minHeight: 140,
        paddingTop: 14,
    },
    categoryScroll: {
        marginBottom: 8,
    },
    categoryItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        marginRight: 10,
        minWidth: 80,
    },
    categoryEmoji: {
        fontSize: 20,
        marginBottom: 4,
    },
    categoryLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    favoriteToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    favoriteIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    favoriteText: {
        fontSize: 15,
        color: '#475569',
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

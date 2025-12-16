import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Share,
    Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { TextEntry, CATEGORY_CONFIG } from '../lib/types';

interface EntryCardProps {
    entry: TextEntry;
    onEdit: () => void;
    onDelete: () => void;
    onToggleFavorite: (isFavorite: boolean) => void;
    onPress?: () => void;
}

export default function EntryCard({ entry, onEdit, onDelete, onToggleFavorite, onPress }: EntryCardProps) {
    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const categoryConfig = CATEGORY_CONFIG[entry.category];

    const handleCopy = async () => {
        await Clipboard.setStringAsync(entry.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${entry.title}\n\n${entry.content}`,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleOpenLink = async () => {
        if (entry.category === 'link') {
            let url = entry.content;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            await Linking.openURL(url);
        }
    };

    const displayContent = () => {
        if (entry.category === 'password' && !showPassword) {
            return '••••••••••••';
        }
        return entry.content;
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[styles.card, { borderLeftColor: categoryConfig.color }]}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.bg }]}>
                    <Text style={[styles.categoryLabel, { color: categoryConfig.color }]}>
                        {categoryConfig.label}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => onToggleFavorite(!entry.is_favorite)}
                    style={styles.favoriteBtn}
                >
                    <Text style={[styles.favoriteIcon, entry.is_favorite && styles.favoriteActive]}>
                        {entry.is_favorite ? '★' : '☆'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={1}>{entry.title}</Text>

            {/* Content */}
            <Text style={styles.content} numberOfLines={3}>
                {displayContent()}
            </Text>
            {entry.category === 'password' && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.togglePassword}>
                        {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, copied && styles.actionButtonActive]}
                    onPress={handleCopy}
                >
                    <Text style={[styles.actionText, copied && styles.actionTextActive]}>
                        {copied ? 'Copied!' : 'Copy'}
                    </Text>
                </TouchableOpacity>

                {entry.category === 'link' && (
                    <TouchableOpacity style={styles.actionButton} onPress={handleOpenLink}>
                        <Text style={styles.actionText}>Open</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <TouchableOpacity style={styles.iconButton} onPress={onEdit}>
                    <Text style={styles.editIcon}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                    <Text style={styles.deleteIcon}>Hapus</Text>
                </TouchableOpacity>
            </View>

            {/* Timestamp */}
            <Text style={styles.timestamp}>
                {new Date(entry.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                })}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderLeftWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    favoriteBtn: {
        padding: 2,
    },
    favoriteIcon: {
        fontSize: 18,
        color: '#cbd5e1',
    },
    favoriteActive: {
        color: '#f59e0b',
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    content: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 18,
        marginBottom: 2,
    },
    togglePassword: {
        color: '#3b82f6',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
        marginBottom: 4,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 8,
        marginTop: 8,
    },
    actionButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        marginRight: 6,
        backgroundColor: '#f1f5f9',
    },
    actionButtonActive: {
        backgroundColor: '#dcfce7',
    },
    actionText: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '600',
    },
    actionTextActive: {
        color: '#16a34a',
    },
    iconButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 2,
    },
    editIcon: {
        fontSize: 11,
        color: '#3b82f6',
        fontWeight: '600',
    },
    deleteButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 2,
    },
    deleteIcon: {
        fontSize: 11,
        color: '#ef4444',
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 8,
    },
});

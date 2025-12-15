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
}

export default function EntryCard({ entry, onEdit, onDelete, onToggleFavorite }: EntryCardProps) {
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
        <View style={[styles.card, { borderLeftColor: categoryConfig.color }]}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    categoryLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    favoriteBtn: {
        padding: 4,
    },
    favoriteIcon: {
        fontSize: 22,
        color: '#cbd5e1',
    },
    favoriteActive: {
        color: '#f59e0b',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 6,
    },
    content: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 4,
    },
    togglePassword: {
        color: '#3b82f6',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
        marginTop: 12,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#f1f5f9',
    },
    actionButtonActive: {
        backgroundColor: '#dcfce7',
    },
    actionText: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '600',
    },
    actionTextActive: {
        color: '#16a34a',
    },
    iconButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginLeft: 4,
    },
    editIcon: {
        fontSize: 12,
        color: '#3b82f6',
        fontWeight: '600',
    },
    deleteButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginLeft: 4,
    },
    deleteIcon: {
        fontSize: 12,
        color: '#ef4444',
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 12,
    },
});

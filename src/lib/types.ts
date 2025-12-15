export type TextCategory = 'link' | 'username' | 'password' | 'number' | 'phone' | 'text' | 'note' | 'gatau';

export interface TextEntry {
    id: string;
    user_id: string;
    title: string;
    content: string;
    category: TextCategory;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateTextEntry {
    title: string;
    content: string;
    category: TextCategory;
    is_favorite?: boolean;
}

// Setiap kategori dengan warna unik yang berbeda
export const CATEGORY_CONFIG: Record<TextCategory, { icon: string; label: string; color: string; bg: string }> = {
    link: { icon: '🔗', label: 'Link', color: '#2563EB', bg: '#DBEAFE' },       // Blue
    username: { icon: '👤', label: 'Username', color: '#7C3AED', bg: '#EDE9FE' }, // Violet
    password: { icon: '🔐', label: 'Password', color: '#DC2626', bg: '#FEE2E2' }, // Red
    number: { icon: '🔢', label: 'Number', color: '#059669', bg: '#D1FAE5' },    // Emerald
    phone: { icon: '📱', label: 'Phone', color: '#EA580C', bg: '#FFEDD5' },      // Orange
    text: { icon: '📝', label: 'Text', color: '#4B5563', bg: '#F3F4F6' },        // Gray
    note: { icon: '📋', label: 'Note', color: '#CA8A04', bg: '#FEF9C3' },        // Yellow
    gatau: { icon: '🤷', label: 'Gatau', color: '#EC4899', bg: '#FCE7F3' },      // Pink
};

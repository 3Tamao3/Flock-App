import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { jwtDecode } from 'jwt-decode';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import client from '../api/client';
import { getToken } from '../utils/storage';
import { decrypt } from '../utils/crypto';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/themes';
import type { RootStackParamList } from '../../App';

type User = { id: string; username: string; email: string };
type Chat = {
  id: string;
  user1Id: string;
  user2Id: string;
  user1: User;
  user2: User;
  lastMessage: string | null;
};

export default function ChatListScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [myId, setMyId] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        const decoded = jwtDecode<{ sub: string }>(token);
        setMyId(decoded.sub);
      }
      try {
        const res = await client.get('/chats');
        setChats(res.data);
      } catch {
        Alert.alert('Error', 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) { setSearchResults([]); return; }
    try {
      const res = await client.get('/users/search', { params: { username: text } });
      setSearchResults(res.data);
    } catch {
      Alert.alert('Error', 'Search failed');
    }
  };

  const openChat = async (user: User) => {
    try {
      const res = await client.post('/chats/create-or-get', { userId: user.id });
      setSearchResults([]);
      setSearchQuery('');
      navigation.navigate('Chat', { chatId: res.data.id, otherUsername: user.username });
    } catch {
      Alert.alert('Error', 'Could not open chat');
    }
  };

  const getOther = (chat: Chat): User =>
    chat.user1Id === myId ? chat.user2 : chat.user1;

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.heading}>Messages</Text>

      <TextInput
        style={s.search}
        placeholder="Search users..."
        placeholderTextColor={theme.placeholder}
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {searchResults.length > 0 && (
        <View style={s.results}>
          {searchResults.map((user) => (
            <TouchableOpacity key={user.id} style={s.resultItem} onPress={() => openChat(user)}>
              <Text style={s.resultText}>{user.username}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const other = getOther(item);
          const lastMsg = item.lastMessage
            ? (decrypt(item.lastMessage, item.id) || item.lastMessage)
            : 'No messages yet';
          return (
            <TouchableOpacity
              style={s.chatItem}
              onPress={() => navigation.navigate('Chat', { chatId: item.id, otherUsername: other.username })}
            >
              <View style={s.avatar}>
                <Text style={s.avatarText}>{other.username[0].toUpperCase()}</Text>
              </View>
              <View style={s.chatInfo}>
                <Text style={s.chatName}>{other.username}</Text>
                <Text style={s.chatLast} numberOfLines={1}>{lastMsg}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={s.empty}>No chats yet. Search for a user to start one!</Text>
        }
      />
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    heading: { fontSize: 22, fontWeight: 'bold', color: theme.text, marginBottom: 12, marginTop: 8 },
    search: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 10,
      marginBottom: 8,
      color: theme.text,
      backgroundColor: theme.inputBackground,
    },
    results: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: theme.card,
    },
    resultItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
    resultText: { color: theme.text, fontSize: 15 },
    chatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    chatInfo: { flex: 1 },
    chatName: { fontSize: 16, fontWeight: '600', color: theme.text },
    chatLast: { fontSize: 13, color: theme.subtext, marginTop: 2 },
    empty: { textAlign: 'center', color: theme.subtext, marginTop: 40 },
  });
}

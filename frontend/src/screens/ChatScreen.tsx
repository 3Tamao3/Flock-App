import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import client from '../api/client';
import { getToken } from '../utils/storage';
import { encrypt, decrypt } from '../utils/crypto';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/themes';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
};

const SOCKET_URL = 'http://192.168.0.249:3000';

export default function ChatScreen({ route }: Props) {
  const { chatId } = route.params;
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [myId, setMyId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    let socket: Socket;

    (async () => {
      const token = await getToken();
      if (token) {
        const decoded = jwtDecode<{ sub: string }>(token);
        setMyId(decoded.sub);
      }

      const res = await client.get(`/messages/${chatId}`);
      const decrypted: Message[] = res.data.map((m: Message) => ({
        ...m,
        content: decrypt(m.content, chatId) || m.content,
      }));
      setMessages(decrypted);

      socket = io(SOCKET_URL);
      socketRef.current = socket;
      socket.emit('joinChat', chatId);

      socket.on('newMessage', (msg: Message) => {
        const decContent = decrypt(msg.content, chatId) || msg.content;
        setMessages((prev) => [...prev, { ...msg, content: decContent }]);
        listRef.current?.scrollToEnd({ animated: true });
      });
    })();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [chatId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const encrypted = encrypt(input.trim(), chatId);
    socketRef.current?.emit('sendMessage', { chatId, content: encrypted, senderId: myId });
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={[s.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const mine = item.senderId === myId;
          return (
            <View style={[s.bubble, mine ? s.bubbleMine : s.bubbleTheirs]}>
              <Text style={[s.bubbleText, { color: mine ? '#fff' : theme.text }]}>
                {item.content}
              </Text>
            </View>
          );
        }}
      />
      <View style={[s.inputRow, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput
          style={[s.input, { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border }]}
          placeholder="Message..."
          placeholderTextColor={theme.placeholder}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={[s.sendBtn, { backgroundColor: theme.primary }]} onPress={sendMessage}>
          <Text style={s.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    messageList: { padding: 16, paddingBottom: 8 },
    bubble: { maxWidth: '75%', borderRadius: 16, padding: 10, marginBottom: 8 },
    bubbleMine: { alignSelf: 'flex-end', backgroundColor: theme.bubbleMine },
    bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: theme.bubbleTheirs },
    bubbleText: { fontSize: 15 },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: 10,
      borderTopWidth: 1,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      fontSize: 15,
      maxHeight: 100,
      marginRight: 8,
    },
    sendBtn: { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
    sendText: { color: '#fff', fontWeight: '600' },
  });
}

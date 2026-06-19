import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../api/client';
import { useTheme } from '../theme/ThemeContext';

type RouteRecord = {
  id: string;
  destination: string;
  distance: number;
  duration: number;
  createdAt: string;
};

function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

function formatDuration(s: number): string {
  const h = Math.floor(s / 3600);
  const min = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${min}min`;
  return `${min} min`;
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      client.get('/routes/history')
        .then((res) => { if (active) setRoutes(res.data); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, []),
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>Route History</Text>
      {routes.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: theme.subtext }}>No routes saved yet.</Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.dest, { color: theme.text }]} numberOfLines={1}>
                {item.destination}
              </Text>
              <View style={styles.meta}>
                <Text style={[styles.metaText, { color: theme.subtext }]}>
                  {formatDistance(item.distance)}
                </Text>
                <Text style={[styles.metaDot, { color: theme.subtext }]}> · </Text>
                <Text style={[styles.metaText, { color: theme.subtext }]}>
                  {formatDuration(item.duration)}
                </Text>
              </View>
              <Text style={[styles.date, { color: theme.subtext }]}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  dest: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaText: { fontSize: 13 },
  metaDot: { fontSize: 13 },
  date: { fontSize: 12 },
});

// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocation } from '../hooks/useLocation';
import client from '../api/client';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';
MapboxGL.setAccessToken(MAPBOX_TOKEN);

type Coordinate = [number, number];
type Favorite = { id: string; destination: string };

export default function MapScreen() {
  const { theme } = useTheme();
  const { location } = useLocation();
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const [search, setSearch] = useState('');
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [destName, setDestName] = useState('');
  const [routeCoords, setRouteCoords] = useState<Coordinate[] | null>(null);
  const [trimmedCoords, setTrimmedCoords] = useState<Coordinate[] | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (location?.coords.speed != null && location.coords.speed >= 0) {
      setSpeed(Math.round(location.coords.speed * 3.6));
    }
  }, [location]);

  useEffect(() => {
    if (!routeCoords || !location) return;
    const userCoord: Coordinate = [location.coords.longitude, location.coords.latitude];
    const nearest = findNearestIndex(routeCoords, userCoord);
    setTrimmedCoords(routeCoords.slice(nearest));
  }, [location, routeCoords]);

  const loadFavorites = async () => {
    try {
      const res = await client.get('/favorites');
      setFavorites(res.data);
    } catch {}
  };

  const findNearestIndex = (coords: Coordinate[], point: Coordinate): number => {
    let minDist = Infinity;
    let idx = 0;
    coords.forEach((c, i) => {
      const d = Math.hypot(c[0] - point[0], c[1] - point[1]);
      if (d < minDist) { minDist = d; idx = i; }
    });
    return idx;
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setError('');
    try {
      const geoRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(search)}.json?access_token=${MAPBOX_TOKEN}&limit=1`,
      );
      const geoData = await geoRes.json();
      if (!geoData.features?.length) { setError('Location not found'); return; }

      const [lng, lat] = geoData.features[0].center as Coordinate;
      const name = geoData.features[0].place_name as string;
      setDestination([lng, lat]);
      setDestName(name);
      setIsFavorite(favorites.some((f) => f.destination === name));

      if (!location) { setError('Waiting for your location...'); return; }
      const origin: Coordinate = [location.coords.longitude, location.coords.latitude];

      const dirRes = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${lng},${lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`,
      );
      const dirData = await dirRes.json();
      const coords: Coordinate[] = dirData.routes[0].geometry.coordinates;
      const dist: number = dirData.routes[0].distance;
      const dur: number = dirData.routes[0].duration;
      setRouteCoords(coords);

      cameraRef.current?.fitBounds(
        [Math.min(origin[0], lng), Math.min(origin[1], lat)],
        [Math.max(origin[0], lng), Math.max(origin[1], lat)],
        [80, 80, 80, 80],
        1000,
      );

      await client.post('/routes', {
        destination: name,
        distance: dist,
        duration: dur,
        originLat: origin[1],
        originLng: origin[0],
        destLat: lat,
        destLng: lng,
      });
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (isFavorite) {
      const fav = favorites.find((f) => f.destination === destName);
      if (fav) {
        await client.delete(`/favorites/${fav.id}`);
        setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
        setIsFavorite(false);
      }
    } else {
      const res = await client.post('/favorites', { destination: destName });
      setFavorites((prev) => [res.data, ...prev]);
      setIsFavorite(true);
    }
  };

  const navigateToFavorite = async (fav: Favorite) => {
    setSearch(fav.destination);
    setShowFavorites(false);
    await handleSearch();
  };

  const userCoord: Coordinate | null = location
    ? [location.coords.longitude, location.coords.latitude]
    : null;

  const heading = location?.coords.heading ?? 0;

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street}>
        <MapboxGL.Camera ref={cameraRef} zoomLevel={14} centerCoordinate={userCoord ?? [0, 0]} />

        {userCoord && (
          <MapboxGL.PointAnnotation id="user" coordinate={userCoord}>
            <View style={[styles.arrow, { transform: [{ rotate: `${heading}deg` }] }]}>
              <Ionicons name="arrow-up" size={24} color="#1a73e8" />
            </View>
          </MapboxGL.PointAnnotation>
        )}

        {destination && (
          <MapboxGL.PointAnnotation id="dest" coordinate={destination}>
            <View style={styles.pin}>
              <Ionicons name="location" size={32} color="#EF4444" />
            </View>
          </MapboxGL.PointAnnotation>
        )}

        {trimmedCoords && trimmedCoords.length > 1 && (
          <MapboxGL.ShapeSource
            id="route"
            shape={{ type: 'Feature', geometry: { type: 'LineString', coordinates: trimmedCoords }, properties: {} }}
          >
            <MapboxGL.LineLayer id="routeLine" style={{ lineColor: '#1a73e8', lineWidth: 4 }} />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>

      <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search destination..."
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={() => setShowFavorites((v) => !v)} style={styles.iconBtn}>
          <Ionicons name="bookmark-outline" size={22} color={theme.primary} />
        </TouchableOpacity>
        {destName ? (
          <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
            <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={22} color="#EAB308" />
          </TouchableOpacity>
        ) : null}
        {loading ? (
          <ActivityIndicator style={styles.iconBtn} color={theme.primary} />
        ) : (
          <TouchableOpacity onPress={handleSearch} style={styles.iconBtn}>
            <Ionicons name="search" size={22} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>

      {showFavorites && favorites.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {favorites.map((fav) => (
            <TouchableOpacity
              key={fav.id}
              style={styles.dropdownItem}
              onPress={() => navigateToFavorite(fav)}
            >
              <Ionicons name="navigate-outline" size={16} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.text, flex: 1 }} numberOfLines={1}>{fav.destination}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={[styles.speedBox, { backgroundColor: theme.card }]}>
        <Text style={[styles.speedText, { color: theme.text }]}>{speed}</Text>
        <Text style={[styles.speedUnit, { color: theme.subtext }]}>km/h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchBox: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 4 },
  iconBtn: { padding: 4, marginLeft: 4 },
  dropdown: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 4,
    paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorBox: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
  },
  errorText: { color: '#fff', textAlign: 'center' },
  speedBox: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    minWidth: 64,
    elevation: 3,
  },
  speedText: { fontSize: 22, fontWeight: 'bold' },
  speedUnit: { fontSize: 11 },
  arrow: { alignItems: 'center', justifyContent: 'center' },
  pin: { alignItems: 'center', justifyContent: 'center' },
});

export default MapScreen;

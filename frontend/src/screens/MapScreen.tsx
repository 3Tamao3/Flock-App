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
import useLocation from '../hooks/useLocation';
import { geocode, directions } from '../services/mapbox';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!);

const MapScreen = () => {
  const { location } = useLocation();
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routeShape, setRouteShape] = useState<GeoJSON.Feature | null>(null);
  const [trimmedShape, setTrimmedShape] = useState<GeoJSON.Feature | null>(null);
  const [destCoord, setDestCoord] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!routeShape || !location) { setTrimmedShape(routeShape); return; }
    const coords: [number, number][] = (routeShape.geometry as GeoJSON.LineString).coordinates as [number, number][];
    const { longitude: userLng, latitude: userLat } = location.coords;

    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const d = Math.hypot(coords[i][0] - userLng, coords[i][1] - userLat);
      if (d < minDist) { minDist = d; nearestIdx = i; }
    }

    const ahead = [[userLng, userLat], ...coords.slice(nearestIdx + 1)] as [number, number][];
    setTrimmedShape({ type: 'Feature', geometry: { type: 'LineString', coordinates: ahead }, properties: {} });
  }, [location, routeShape]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (!location) { setError('Waiting for location…'); return; }
    setError('');
    setLoading(true);
    try {
      const geoRes = await geocode(query);
      const feature = geoRes.data.features[0];
      if (!feature) { setError('Address not found'); setLoading(false); return; }

      const [destLng, destLat] = feature.center as [number, number];
      const { longitude: origLng, latitude: origLat } = location.coords;

      const dirRes = await directions(`${origLng},${origLat};${destLng},${destLat}`);
      const leg = dirRes.data.routes[0];
      const geometry: GeoJSON.LineString = leg.geometry;

      setRouteShape({ type: 'Feature', geometry, properties: {} });
      setDestCoord([destLng, destLat]);

      cameraRef.current?.fitBounds(
        [Math.min(origLng, destLng), Math.min(origLat, destLat)],
        [Math.max(origLng, destLng), Math.max(origLat, destLat)],
        60,
        500,
      );
    } catch {
      setError('Could not load route');
    } finally {
      setLoading(false);
    }
  };

  const speedKmh =
    location?.coords.speed != null && location.coords.speed >= 0
      ? Math.round(location.coords.speed * 3.6)
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Search address…"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.searchBtnText}>Go</Text>
          }
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street}>
        <MapboxGL.Camera ref={cameraRef} followUserLocation={!destCoord} zoomLevel={13} />

        {location && (
          <MapboxGL.PointAnnotation
            id="userPosition"
            coordinate={[location.coords.longitude, location.coords.latitude]}
          >
            <View style={[styles.arrowWrapper, { transform: [{ rotate: `${location.coords.heading ?? 0}deg` }] }]}>
              <View style={styles.arrowTip} />
              <View style={styles.arrowBase} />
            </View>
          </MapboxGL.PointAnnotation>
        )}

        {trimmedShape && (
          <MapboxGL.ShapeSource id="route" shape={trimmedShape}>
            <MapboxGL.LineLayer
              id="routeLine"
              style={{ lineColor: '#1a73e8', lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
            />
          </MapboxGL.ShapeSource>
        )}

        {destCoord && (
          <MapboxGL.PointAnnotation id="destination" coordinate={destCoord}>
            <View style={styles.pin} />
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>

      <View style={styles.speedBox}>
        <Text style={styles.speedValue}>{speedKmh ?? '--'}</Text>
        <Text style={styles.speedUnit}>km/h</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111',
  },
  searchBtn: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  error: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: '#fdd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    color: '#c00',
  },
  map: { flex: 1 },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e53935',
    borderWidth: 2,
    borderColor: '#fff',
  },
  speedBox: {
    position: 'absolute',
    bottom: 28,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 64,
  },
  speedValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  speedUnit: {
    color: '#ccc',
    fontSize: 11,
    fontWeight: '500',
  },
  arrowWrapper: {
    alignItems: 'center',
  },
  arrowTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 22,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1a73e8',
  },
  arrowBase: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1a73e8',
    marginTop: -3,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default MapScreen;

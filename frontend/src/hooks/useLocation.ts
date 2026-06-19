import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

type LocationType = Location.LocationObject | null;

export function useLocation() {
  const [location, setLocation] = useState<LocationType>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => setLocation(loc),
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  return { location, setLocation };
}

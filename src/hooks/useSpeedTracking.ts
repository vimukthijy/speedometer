import { useCallback, useEffect, useRef, useState } from 'react';

import { PermissionsAndroid, Platform } from 'react-native';

import Geolocation from 'react-native-geolocation-service';

interface LocationSample {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const toRadians = (value: number) => (value * Math.PI) / 180;

const calculateDistance = (
  first: LocationSample,
  second: LocationSample,
): number => {
  const earthRadius = 6371000;

  const latitudeDifference = toRadians(second.latitude - first.latitude);

  const longitudeDifference = toRadians(second.longitude - first.longitude);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(first.latitude)) *
      Math.cos(toRadians(second.latitude)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const useSpeedTracking = () => {
  const [isTracking, setIsTracking] = useState(false);

  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);

  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const watchId = useRef<number | null>(null);
  const lastLocation = useRef<LocationSample | null>(null);

  const distanceRef = useRef(0);
  const startTime = useRef<number | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return false;
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message:
          'GPS Speed Tracker needs location access to calculate your current speed.',
        buttonPositive: 'Allow',
        buttonNegative: 'Cancel',
      },
    );

    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setIsTracking(false);
    setCurrentSpeed(0);
  }, []);

  const startTracking = async () => {
    try {
      setError(null);

      const hasPermission = await requestPermission();

      if (!hasPermission) {
        setError('Location permission was denied.');
        return;
      }

      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }

      lastLocation.current = null;
      distanceRef.current = 0;
      startTime.current = Date.now();

      setCurrentSpeed(0);
      setMaxSpeed(0);
      setAverageSpeed(0);
      setAccuracy(null);
      setElapsedSeconds(0);

      setIsTracking(true);

      watchId.current = Geolocation.watchPosition(
        position => {
          const {
            latitude,
            longitude,
            speed,
            accuracy: gpsAccuracy,
          } = position.coords;

          const timestamp = position.timestamp;

          setAccuracy(gpsAccuracy ?? null);

          // Ignore readings with poor GPS accuracy.
          if (gpsAccuracy == null || gpsAccuracy > 35) {
            return;
          }

          const currentLocation: LocationSample = {
            latitude,
            longitude,
            timestamp,
          };

          let calculatedSpeed = 0;

          if (lastLocation.current) {
            const distance = calculateDistance(
              lastLocation.current,
              currentLocation,
            );

            const timeDifference =
              (timestamp - lastLocation.current.timestamp) / 1000;

            if (timeDifference > 0 && timeDifference < 10) {
              const distanceSpeed = distance / timeDifference;

              // Reject implausible GPS jumps.
              if (distanceSpeed <= 70) {
                if (distance >= 2) {
                  distanceRef.current += distance;
                }

                calculatedSpeed =
                  speed != null && speed >= 0 ? speed : distanceSpeed;
              }
            }
          }

          lastLocation.current = currentLocation;

          // Ignore tiny GPS speed fluctuations.
          if (calculatedSpeed < 0.5) {
            calculatedSpeed = 0;
          }

          setCurrentSpeed(calculatedSpeed);

          setMaxSpeed(previous => Math.max(previous, calculatedSpeed));
        },
        gpsError => {
          setError(gpsError.message);
          stopTracking();
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,
          interval: 1000,
          fastestInterval: 1000,
          timeout: 15000,
          maximumAge: 1000,
          showLocationDialog: true,
          forceRequestLocation: true,
        },
      );
    } catch (exception) {
      setError('Unable to start GPS tracking.');
      stopTracking();
    }
  };

  useEffect(() => {
    if (!isTracking) {
      return;
    }

    const timer = setInterval(() => {
      if (startTime.current === null) {
        return;
      }

      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);

      setElapsedSeconds(elapsed);

      if (elapsed > 0) {
        setAverageSpeed(distanceRef.current / elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTracking]);

  const resetTracking = () => {
    if (isTracking) {
      return;
    }

    lastLocation.current = null;
    distanceRef.current = 0;
    startTime.current = null;

    setCurrentSpeed(0);
    setMaxSpeed(0);
    setAverageSpeed(0);
    setAccuracy(null);
    setElapsedSeconds(0);
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return {
    isTracking,
    currentSpeed,
    maxSpeed,
    averageSpeed,
    accuracy,
    elapsedSeconds,
    error,
    startTracking,
    stopTracking,
    resetTracking,
  };
};

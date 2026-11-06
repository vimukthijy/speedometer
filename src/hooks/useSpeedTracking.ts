import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

interface LocationSample {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
}

const MAX_GPS_ACCURACY = 25;

// Use a rolling GPS window to reduce stationary GPS drift.
const GPS_WINDOW_MS = 5000;
const MIN_WINDOW_MS = 3000;

// Movement detection threshold, in metres.
const MIN_MOVEMENT_DISTANCE = 6;
const MAX_MOVEMENT_DISTANCE_THRESHOLD = 15;

// Speed filtering.
const SPEED_SMOOTHING = 0.4;
const MIN_DETECTABLE_SPEED = 0.8; // m/s

const GPS_TIMEOUT_MS = 3000;
const MAX_INTEGRATION_GAP_MS = 3000;

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const earthRadius = 6371000;

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const useSpeedTracking = () => {
  const [isTracking, setIsTracking] = useState(false);

  // All speed values are stored in metres per second.
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);

  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const watchId = useRef<number | null>(null);
  const startingRef = useRef(false);

  // GPS sample history.
  const samplesRef = useRef<LocationSample[]>([]);

  // Tracking and speed calculation.
  const smoothedSpeedRef = useRef(0);
  const movingConfirmationsRef = useRef(0);
  const isMovingRef = useRef(false);

  // Average speed and distance.
  const distanceRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  const lastGpsUpdateRef = useRef<number | null>(null);
  const lastProcessedTimestampRef = useRef<number | null>(null);
  const lastIntegratedSpeedRef = useRef(0);

  const resetFilters = useCallback(() => {
    samplesRef.current = [];

    smoothedSpeedRef.current = 0;
    movingConfirmationsRef.current = 0;
    isMovingRef.current = false;

    lastGpsUpdateRef.current = null;
    lastProcessedTimestampRef.current = null;
    lastIntegratedSpeedRef.current = 0;
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
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

    const startedAt = startTimeRef.current;

    if (startedAt !== null) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);

      setElapsedSeconds(elapsed);
      setAverageSpeed(elapsed > 0 ? distanceRef.current / elapsed : 0);
    }

    startTimeRef.current = null;

    resetFilters();

    setCurrentSpeed(0);
    setIsTracking(false);
  }, [resetFilters]);

  const startTracking = useCallback(async () => {
    if (startingRef.current || watchId.current !== null) {
      return;
    }

    startingRef.current = true;

    try {
      setError(null);

      const hasPermission = await requestPermission();

      if (!hasPermission) {
        setError('Location permission was denied.');
        return;
      }

      // Reset previous session.
      resetFilters();

      distanceRef.current = 0;
      startTimeRef.current = Date.now();
      lastGpsUpdateRef.current = Date.now();

      setCurrentSpeed(0);
      setMaxSpeed(0);
      setAverageSpeed(0);
      setAccuracy(null);
      setElapsedSeconds(0);

      setIsTracking(true);

      watchId.current = Geolocation.watchPosition(
        position => {
          if (startTimeRef.current === null) {
            return;
          }

          lastGpsUpdateRef.current = Date.now();

          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const gpsAccuracy = position.coords.accuracy;

          setAccuracy(Number.isFinite(gpsAccuracy) ? gpsAccuracy : null);

          const timestamp =
            Number.isFinite(position.timestamp) && position.timestamp > 0
              ? position.timestamp
              : Date.now();

          // Ignore invalid GPS coordinates or inaccurate readings.
          const validPosition =
            Number.isFinite(latitude) &&
            Number.isFinite(longitude) &&
            Number.isFinite(gpsAccuracy) &&
            gpsAccuracy > 0 &&
            gpsAccuracy <= MAX_GPS_ACCURACY;

          if (!validPosition) {
            samplesRef.current = [];
            smoothedSpeedRef.current = 0;
            movingConfirmationsRef.current = 0;
            isMovingRef.current = false;
            lastProcessedTimestampRef.current = timestamp;
            lastIntegratedSpeedRef.current = 0;

            setCurrentSpeed(0);
            return;
          }

          // Ignore duplicate or older location samples.
          if (
            lastProcessedTimestampRef.current !== null &&
            timestamp <= lastProcessedTimestampRef.current
          ) {
            return;
          }

          const sample: LocationSample = {
            latitude,
            longitude,
            timestamp,
            accuracy: gpsAccuracy,
          };

          samplesRef.current.push(sample);

          // Keep only the latest 5 seconds of GPS readings.
          samplesRef.current = samplesRef.current.filter(
            item => timestamp - item.timestamp <= GPS_WINDOW_MS,
          );

          const samples = samplesRef.current;
          const firstSample = samples[0];

          if (!firstSample) {
            setCurrentSpeed(0);
            lastProcessedTimestampRef.current = timestamp;
            return;
          }

          const timeDifference = timestamp - firstSample.timestamp;

          // Wait for enough GPS readings before estimating speed.
          if (samples.length < 3 || timeDifference < MIN_WINDOW_MS) {
            setCurrentSpeed(0);
            lastProcessedTimestampRef.current = timestamp;
            lastIntegratedSpeedRef.current = 0;
            return;
          }

          // Calculate actual movement between GPS positions.
          const distance = calculateDistance(
            firstSample.latitude,
            firstSample.longitude,
            latitude,
            longitude,
          );

          const timeInSeconds = timeDifference / 1000;

          // Require meaningful movement beyond normal GPS drift.
          const averageAccuracy = (firstSample.accuracy + gpsAccuracy) / 2;

          const movementThreshold = Math.max(
            MIN_MOVEMENT_DISTANCE,
            Math.min(MAX_MOVEMENT_DISTANCE_THRESHOLD, averageAccuracy * 0.8),
          );

          // Stationary detection.
          if (distance <= movementThreshold) {
            isMovingRef.current = false;
            movingConfirmationsRef.current = 0;
            smoothedSpeedRef.current = 0;

            setCurrentSpeed(0);

            lastProcessedTimestampRef.current = timestamp;
            lastIntegratedSpeedRef.current = 0;

            return;
          }

          // Calculate speed from GPS position displacement.
          const calculatedSpeed = distance / timeInSeconds;

          if (calculatedSpeed < MIN_DETECTABLE_SPEED) {
            isMovingRef.current = false;
            movingConfirmationsRef.current = 0;
            smoothedSpeedRef.current = 0;

            setCurrentSpeed(0);

            lastProcessedTimestampRef.current = timestamp;
            lastIntegratedSpeedRef.current = 0;

            return;
          }

          // Require two consecutive movement estimates.
          movingConfirmationsRef.current += 1;

          if (movingConfirmationsRef.current < 2) {
            lastProcessedTimestampRef.current = timestamp;
            lastIntegratedSpeedRef.current = 0;

            setCurrentSpeed(0);
            return;
          }

          isMovingRef.current = true;

          // Smooth the calculated speed.
          const filteredSpeed =
            smoothedSpeedRef.current === 0
              ? calculatedSpeed
              : smoothedSpeedRef.current * (1 - SPEED_SMOOTHING) +
                calculatedSpeed * SPEED_SMOOTHING;

          smoothedSpeedRef.current = filteredSpeed;

          // Estimate travelled distance for session statistics.
          const previousTimestamp = lastProcessedTimestampRef.current;

          if (previousTimestamp !== null) {
            const deltaMilliseconds = timestamp - previousTimestamp;

            if (
              deltaMilliseconds > 0 &&
              deltaMilliseconds <= MAX_INTEGRATION_GAP_MS
            ) {
              const deltaSeconds = deltaMilliseconds / 1000;

              const segmentSpeed =
                (lastIntegratedSpeedRef.current + filteredSpeed) / 2;

              distanceRef.current += segmentSpeed * deltaSeconds;
            }
          }

          lastProcessedTimestampRef.current = timestamp;
          lastIntegratedSpeedRef.current = filteredSpeed;

          setCurrentSpeed(filteredSpeed);

          setMaxSpeed(previous => Math.max(previous, filteredSpeed));
        },
        gpsError => {
          setError(gpsError.message || 'GPS location error.');
          stopTracking();
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,
          interval: 1000,
          fastestInterval: 1000,
          timeout: 20000,
          maximumAge: 0,
          showLocationDialog: true,
          forceRequestLocation: true,
        },
      );
    } catch (exception) {
      const message =
        exception instanceof Error ? exception.message : String(exception);

      setError(`Unable to start GPS tracking. ${message}`);
      stopTracking();
    } finally {
      startingRef.current = false;
    }
  }, [resetFilters, stopTracking]);

  // Keep elapsed time and average speed updated.
  useEffect(() => {
    if (!isTracking) {
      return;
    }

    const timer = setInterval(() => {
      const startedAt = startTimeRef.current;

      if (startedAt === null) {
        return;
      }

      const elapsed = Math.floor((Date.now() - startedAt) / 1000);

      setElapsedSeconds(elapsed);

      if (elapsed > 0) {
        setAverageSpeed(distanceRef.current / elapsed);
      }

      // Reset displayed speed if GPS updates stop arriving.
      const lastUpdate = lastGpsUpdateRef.current;

      if (lastUpdate !== null && Date.now() - lastUpdate > GPS_TIMEOUT_MS) {
        samplesRef.current = [];
        smoothedSpeedRef.current = 0;
        movingConfirmationsRef.current = 0;
        isMovingRef.current = false;

        lastProcessedTimestampRef.current = null;
        lastIntegratedSpeedRef.current = 0;

        setCurrentSpeed(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTracking]);

  const resetTracking = useCallback(() => {
    if (watchId.current !== null || startingRef.current) {
      return;
    }

    resetFilters();

    distanceRef.current = 0;
    startTimeRef.current = null;

    setCurrentSpeed(0);
    setMaxSpeed(0);
    setAverageSpeed(0);
    setAccuracy(null);
    setElapsedSeconds(0);
    setError(null);
    setIsTracking(false);
  }, [resetFilters]);

  // Remove GPS watcher when the component unmounts.
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
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

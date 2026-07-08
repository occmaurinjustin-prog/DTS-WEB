import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// Icon components
const SearchIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const MapPinIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const PackageIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
    </svg>
);

const XMarkIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PhoneIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const TruckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
);

const NavigationIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);

const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UsersIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const ActivityIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const AlertCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const PlayCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Set Mapbox access token from environment variable
if (mapboxgl) {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
}

export default function Routes({ authUser, pendingDeliveries, drivers }) {
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);
    const [followDriver, setFollowDriver] = useState(false);
    const [viewAllDrivers, setViewAllDrivers] = useState(true);
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef({});
    const routeLines = useRef({});
    const selectedDriverRef = useRef(null);
    const latestRouteRequest = useRef({});
    const lastRoutePosition = useRef({});
    const animationFrames = useRef({});
    const followDriverRef = useRef(false);

    // Keep ref in sync with state for websocket access
    useEffect(() => {
        selectedDriverRef.current = selectedDriver;
    }, [selectedDriver]);

    useEffect(() => {
        followDriverRef.current = followDriver;
    }, [followDriver]);

    // Math for Bearing
    function calculateBearing(startLat, startLng, destLat, destLng) {
        const toRad = (deg) => deg * Math.PI / 180;
        const toDeg = (rad) => rad * 180 / Math.PI;
        
        const startLatRad = toRad(startLat);
        const startLngRad = toRad(startLng);
        const destLatRad = toRad(destLat);
        const destLngRad = toRad(destLng);

        const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
        const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
                  Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
        
        let bearing = toDeg(Math.atan2(y, x));
        return (bearing + 360) % 360;
    }

    // Smooth Marker Animation
    function animateMarker(driverId, startLngLat, endLngLat) {
        if (!markers.current[driverId]?.driver) return;
        
        const marker = markers.current[driverId].driver;
        
        // Calculate bearing
        const bearing = calculateBearing(startLngLat[1], startLngLat[0], endLngLat[1], endLngLat[0]);
        
        const movedDistance = Math.abs(startLngLat[1] - endLngLat[1]) + Math.abs(startLngLat[0] - endLngLat[0]);
        if (movedDistance > 0.00001) {
            if (typeof marker.setRotation === 'function') {
                // Navigation pointer faces North (0deg). No offset needed.
                marker.setRotation(bearing);
            }
        }

        const duration = 1000; // 1 second transition
        const startTime = performance.now();

        if (animationFrames.current[driverId]) {
            cancelAnimationFrame(animationFrames.current[driverId]);
        }

        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = progress * (2 - progress); // Ease out quad

            const currentLng = startLngLat[0] + (endLngLat[0] - startLngLat[0]) * easeProgress;
            const currentLat = startLngLat[1] + (endLngLat[1] - startLngLat[1]) * easeProgress;

            marker.setLngLat([currentLng, currentLat]);

            if (progress < 1) {
                animationFrames.current[driverId] = requestAnimationFrame(animate);
            }
        };

        animationFrames.current[driverId] = requestAnimationFrame(animate);
    }

    // Smart Camera Panning
    function smartPanTo(lng, lat) {
        if (!map.current || !followDriverRef.current) return;

        const bounds = map.current.getBounds();
        const mapSw = bounds.getSouthWest();
        const mapNe = bounds.getNorthEast();

        const lngSpan = mapNe.lng - mapSw.lng;
        const latSpan = mapNe.lat - mapSw.lat;

        const margin = 0.2; // 20% safe zone
        
        const isNearEdge = 
            lng < mapSw.lng + (lngSpan * margin) ||
            lng > mapNe.lng - (lngSpan * margin) ||
            lat < mapSw.lat + (latSpan * margin) ||
            lat > mapNe.lat - (latSpan * margin);

        if (isNearEdge) {
            map.current.panTo([lng, lat], {
                duration: 1500,
                essential: true
            });
        }
    }

    // Transform real driver data to match component expectations
    const transformedDrivers = drivers.map(driver => {
        // DEBUG: Log original driver data
        console.log('Original driver data for transformation:', driver);
        console.log('Delivery data:', driver.delivery);
        
        const transformed = {
            id: driver.id,
            name: driver.driver,
            plateNumber: driver.plate,
            status: driver.status,
            speed: driver.speed,
            lastUpdated: driver.lastUpdate,
            pickup: { 
                lat: Number(driver.delivery?.pickup_latitude || driver.delivery?.pickup_lat) || 14.5995, 
                lng: Number(driver.delivery?.pickup_longitude || driver.delivery?.pickup_lng) || 120.9842, 
                address: driver.delivery?.pickup_address || 'Pickup Location' 
            },
            destination: { 
                lat: Number(driver.delivery?.delivery_latitude || driver.delivery?.dest_lat) || 14.6091, 
                lng: Number(driver.delivery?.delivery_longitude || driver.delivery?.dest_lng) || 120.9932, 
                address: driver.delivery?.delivery_address || driver.delivery?.dest_address || 'Destination' 
            },
            currentLocation: { 
                lat: Number(driver.lat) || 14.5995, 
                lng: Number(driver.lng) || 120.9842 
            },
            delivery: {
                delivery_status: driver.delivery?.delivery_status || 'assigned'
            },
            eta: driver.delivery?.delivery_status === 'in_transit' ? 'In Transit' : 
                  driver.delivery?.delivery_status === 'assigned' ? 'Assigned' : 'Unknown',
            distance: driver.delivery ? `${Math.random() * 20 + 5} km` : '0 km',
            trackingId: driver.delivery?.tracking || 'DEL-2024-000',
            cargoWeight: driver.delivery?.weight ? `${driver.delivery.weight} tons` : '0 tons',
            isGpsEnabled: driver.isGpsEnabled ?? true,
        };
        
        // DEBUG: Log transformed data
        console.log('Transformed driver data:', transformed);
        
        return transformed;
    });

    const [driverList, setDriverList] = useState(transformedDrivers);

    // Update driver list when drivers prop changes (real-time updates)
    useEffect(() => {
        const updatedDrivers = drivers.map(driver => {
            const transformed = {
                id: driver.id,
                name: driver.driver,
                plateNumber: driver.plate,
                status: driver.status,
                speed: driver.speed,
                lastUpdated: driver.lastUpdate,
                pickup: { 
                    lat: Number(driver.delivery?.pickup_latitude || driver.delivery?.pickup_lat) || 14.5995, 
                    lng: Number(driver.delivery?.pickup_longitude || driver.delivery?.pickup_lng) || 120.9842, 
                    address: driver.delivery?.pickup_address || 'Pickup Location' 
                },
                destination: { 
                    lat: Number(driver.delivery?.delivery_latitude || driver.delivery?.dest_lat) || 14.6091, 
                    lng: Number(driver.delivery?.delivery_longitude || driver.delivery?.dest_lng) || 120.9932, 
                    address: driver.delivery?.delivery_address || driver.delivery?.dest_address || 'Destination' 
                },
                currentLocation: { 
                    lat: Number(driver.lat) || 14.5995, 
                    lng: Number(driver.lng) || 120.9842 
                },
                delivery: {
                    delivery_status: driver.delivery?.delivery_status || 'assigned'
                },
                eta: driver.delivery?.delivery_status === 'in_transit' ? 'In Transit' : 
                      driver.delivery?.delivery_status === 'assigned' ? 'Assigned' : 'Unknown',
                distance: driver.delivery ? `${Math.random() * 20 + 5} km` : '0 km',
                trackingId: driver.delivery?.tracking || 'DEL-2024-000',
                cargoWeight: driver.delivery?.weight ? `${driver.delivery.weight} tons` : '0 tons',
                isGpsEnabled: driver.isGpsEnabled ?? true,
            };
            return transformed;
        });
        setDriverList(updatedDrivers);
    }, [drivers]);

    // Real-time driver location updates via WebSockets
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel('drivers')
            .listen('DriverLocationUpdated', (e) => {
                console.log('Driver location updated via WebSocket', e);
                setDriverList(prevList => {
                    const newList = [...prevList];
                    const index = newList.findIndex(d => d.id === e.id);
                    if (index !== -1) {
                        const updatedDriver = {
                            ...newList[index],
                            currentLocation: { lat: e.lat, lng: e.lng },
                            speed: e.speed,
                            status: e.status,
                            isGpsEnabled: e.isGpsEnabled,
                            lastUpdated: 'Just now'
                        };

                        // If the backend provided the updated delivery status, apply it so the route updates in real-time
                        if (e.deliveryStatus && updatedDriver.delivery) {
                            updatedDriver.delivery = {
                                ...updatedDriver.delivery,
                                delivery_status: e.deliveryStatus
                            };
                            updatedDriver.eta = e.deliveryStatus === 'in_transit' ? 'In Transit' :
                                               e.deliveryStatus === 'assigned' ? 'Assigned' : 'Unknown';
                        }

                        // Update the map marker immediately!
                        if (markers.current && markers.current[e.id]?.driver) {
                            const startLngLat = markers.current[e.id].driver.getLngLat().toArray();
                            const endLngLat = [e.lng, e.lat];
                            animateMarker(e.id, startLngLat, endLngLat);
                            
                            // Redraw the route line if this is the currently viewed driver so it vanishes behind them
                            if (selectedDriverRef.current?.id === e.id) {
                                smartPanTo(e.lng, e.lat);

                                const last = lastRoutePosition.current[e.id];

                                if (!last) {
                                    lastRoutePosition.current[e.id] = {
                                        lat: e.lat,
                                        lng: e.lng
                                    };
                                    drawRoute(updatedDriver);
                                } else {
                                    const moved = Math.abs(last.lat - e.lat) + Math.abs(last.lng - e.lng);
                                    if (moved > 0.0003) {
                                        lastRoutePosition.current[e.id] = {
                                            lat: e.lat,
                                            lng: e.lng
                                        };
                                        drawRoute(updatedDriver);
                                    }
                                }
                            }
                        }

                        newList[index] = updatedDriver;
                    }
                    return newList;
                });
            });

        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('drivers');
            }
        };
    }, []); // Empty deps - attach listener once

    // Watch for delivery status changes in real-time
    useEffect(() => {
        if (selectedDriver && driverList) {
            const currentDriver = driverList.find(d => d.id === selectedDriver.id);
            if (currentDriver && currentDriver.delivery?.delivery_status !== selectedDriver.delivery?.delivery_status) {
                console.log('Delivery status changed in real-time! Redrawing map markers...', currentDriver.delivery?.delivery_status);
                setSelectedDriver(currentDriver);
                showDriverOnMap(currentDriver);
            }
        }
    }, [driverList, selectedDriver]);

    // Initialize Mapbox map (same approach as working LocationPickerModal)
    useEffect(() => {
        if (!mapContainer.current || map.current || !mapboxgl) return;

        try {
            console.log('Initializing Mapbox map...');
            
            // Create Mapbox map
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/outdoors-v11',
                center: [120.9842, 14.5995], // Manila coordinates
                zoom: 11
            });

            // Add controls
            map.current.addControl(new mapboxgl.NavigationControl());

            map.current.on('load', () => {
                console.log('Mapbox map loaded successfully');

                map.current.resize();

                setMapLoaded(true);
            });

            map.current.on('error', (e) => {
                console.error('Mapbox error:', e);
            });

        } catch (error) {
            console.error('Failed to initialize Mapbox:', error);
            setMapLoaded(false);
        }

        return () => {
            if (map.current) {
                console.log('Cleaning up Mapbox map...');
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Show all drivers on map (initial plot and bounds fit)
    const showAllDriversOnMap = () => {
        if (!map.current || !mapboxgl) return;

        // CLEAR EVERYTHING FIRST
        clearMap();

        transformedDrivers.forEach(driver => {
            // DRIVER MARKER
            const driverMarker = new mapboxgl.Marker({
                element: createDriverMarker(driver),
                anchor: 'center'
            })
                .setLngLat([
                    driver.currentLocation.lng,
                    driver.currentLocation.lat
                ])
                .addTo(map.current);

            // Store marker reference for real-time updates
            markers.current[driver.id] = {
                driver: driverMarker,
                pickup: null,
                destination: null
            };
        });
        
        // Fit bounds to show all drivers
        if (transformedDrivers.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            transformedDrivers.forEach(driver => {
                bounds.extend([driver.currentLocation.lng, driver.currentLocation.lat]);
            });
            map.current.fitBounds(bounds, { padding: 50, duration: 1000 });
        }
    };

    // Update all drivers markers position in real-time
    const updateAllDriversPositions = () => {
        if (!map.current) return;

        driverList.forEach(driver => {
            if (markers.current[driver.id]?.driver) {
                // Update existing marker
                markers.current[driver.id].driver.setLngLat([
                    driver.currentLocation.lng,
                    driver.currentLocation.lat
                ]);
            } else {
                // Create new marker if it doesn't exist
                const driverMarker = new mapboxgl.Marker({
                    element: createDriverMarker(driver),
                    anchor: 'center'
                })
                    .setLngLat([
                        driver.currentLocation.lng,
                        driver.currentLocation.lat
                    ])
                    .addTo(map.current);

                markers.current[driver.id] = {
                    driver: driverMarker,
                    pickup: null,
                    destination: null
                };
            }
        });
    };

    useEffect(() => {
        if (mapLoaded && viewAllDrivers) {
            showAllDriversOnMap();
        }
    }, [mapLoaded]);

    // Update map when driver data changes (real-time updates)
    useEffect(() => {
        if (selectedDriver && map.current) {
            const updatedDriver = driverList.find(d => d.id === selectedDriver.id);
            if (updatedDriver) {
                setSelectedDriver(updatedDriver);
                updateDriverPosition(updatedDriver);
            }
        } else if (viewAllDrivers && map.current) {
            updateAllDriversPositions();
        }
    }, [drivers]);

    // Clear all markers and routes from map
    const clearMap = () => {
        // REMOVE MARKERS
        Object.values(markers.current).forEach(markerGroup => {
            Object.values(markerGroup).forEach(marker => {
                if (marker) {
                    marker.remove();
                }
            });
        });

        markers.current = {};

        // REMOVE ROUTES
        Object.keys(routeLines.current).forEach(routeId => {
            if (map.current.getLayer(routeId)) {
                map.current.removeLayer(routeId);
            }

            if (map.current.getSource(routeId)) {
                map.current.removeSource(routeId);
            }
        });

        routeLines.current = {};
    };

    // Show single driver on map
    const showDriverOnMap = async (driver) => {
        if (!map.current || !mapboxgl) return;

        // CLEAR EVERYTHING FIRST
        clearMap();

        // DRIVER MARKER
        const driverMarker = new mapboxgl.Marker({
            element: createDriverMarker(driver),
            anchor: 'center'
        })
            .setLngLat([
                driver.currentLocation.lng,
                driver.currentLocation.lat
            ])
            .addTo(map.current);

        // Store marker reference for real-time updates
        markers.current[driver.id] = {
            driver: driverMarker,
            pickup: null,
            destination: null
        };

        // PICKUP MARKER (always show initially, hide only after pickup is confirmed)
        let pickupMarker = null;
        console.log('Checking pickup marker - delivery status:', driver.delivery?.delivery_status);
        
        // Show pickup marker unless driver has already picked up the cargo
        if (driver.delivery?.delivery_status !== 'in_transit' && driver.delivery?.delivery_status !== 'delivered') {
            console.log('Creating pickup marker at:', driver.pickup.lat, driver.pickup.lng);
            pickupMarker = new mapboxgl.Marker({
                element: createPickupMarker(),
                anchor: 'center'
            })
            .setLngLat([
                driver.pickup.lng,
                driver.pickup.lat
            ])
            .addTo(map.current);
        } else {
            console.log('NOT showing pickup marker - already picked up');
        }

        // DESTINATION MARKER (only show after pickup is confirmed)
        let destinationMarker = null;
        console.log('Checking destination marker - delivery status:', driver.delivery?.delivery_status);
        
        // ONLY show destination marker if driver has confirmed pickup
        if (driver.delivery?.delivery_status === 'in_transit' || driver.delivery?.delivery_status === 'delivered') {
            console.log('Creating destination marker at:', driver.destination.lat, driver.destination.lng);
            destinationMarker = new mapboxgl.Marker({
                element: createDestinationMarker(),
                anchor: 'center'
            })
            .setLngLat([
                driver.destination.lng,
                driver.destination.lat
            ])
            .addTo(map.current);
        } else {
            console.log('NOT showing destination marker - pickup not confirmed yet');
        }

        // DEBUG: Log coordinates to verify
        console.log('=== MARKER DEBUG INFO ===');
        console.log('Driver ID:', driver.id);
        console.log('Delivery Status:', driver.delivery?.delivery_status);
        console.log('Delivery Status Type:', typeof driver.delivery?.delivery_status);
        console.log('Original driver data:', driver);
        console.log('Pickup coords:', driver.pickup.lat, driver.pickup.lng);
        console.log('Destination coords:', driver.destination.lat, driver.destination.lng);
        console.log('Driver current location:', driver.currentLocation.lat, driver.currentLocation.lng);
        
        // Check all possible status values
        console.log('Status checks:');
        console.log('- Is in_transit?', driver.delivery?.delivery_status === 'in_transit');
        console.log('- Is delivered?', driver.delivery?.delivery_status === 'delivered');
        console.log('- Is assigned?', driver.delivery?.delivery_status === 'assigned');
        console.log('- Is pending?', driver.delivery?.delivery_status === 'pending');
        console.log('- Status value (raw):', JSON.stringify(driver.delivery?.delivery_status));
        
        console.log('Should show pickup marker:', driver.delivery?.delivery_status !== 'in_transit' && driver.delivery?.delivery_status !== 'delivered');
        console.log('Should show destination marker:', driver.delivery?.delivery_status === 'in_transit' || driver.delivery?.delivery_status === 'delivered');
        
        // ADDITIONAL DEBUG: Check if status is already in_transit from database
        console.log('=== ISSUE DEBUG ===');
        console.log('PROBLEM: Destination marker showing immediately!');
        console.log('This means delivery status is already "in_transit" in database');
        console.log('Expected: Should show pickup marker first, then destination after confirm pickup');
        console.log('Actual: Showing destination marker immediately');
        console.log('=== END ISSUE DEBUG ===');

        markers.current[driver.id] = {
            driver: driverMarker,
            pickup: pickupMarker,
            destination: destinationMarker
        };

        // DRAW ROUTE
        await drawRoute(driver);

        // DRAW HISTORICAL BREADCRUMB PATH
        await fetchAndDrawPath(driver.id);

        // FLY TO DRIVER
        map.current.flyTo({
            center: [
                driver.currentLocation.lng,
                driver.currentLocation.lat
            ],
            zoom: 13,
            duration: 1000
        });
    };

    // Fetch historical path from API and draw it on the map
    const fetchAndDrawPath = async (driverId) => {
        if (!map.current) return;

        // Remove previous path layers if any
        ['driver-path-online', 'driver-path-offline'].forEach(layerId => {
            if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
            if (map.current.getSource(layerId)) map.current.removeSource(layerId);
        });

        try {
            const token = localStorage.getItem('authToken') || '';
            const res = await fetch(`/api/admin/driver-path/${driverId}?hours=8`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const data = await res.json();
            if (!data.success || !data.path?.length) return;

            // Split online vs offline segments
            const onlineCoords  = data.path.filter(p => !p.was_offline).map(p => [Number(p.longitude), Number(p.latitude)]);
            const offlineCoords = data.path.filter(p => p.was_offline).map(p => [Number(p.longitude), Number(p.latitude)]);

            // Draw solid blue line for online points
            if (onlineCoords.length >= 2) {
                map.current.addSource('driver-path-online', {
                    type: 'geojson',
                    data: { type: 'Feature', geometry: { type: 'LineString', coordinates: onlineCoords } }
                });
                map.current.addLayer({
                    id: 'driver-path-online',
                    type: 'line',
                    source: 'driver-path-online',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#3B82F6', 'line-width': 3, 'line-opacity': 0.8 }
                });
            }

            // Draw dashed orange line for offline (queued) points
            if (offlineCoords.length >= 2) {
                map.current.addSource('driver-path-offline', {
                    type: 'geojson',
                    data: { type: 'Feature', geometry: { type: 'LineString', coordinates: offlineCoords } }
                });
                map.current.addLayer({
                    id: 'driver-path-offline',
                    type: 'line',
                    source: 'driver-path-offline',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': '#F97316',
                        'line-width': 3,
                        'line-opacity': 0.9,
                        'line-dasharray': [2, 2]
                    }
                });
            }

            console.log(`Historical path drawn: ${onlineCoords.length} online, ${offlineCoords.length} offline points`);
        } catch (e) {
            console.warn('Could not load historical path:', e);
        }
    };

    // Create custom driver marker element
    const createDriverMarker = (driver) => {
        const el = document.createElement('div');
        el.className = 'relative flex items-center justify-center';
        
        const isGpsOn = driver.isGpsEnabled ?? true;
        const outerClass = isGpsOn ? 'bg-blue-500 animate-pulse' : 'bg-red-500';
        const innerClass = isGpsOn ? 'bg-blue-600' : 'bg-red-600';
        
        // Using a sleek navigation arrow (chevron) for the map marker instead of a truck
        el.innerHTML = `
            <div class="absolute w-12 h-12 ${outerClass} rounded-full opacity-30"></div>
            <div class="relative ${innerClass} w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" style="margin-bottom: 2px;">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                </svg>
            </div>
        `;
        return el;
    };

    // Create pickup marker
    const createPickupMarker = () => {
        const el = document.createElement('div');
        el.className = 'relative';
        el.innerHTML = `
            <div class="bg-green-500 rounded-full p-2 border-2 border-white shadow-lg">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
            </div>
        `;
        return el;
    };

    // Create destination marker
    const createDestinationMarker = () => {
        const el = document.createElement('div');
        el.className = 'relative';
        el.innerHTML = `
            <div class="bg-red-500 rounded-full p-2 border-2 border-white shadow-lg">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
            </div>
        `;
        return el;
    };

    // Get route using Mapbox Directions API
    const getDirections = async (coordinates) => {
        try {
            const formattedCoordinates = coordinates
                .map(coord => `${Number(coord[0])},${Number(coord[1])}`)
                .join(';');

            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${formattedCoordinates}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;

            console.log('DIRECTIONS URL:', url);

            const response = await fetch(url);

            const data = await response.json();

            console.log('MAPBOX RESPONSE:', data);

            if (!data.routes || data.routes.length === 0) {
                console.error('No route found');
                return null;
            }

            return data.routes[0].geometry;
        } catch (error) {
            console.error('Directions API Error:', error);
            return null;
        }
    };

    // Coordinate validation
    const isValidCoordinate = (lat, lng) => {
        return (
            !isNaN(lat) &&
            !isNaN(lng) &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180
        );
    };

    // Draw route line following roads
    const drawRoute = async (driver) => {
        if (!map.current) return;

        const routeId = `route-${driver.id}`;

        const requestId = Date.now();
        latestRouteRequest.current[driver.id] = requestId;

        let coordinates = [];

        if (driver.delivery?.delivery_status === 'in_transit') {
            coordinates = [
                [driver.currentLocation.lng, driver.currentLocation.lat],
                [driver.destination.lng, driver.destination.lat],
            ];
        } else {
            coordinates = [
                [driver.currentLocation.lng, driver.currentLocation.lat],
                [driver.pickup.lng, driver.pickup.lat],
            ];
        }

        const route = await getDirections(coordinates);

        if (!route) return;

        // Ignore old API responses
        if (latestRouteRequest.current[driver.id] !== requestId) {
            return;
        }

        const routeData = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: route.coordinates,
            },
        };

        const source = map.current.getSource(routeId);

        if (source) {
            source.setData(routeData);
        } else {
            map.current.addSource(routeId, {
                type: "geojson",
                data: routeData,
            });

            map.current.addLayer({
                id: routeId,
                type: "line",
                source: routeId,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#2563EB",
                    "line-width": 5,
                    "line-opacity": 0.85,
                },
            });
        }
        
        routeLines.current[routeId] = true;
    };

    // Fallback straight line route
    const drawStraightLineRoute = (driver, routeId) => {
        let coordinates = [];
        
        // Check delivery status to determine route type
        if (driver.delivery?.delivery_status === 'in_transit') {
            // AFTER CONFIRM PICKUP: Single route from current location to destination
            console.log('DRAWING: Current to destination route (in_transit)');
            coordinates = [
                [driver.currentLocation.lng, driver.currentLocation.lat],
                [driver.destination.lng, driver.destination.lat]
            ];
        } else {
            // BEFORE CONFIRM PICKUP: Only route to pickup location
            console.log('DRAWING: Current to pickup route (assigned)');
            coordinates = [
                [driver.currentLocation.lng, driver.currentLocation.lat],
                [driver.pickup.lng, driver.pickup.lat]
            ];
        }

        const routeData = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            }
        };

        // REMOVE OLD LAYER
        if (map.current.getLayer(routeId)) {
            try {
                map.current.removeLayer(routeId);
            } catch (e) {
                console.log('Layer already removed or does not exist:', e);
            }
        }

        // REMOVE OLD SOURCE
        if (map.current.getSource(routeId)) {
            try {
                map.current.removeSource(routeId);
            } catch (e) {
                console.log('Source already removed or does not exist:', e);
            }
        }

        // ADD SOURCE (or update if exists)
        if (map.current.getSource(routeId)) {
            map.current.getSource(routeId).setData(routeData);
        } else {
            map.current.addSource(routeId, {
                type: 'geojson',
                data: routeData
            });
        }

        // ADD LINE LAYER (if not exists)
        if (!map.current.getLayer(routeId)) {
            map.current.addLayer({
                id: routeId,
                type: 'line',
                source: routeId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3B82F6',
                    'line-width': 5,
                    'line-opacity': 0.8
                }
            });
        }

        // SAVE ROUTE ID
        routeLines.current[routeId] = true;
    };

    // Update driver marker position in real-time
    const updateDriverPosition = (driver) => {
        if (!map.current || !markers.current[driver.id]?.driver) return;

        const driverMarker = markers.current[driver.id].driver;
        const startLngLat = driverMarker.getLngLat().toArray();
        const endLngLat = [driver.currentLocation.lng, driver.currentLocation.lat];

        // Animate marker and rotation
        animateMarker(driver.id, startLngLat, endLngLat);

        // Redraw route with new position
        drawRoute(driver);

        // Smart Pan if following
        if (followDriverRef.current && selectedDriverRef.current?.id === driver.id) {
            smartPanTo(driver.currentLocation.lng, driver.currentLocation.lat);
        }
    };

    // Handle driver selection
    const handleDriverSelect = async (driver) => {
        setSelectedDriver(driver);
        setViewAllDrivers(false);

        // Show driver on map immediately with smooth animation
        showDriverOnMap(driver);

        // Refresh driver data to get latest status (in background)
        router.reload({ 
            only: ['pendingDeliveries', 'allDeliveries'], 
            preserveScroll: true, 
            preserveState: true,
            onSuccess: () => {
                console.log('Driver data refreshed');
                // Update driver on map with refreshed data
                const updatedDriver = driverList.find(d => d.id === driver.id);
                if (updatedDriver) {
                    updateDriverPosition(updatedDriver);
                }
            }
        });
    };

    // View all drivers
    const handleViewAllDrivers = () => {
        setViewAllDrivers(true);
        setSelectedDriver(null);
        setFollowDriver(false); // Disable follow when viewing all
        showAllDriversOnMap();
    };

    // Handle follow driver toggle
    const handleFollowDriver = () => {
        const newFollowState = !followDriver;
        setFollowDriver(newFollowState);

        if (newFollowState && selectedDriver && map.current) {
            // When enabling follow, immediately center on driver with smooth animation
            map.current.flyTo({
                center: [
                    selectedDriver.currentLocation.lng,
                    selectedDriver.currentLocation.lat
                ],
                zoom: 18, // Closer zoom when following (increased for better view)
                duration: 1500,
                essential: true
            });
        } else if (!newFollowState && map.current) {
            // When disabling follow, zoom out slightly for better context
            map.current.flyTo({
                zoom: 13,
                duration: 1000,
                essential: true
            });
        }
    };

    // Filter drivers based on search
    const filteredDrivers = driverList.filter(driver => {
        if (!searchTerm) return true;
        const searchParts = searchTerm.toLowerCase().split(' ').filter(part => part.trim() !== '');
        return searchParts.every(part => 
            driver.name.toLowerCase().includes(part) || 
            driver.plateNumber.toLowerCase().includes(part)
        );
    });

    // Get status badge styling
    const getStatusBadge = (status) => {
        const cleanStatus = status || 'stopped';
        const styles = {
            moving: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
            delivering: 'bg-blue-50 text-blue-700 border-blue-200/60',
            stopped: 'bg-amber-50 text-amber-700 border-amber-200/60',
            offline: 'bg-slate-100 text-slate-600 border-slate-200',
        };

        const icons = {
            moving: <span className="relative flex h-1.5 w-1.5 mr-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>,
            delivering: <PackageIcon className="w-3 h-3 text-blue-500 mr-1" />,
            stopped: <AlertCircleIcon className="w-3.5 h-3.5 mr-1 text-amber-500" />,
            offline: <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></div>
        };

        const currentStyle = styles[cleanStatus] || styles.offline;
        const currentIcon = icons[cleanStatus] || icons.offline;

        return (
            <div className={`flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-sm ${currentStyle}`}>
                {currentIcon}
                <span className="capitalize">{cleanStatus}</span>
            </div>
        );
    };

    return (
        <AdminLayout title="Live Routes" authUser={authUser} activeMenu="routes">
            <div className="w-full h-screen flex overflow-hidden bg-gray-50">
                {/* LEFT PANEL - Driver List */}
                <div className="w-[380px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-lg z-10">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                        <div className="mb-4">
                            <h1 className="text-xl font-bold text-slate-955 flex items-center gap-2">
                                <NavigationIcon className="w-5.5 h-5.5 text-blue-600 animate-pulse" />
                                Live Drivers
                            </h1>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                                <ActivityIcon className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                                GPS Tracking • Pickup & Delivery
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <SearchIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search driver or plate number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none bg-white transition-all text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Driver Cards */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                        {filteredDrivers.map((driver) => (
                            <div
                                key={driver.id}
                                onClick={() => handleDriverSelect(driver)}
                                className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                                    selectedDriver?.id === driver.id
                                        ? 'bg-white border-blue-600 shadow-xl shadow-blue-100/50 ring-4 ring-blue-50'
                                        : 'bg-white border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md'
                                }`}
                            >
                                    {/* Driver Info */}
                                    <div className="flex items-start justify-between gap-2 mb-3.5">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm leading-tight">{driver.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                                <TruckIcon className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">{driver.plateNumber}</span>
                                            </p>
                                        </div>
                                        {getStatusBadge(driver.status)}
                                    </div>

                                    {/* Travel route layout */}
                                    <div className="relative pl-4 border-l border-dashed border-slate-300 space-y-3 mt-4">
                                        {/* Pickup pin */}
                                        <div className="relative">
                                            <div className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Pickup</p>
                                            <p className="text-xs text-slate-700 font-semibold truncate mt-1">{driver.pickup.address}</p>
                                        </div>
                                        {/* Destination pin */}
                                        <div className="relative">
                                            <div className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-50"></div>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Destination</p>
                                            <p className="text-xs text-slate-700 font-semibold truncate mt-1">{driver.destination.address}</p>
                                        </div>
                                    </div>

                                    {/* Status Details Footer */}
                                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">{driver.speed} km/h</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <ClockIcon className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
                                            <span>{driver.lastUpdated}</span>
                                        </div>
                                    </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL - Interactive Map */}
                <div className="flex-1 relative">
                    {/* Map Container */}
                    <div
    ref={mapContainer}
    className="absolute inset-4 w-[calc(104%-2rem)] h-[calc(95%-2rem)] rounded-l-2xl overflow-hidden"
/>
                    
                    {/* Loading indicator */}
                    {!mapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-l-2xl">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading map...</p>
                            </div>
                        </div>
                    )}

                    {/* Map Controls */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-lg rounded-lg shadow-lg p-2 space-y-2">
                        <button
                            onClick={handleViewAllDrivers}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                viewAllDrivers
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <UsersIcon className="w-4 h-4" />
                            View All Drivers
                        </button>
                        {selectedDriver && (
                            <button
                                onClick={handleFollowDriver}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    followDriver
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <EyeIcon className="w-4 h-4" />
                                {followDriver ? 'Following' : 'Follow Driver'}
                            </button>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-lg rounded-lg shadow-lg p-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                <span>Driver</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Pickup</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span>Destination</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-8 h-0.5 bg-blue-500"></div>
                                <span>Route</span>
                            </div>
                        </div>
                    </div>

                    {/* Compact Floating Driver Info Card */}
{selectedDriver && (
    <div className="absolute top-4 right-4 w-[300px] bg-white/90 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn z-50">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-4 py-4 text-white">

            {/* Close Button */}
            <button
                onClick={() => setSelectedDriver(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
                <XMarkIcon className="w-4 h-4 text-white" />
            </button>

            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
                    <TruckIcon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 pr-8">
                    <h3 className="text-base font-bold leading-tight">
                        {selectedDriver.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 text-blue-100 text-xs">
                        <span>{selectedDriver.plateNumber}</span>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div className="mt-3">
                {getStatusBadge(selectedDriver.status)}
            </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">

                <div className="bg-blue-50 rounded-xl p-2 border border-blue-100">
                    <p className="text-[10px] text-blue-600 font-medium mb-1">
                        ETA
                    </p>
                    <p className="text-xs font-bold text-gray-900">
                        {selectedDriver.eta}
                    </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-2 border border-purple-100">
                    <p className="text-[10px] text-purple-600 font-medium mb-1">
                        Distance
                    </p>
                    <p className="text-xs font-bold text-gray-900">
                        {selectedDriver.distance}
                    </p>
                </div>

                <div className="bg-green-50 rounded-xl p-2 border border-green-100">
                    <p className="text-[10px] text-green-600 font-medium mb-1">
                        Cargo
                    </p>
                    <p className="text-xs font-bold text-gray-900 truncate">
                        {selectedDriver.cargoWeight}
                    </p>
                </div>
            </div>

            {/* Locations */}
            <div className="space-y-3">

                {/* Pickup */}
                <div className="flex gap-2">
                    <div className="mt-1 w-3 h-3 rounded-full bg-green-500"></div>

                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-semibold text-green-600 mb-1">
                            Pickup
                        </p>

                        <p className="text-xs text-gray-700 leading-relaxed">
                            {selectedDriver.pickup.address}
                        </p>
                    </div>
                </div>

                {/* Destination */}
                <div className="flex gap-2">
                    <div className="mt-1 w-3 h-3 rounded-full bg-red-500"></div>

                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-semibold text-red-600 mb-1">
                            Destination
                        </p>

                        <p className="text-xs text-gray-700 leading-relaxed">
                            {selectedDriver.destination.address}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">

                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-all">
                    View Route
                </button>

                <button className="w-11 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all">
                    <PhoneIcon className="w-4 h-4 text-gray-700" />
                </button>

            </div>
        </div>
    </div>

                        )}
                </div>
            </div>
        </AdminLayout>
    );
}
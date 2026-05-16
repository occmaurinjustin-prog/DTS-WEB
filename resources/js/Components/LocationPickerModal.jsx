import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// Set Mapbox access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function LocationPickerModal({ isOpen, onClose, onConfirm, type, initialLocation }) {
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const currentMarkerRef = useRef(null);

    const isPickup = type === 'pickup';
    const markerColor = isPickup ? '#16A34A' : '#EF4444';
    const title = isPickup ? 'Select Pickup Location' : 'Select Delivery Location';

    useEffect(() => {
        if (isOpen && mapRef.current && !map) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                console.log('Initializing map, container:', mapRef.current);
                console.log('Container dimensions:', {
                    width: mapRef.current?.offsetWidth,
                    height: mapRef.current?.offsetHeight,
                    clientWidth: mapRef.current?.clientWidth,
                    clientHeight: mapRef.current?.clientHeight
                });
                
                try {
                    // Initialize map
                    const mapboxMap = new mapboxgl.Map({
                        container: mapRef.current,
                        style: 'mapbox://styles/mapbox/streets-v12',
                        center: [124.6319, 8.4542], // Philippines center
                        zoom: 8,
                        attributionControl: false,
                        antialias: true,
                        preserveDrawingBuffer: true,
                    });

                    // Force map to load and resize - consolidate all load logic
                    mapboxMap.on('load', () => {
                        console.log('Mapbox map loaded successfully');
                        setMapLoaded(true);
                        setTimeout(() => {
                            mapboxMap.resize();
                        }, 100);
                        
                        // Add click handler only after map is fully loaded
                        mapboxMap.on('click', (e) => {
                            console.log('Map clicked!', e);
                            const coordinates = e.lngLat;
                            handleLocationSelect(coordinates.lat, coordinates.lng, mapboxMap);
                        });
                        
                        // If initial location exists, set marker
                        if (initialLocation) {
                            const [lng, lat] = initialLocation.split(',').map(Number);
                            setTimeout(() => {
                                handleLocationSelect(lat, lng, mapboxMap);
                                mapboxMap.flyTo({ center: [lng, lat], zoom: 14 });
                            }, 200);
                        }
                    });

                    // Debug: Check if map is ready
                    setTimeout(() => {
                        if (mapboxMap) {
                            console.log('Mapbox map is ready and interactive');
                        }
                    }, 1000);

                    setMap(mapboxMap);
                } catch (error) {
                    console.error('Error initializing map:', error);
                }
            }, 100);

            return () => clearTimeout(timer);
        }

        return () => {
            if (map) {
                map.remove();
                setMap(null);
            }
            setMapLoaded(false);
            // Clear the map container
            if (mapRef.current) {
                mapRef.current.innerHTML = '';
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchQuery.length > 2) {
            setLoading(true);
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
                    );
                    const data = await response.json();
                    
                    if (data.length > 0) {
                        const result = data[0];
                        const lat = parseFloat(result.lat);
                        const lng = parseFloat(result.lon);
                        handleLocationSelect(lat, lng);
                        if (map) {
                            map.flyTo({ center: [lng, lat], zoom: 14 });
                        }
                    }
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setLoading(false);
                }
            }, 500);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const handleLocationSelect = async (lat, lng, mapInstance = null) => {
        const currentMap = mapInstance || map;
        
        // Check if map is available
        if (!currentMap) {
            console.error('Map is not available for marker creation');
            return;
        }
        
        // Check if map is loaded (for state-based calls) or if instance is passed (for event handlers)
        if (!mapInstance && !mapLoaded) {
            console.error('Map is not fully loaded for marker creation');
            return;
        }
        
        // Remove existing marker if any (using ref for immediate tracking)
        if (currentMarkerRef.current) {
            console.log('Removing existing marker');
            currentMarkerRef.current.remove();
            currentMarkerRef.current = null;
        }
        
        try {
            // Create marker with proper color based on type
            const newMarker = new mapboxgl.Marker({
                color: markerColor,
                draggable: true,
            })
            .setLngLat([lng, lat])
            .addTo(currentMap);
            
            // Update both ref and state
            currentMarkerRef.current = newMarker;
            setMarker(newMarker);
            
            console.log('Created new marker at:', lat, lng);

            // Handle marker drag
            newMarker.on('dragend', function(e) {
                const coordinates = e.target.getLngLat();
                handleLocationSelect(coordinates.lat, coordinates.lng);
            });

            setSelectedLocation({ lat, lng });

            // Reverse geocoding
            setLoading(true);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            setAddress(data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } catch (error) {
            console.error('Error creating marker or geocoding:', error);
            setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await handleLocationSelect(latitude, longitude);
                    if (map) {
                        map.flyTo({ center: [longitude, latitude], zoom: 14 });
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Unable to get your current location. Please enable location services.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    const handleConfirm = () => {
        if (selectedLocation && address) {
            onConfirm({
                address,
                coordinates: `${selectedLocation.lat},${selectedLocation.lng}`,
            });
            onClose();
            // Reset state
            setSearchQuery('');
            setAddress('');
            setSelectedLocation(null);
            if (currentMarkerRef.current) {
                currentMarkerRef.current.remove();
                currentMarkerRef.current = null;
            }
            setMarker(null);
        }
    };

    const handleClose = () => {
        onClose();
        // Reset state
        setSearchQuery('');
        setAddress('');
        setSelectedLocation(null);
        if (currentMarkerRef.current) {
            currentMarkerRef.current.remove();
            currentMarkerRef.current = null;
        }
        setMarker(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a location..."
                            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        />
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {loading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map */}
                <div className="flex-1 relative min-h-[400px]">
                    <div 
                        ref={mapRef} 
                        className="w-full h-full" 
                        style={{ 
                            minHeight: '400px',
                            position: 'relative',
                            width: '100%',
                            height: '100%'
                        }} 
                    />
                </div>

                {/* Selected Address */}
                {address && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Selected Location:</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{address}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleCurrentLocation}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Use Current Location
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!selectedLocation || !address}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

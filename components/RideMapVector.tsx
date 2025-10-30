"use client";

import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Sun, Moon } from "lucide-react";

interface MapProps {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  route: [number, number][];
}

export default function RideMapVector({ start, end, route }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const OLA_MAPS_API_KEY = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;

  // Available Ola Maps styles
  const styles = {
    light: `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${OLA_MAPS_API_KEY}`,
    dark: `https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json?api_key=${OLA_MAPS_API_KEY}`,
  };

  // Function to add route and markers
  const addMapLayers = () => {
    if (!map.current) return;

    // Add 3D buildings layer
    const layers = map.current.getStyle().layers;
    let labelLayerId;

    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === "symbol") {
        labelLayerId = layers[i].id;
        break;
      }
    }

    // Check if 3d-buildings layer already exists
    if (!map.current.getLayer("3d-buildings")) {
      map.current.addLayer(
        {
          id: "3d-buildings",
          source: "vectordata",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": isDarkMode ? "#555" : "#aaa",
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              13,
              0,
              16,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              13,
              0,
              16,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.6,
          },
        },
        labelLayerId
      );
    }

    // Add start marker
    new maplibregl.Marker({ color: "#22c55e" })
      .setLngLat([start.lng, start.lat])
      .setPopup(new maplibregl.Popup().setHTML("<p>Start Point</p>"))
      .addTo(map.current);

    // Add end marker
    new maplibregl.Marker({ color: "#ef4444" })
      .setLngLat([end.lng, end.lat])
      .setPopup(new maplibregl.Popup().setHTML("<p>End Point</p>"))
      .addTo(map.current);

    // Add route line
    const routeCoordinates = route.map(([lat, lng]) => [lng, lat]);

    if (!map.current.getSource("route")) {
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 5,
          "line-opacity": 0.8,
        },
      });
    }
  };

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current || !OLA_MAPS_API_KEY) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styles.light,
        center: [start.lng, start.lat],
        zoom: 15,
        pitch: 60,
        bearing: 0,
        transformRequest: (url, resourceType) => {
          if (url.includes("api.olamaps.io") && !url.includes("api_key=")) {
            const separator = url.includes("?") ? "&" : "?";
            url = `${url}${separator}api_key=${OLA_MAPS_API_KEY}`;
          }
          return { url };
        },
      });

      // Add navigation controls
      map.current.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
        }),
        "top-right"
      );

      // Filter out harmless errors
      map.current.on("error", (e) => {
        const errorMessage = e.error?.message || "";
        if (
          errorMessage.includes("3d_model") ||
          errorMessage.includes("does not exist on source")
        ) {
          return;
        }
        console.error("Map error:", errorMessage);
      });

      map.current.on("load", () => {
        addMapLayers();

        // Fit bounds to route
        const bounds = new maplibregl.LngLatBounds();
        route.forEach(([lat, lng]) => bounds.extend([lng, lat]));
        map.current?.fitBounds(bounds, { padding: 100 });
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    if (!map.current) return;

    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    // Save current view state
    const center = map.current.getCenter();
    const zoom = map.current.getZoom();
    const bearing = map.current.getBearing();
    const pitch = map.current.getPitch();

    // Change style
    map.current.setStyle(newTheme ? styles.dark : styles.light);

    // Re-add layers after style loads
    map.current.once("styledata", () => {
      // Restore view state
      map.current?.jumpTo({
        center: center,
        zoom: zoom,
        bearing: bearing,
        pitch: pitch,
      });

      // Re-add all custom layers
      addMapLayers();
    });
  };

  return (
    <div style={{ position: "relative", height: "500px", width: "100%" }}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1,
          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#1f2937",
          border: "none",
          borderRadius: "8px",
          padding: "10px 12px",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
          fontWeight: "500",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isDarkMode ? (
          <>
            <Sun size={18} />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon size={18} />
            <span>Dark Mode</span>
          </>
        )}
      </button>

      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "8px",
        }}
      />
    </div>
  );
}

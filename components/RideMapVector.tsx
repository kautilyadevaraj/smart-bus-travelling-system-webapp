"use client";

import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapProps {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  route: [number, number][];
}

export default function RideMapVector({ start, end, route }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const OLA_MAPS_API_KEY = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;

  useEffect(() => {
    if (map.current || !mapContainer.current || !OLA_MAPS_API_KEY) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${OLA_MAPS_API_KEY}`,
        center: [start.lng, start.lat],
        zoom: 15,
        pitch: 60, // 3D view angle
        bearing: 0, // Map rotation
        transformRequest: (url, resourceType) => {
          if (url.includes("api.olamaps.io") && !url.includes("api_key=")) {
            const separator = url.includes("?") ? "&" : "?";
            url = `${url}${separator}api_key=${OLA_MAPS_API_KEY}`;
          }
          return { url };
        },
      });

      // Add navigation controls (zoom, rotation, pitch)
      map.current.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
        }),
        "top-right"
      );

      // Filter out harmless 3D model layer errors
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
        if (!map.current) return;

        // Add 3D buildings layer
        const layers = map.current.getStyle().layers;
        let labelLayerId;

        // Find the first symbol layer to insert buildings below labels
        for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === "symbol") {
            labelLayerId = layers[i].id;
            break;
          }
        }

        // Add 3D building extrusions
        map.current.addLayer(
          {
            id: "3d-buildings",
            source: "vectordata",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 13,
            paint: {
              "fill-extrusion-color": "#aaa",
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

        // Add start marker (green)
        new maplibregl.Marker({ color: "#22c55e" })
          .setLngLat([start.lng, start.lat])
          .setPopup(new maplibregl.Popup().setHTML("<p>Start Point</p>"))
          .addTo(map.current);

        // Add end marker (red)
        new maplibregl.Marker({ color: "#ef4444" })
          .setLngLat([end.lng, end.lat])
          .setPopup(new maplibregl.Popup().setHTML("<p>End Point</p>"))
          .addTo(map.current);

        // Add route line with elevated position
        const routeCoordinates = route.map(([lat, lng]) => [lng, lat]);

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

        // Fit bounds to route
        const bounds = new maplibregl.LngLatBounds();
        route.forEach(([lat, lng]) => bounds.extend([lng, lat]));
        map.current.fitBounds(bounds, { padding: 100 });
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [start, end, route, OLA_MAPS_API_KEY]);

  return (
    <div
      ref={mapContainer}
      style={{
        height: "500px", // Increased height for 3D view
        width: "100%",
        borderRadius: "8px",
      }}
    />
  );
}

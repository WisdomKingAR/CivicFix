// frontend/src/features/map/components/InteractiveMap.tsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoJsonFeatureCollection, ComplaintCluster, SensitiveLocation } from '../../../core/types';

interface InteractiveMapProps {
  geoJsonData?: GeoJsonFeatureCollection | null;
  clusters?: ComplaintCluster[];
  sensitiveLocations?: SensitiveLocation[];
  onSelectComplaint?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  geoJsonData,
  clusters = [],
  sensitiveLocations,
  onSelectComplaint,
  center = [19.076, 72.8777],
  zoom = 12,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const defaultSensitiveLocations: SensitiveLocation[] = sensitiveLocations || [
    { id: '1', name: 'KEM Hospital', type: 'HOSPITAL', lat: 18.9388, lng: 72.8258 },
    { id: '2', name: 'Nair Hospital (BYL Nair)', type: 'HOSPITAL', lat: 18.9629, lng: 72.8193 },
    { id: '3', name: 'Hinduja Hospital Mahim', type: 'HOSPITAL', lat: 19.033, lng: 72.8397 },
    { id: '4', name: 'Lilavati Hospital Bandra', type: 'HOSPITAL', lat: 19.0543, lng: 72.8266 },
    { id: '5', name: 'Kokilaben Hospital Andheri', type: 'HOSPITAL', lat: 19.1337, lng: 72.8272 },
    { id: '6', name: 'Don Bosco High School Matunga', type: 'SCHOOL', lat: 19.0216, lng: 72.8427 },
    { id: '7', name: "St. Xavier's High School Fort", type: 'SCHOOL', lat: 18.9322, lng: 72.8264 },
  ];

  // 1. Initialize Map ONCE and cleanup on unmount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // Re-pan map when center or zoom prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // 2. Update Map Layers whenever data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Render Sensitive Location Radius Buffers (500m)
    defaultSensitiveLocations.forEach((loc) => {
      const color = loc.type === 'HOSPITAL' ? '#F43F5E' : '#A855F7';
      const circle = L.circle([loc.lat, loc.lng], {
        radius: 500,
        color,
        fillColor: color,
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '4, 6',
      });

      const iconHtml = `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`;
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-sensitive-icon',
        iconSize: [12, 12],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-size: 13px; font-weight: 600; padding: 4px; color: white;">
          <div style="color: ${color}; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 2px;">
            ${loc.type === 'HOSPITAL' ? '🏥 Hospital' : '🏫 School'} Zone (500m Priority)
          </div>
          <div>${loc.name}</div>
        </div>
      `);

      layerGroup.addLayer(circle);
      layerGroup.addLayer(marker);
    });

    // Render Complaint GeoJSON Markers & Clusters
    if (geoJsonData?.features && geoJsonData.features.length > 0) {
      geoJsonData.features.forEach((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties;

        let statusColor = '#3B82F6';
        if (props.status === 'RESOLVED') statusColor = '#10B981';
        else if (props.status === 'UNDER_REVIEW') statusColor = '#A855F7';
        else if (props.priorityScore && props.priorityScore > 70) statusColor = '#F43F5E';
        else if (props.priorityScore && props.priorityScore > 40) statusColor = '#F59E0B';

        const isCluster = props.isCluster || (props.complaintCount && props.complaintCount > 1);

        const markerHtml = `
          <div style="
            background: ${statusColor};
            width: ${isCluster ? '34px' : '26px'};
            height: ${isCluster ? '34px' : '26px'};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 15px ${statusColor};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            font-size: ${isCluster ? '12px' : '10px'};
            cursor: pointer;
          ">
            ${isCluster ? props.complaintCount : '📍'}
          </div>
        `;

        const customMarkerIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-map-pin',
          iconSize: [30, 30],
        });

        const marker = L.marker([lat, lng], { icon: customMarkerIcon });

        const popupContent = `
          <div style="width: 250px; font-family: 'Inter', sans-serif;">
            <div style="position: relative; height: 120px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #0f172a;">
              ${props.photoUrl ? `<img src="${props.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Incident" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#475569;font-size:24px;">📷</div>`}
              <div style="position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.75); padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; color: ${statusColor}; border: 1px solid ${statusColor};">
                ${props.status || 'REPORTED'}
              </div>
            </div>
            <div style="font-weight: 700; font-size: 14px; color: #ffffff; margin-bottom: 4px;">
              ${(props.category || 'CIVIC ISSUE').replace('_', ' ')}
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${props.description || 'No additional description provided.'}
            </p>
            <p style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              📍 ${props.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
            </p>
            ${
              props.priorityScore
                ? `<div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 6px; font-weight: 600; margin-bottom: 6px;">
                    <span style="color: #cbd5e1;">Priority Score</span>
                    <span style="color: ${statusColor}; font-weight: 800;">${Math.round(props.priorityScore)}/100</span>
                   </div>`
                : ''
            }
            ${
              onSelectComplaint && props.id
                ? `<button id="btn-inspect-${props.id}" style="width: 100%; background: #22c55e; color: #004b1e; font-weight: 700; font-size: 11px; padding: 6px; border-radius: 6px; border: none; cursor: pointer; margin-top: 4px;">
                    Inspect Incident Details →
                   </button>`
                : ''
            }
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          if (onSelectComplaint && props.id) {
            const btn = document.getElementById(`btn-inspect-${props.id}`);
            if (btn) {
              btn.onclick = () => onSelectComplaint(props.id);
            }
          }
        });

        layerGroup.addLayer(marker);
      });

      // Fit bounds when markers exist
      const coords = geoJsonData.features.map(
        (f) => [f.geometry.coordinates[1], f.geometry.coordinates[0]] as [number, number]
      );
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [geoJsonData, clusters, onSelectComplaint]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-[#0b1c30]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Legend Overlay */}
      <div className="absolute top-4 left-4 z-[1000] glass-panel px-3 py-2 text-xs flex flex-wrap gap-3 items-center border border-slate-300 shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />
          High Priority (&gt;70)
        </div>
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
          Medium Priority
        </div>
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
          Resolved
        </div>
        <div className="flex items-center gap-1.5 font-bold text-purple-700">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-white" />
          500m Hospital/School Zone
        </div>
      </div>
    </div>
  );
};

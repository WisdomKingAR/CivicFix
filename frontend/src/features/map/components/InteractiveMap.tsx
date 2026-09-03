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
    // Hospitals
    { id: 'h1', name: 'KEM Hospital (King Edward Memorial)', type: 'HOSPITAL', lat: 18.9388, lng: 72.8258 },
    { id: 'h2', name: 'Nair Hospital (BYL Nair)', type: 'HOSPITAL', lat: 18.9629, lng: 72.8193 },
    { id: 'h3', name: 'St. George Hospital', type: 'HOSPITAL', lat: 18.9338, lng: 72.8392 },
    { id: 'h4', name: 'Hinduja Hospital Mahim', type: 'HOSPITAL', lat: 19.033, lng: 72.8397 },
    { id: 'h5', name: 'Lilavati Hospital Bandra', type: 'HOSPITAL', lat: 19.0543, lng: 72.8266 },
    { id: 'h6', name: 'Holy Family Hospital Bandra', type: 'HOSPITAL', lat: 19.0606, lng: 72.8363 },
    { id: 'h7', name: 'Kokilaben Hospital Andheri', type: 'HOSPITAL', lat: 19.1337, lng: 72.8272 },
    { id: 'h8', name: 'Cooper Hospital (RDMT) Juhu', type: 'HOSPITAL', lat: 19.1010, lng: 72.8340 },
    { id: 'h9', name: 'Seven Hills Hospital Andheri', type: 'HOSPITAL', lat: 19.1197, lng: 72.8464 },
    { id: 'h10', name: 'Bhagwati Hospital Borivali', type: 'HOSPITAL', lat: 19.2247, lng: 72.8561 },
    { id: 'h11', name: 'Fortis Hospital Mulund', type: 'HOSPITAL', lat: 19.1723, lng: 72.9561 },
    { id: 'h12', name: 'Hiranandani Hospital Powai', type: 'HOSPITAL', lat: 19.1197, lng: 72.9093 },
    // Schools
    { id: 's1', name: "St. Xavier's High School Fort", type: 'SCHOOL', lat: 18.9322, lng: 72.8264 },
    { id: 's2', name: 'Cathedral and John Connon School', type: 'SCHOOL', lat: 18.9356, lng: 72.8338 },
    { id: 's3', name: 'Campion School Mumbai', type: 'SCHOOL', lat: 18.9381, lng: 72.8292 },
    { id: 's4', name: 'Don Bosco High School Matunga', type: 'SCHOOL', lat: 19.0216, lng: 72.8427 },
    { id: 's5', name: 'Balmohan Vidyamandir Dadar', type: 'SCHOOL', lat: 19.0182, lng: 72.8417 },
    { id: 's6', name: 'Shardashram Vidyamandir Dadar', type: 'SCHOOL', lat: 19.0178, lng: 72.8436 },
    { id: 's7', name: 'Bombay Scottish School Mahim', type: 'SCHOOL', lat: 19.0384, lng: 72.8414 },
    { id: 's8', name: 'St. Stanislaus High School Bandra', type: 'SCHOOL', lat: 19.0569, lng: 72.8394 },
    { id: 's9', name: 'Dhirubhai Ambani International School BKC', type: 'SCHOOL', lat: 19.0633, lng: 72.8681 },
    { id: 's10', name: 'Holy Family School Andheri', type: 'SCHOOL', lat: 19.1142, lng: 72.8521 },
    { id: 's11', name: 'Arya Vidya Mandir Juhu', type: 'SCHOOL', lat: 19.1022, lng: 72.8278 },
    { id: 's12', name: 'Ryan International School Kandivali', type: 'SCHOOL', lat: 19.2086, lng: 72.8357 },
    { id: 's13', name: 'Thakur Public School Kandivali East', type: 'SCHOOL', lat: 19.2018, lng: 72.8715 },
    { id: 's14', name: 'Children Academy Malad East', type: 'SCHOOL', lat: 19.1836, lng: 72.8706 },
    { id: 's15', name: 'Atomic Energy Central School Anushaktinagar', type: 'SCHOOL', lat: 19.0517, lng: 72.9261 },
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
      const isHospital = loc.type === 'HOSPITAL';
      // Hospitals: red-rose, Schools: purple-violet
      const color = isHospital ? '#F43F5E' : '#8B5CF6';
      const emoji = isHospital ? '🏥' : '🏫';
      const iconSize = isHospital ? 14 : 12;

      L.circle([loc.lat, loc.lng], {
        radius: 500,
        color,
        fillColor: color,
        fillOpacity: 0.07,
        weight: isHospital ? 1.8 : 1.2,
        dashArray: isHospital ? '4, 6' : '2, 8',
      }).addTo(layerGroup);

      const iconHtml = `
        <div style="
          background: ${color};
          width: ${iconSize}px;
          height: ${iconSize}px;
          border-radius: ${isHospital ? '50%' : '3px'};
          border: 2px solid white;
          box-shadow: 0 0 8px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
        ">${isHospital ? '+' : '✦'}</div>`;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-sensitive-icon',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; font-size: 12px; min-width: 180px; padding: 2px 0;">
          <div style="color: ${color}; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 4px;">
            ${emoji} ${isHospital ? 'Hospital' : 'School'} Zone — 500m Priority
          </div>
          <div style="font-weight: 700; color: #1e293b; font-size: 13px; line-height: 1.3;">${loc.name}</div>
          <div style="margin-top: 4px; font-size: 10px; color: #64748b;">Civic complaints within this radius receive elevated priority scores</div>
        </div>
      `, { maxWidth: 240 });

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
        <div className="flex items-center gap-1.5 font-bold text-rose-700">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white shadow-sm shadow-rose-400" />
          🏥 Hospital Zone
        </div>
        <div className="flex items-center gap-1.5 font-bold text-violet-700">
          <span className="w-2 h-2 rounded-sm bg-violet-500 border border-white" />
          🏫 School Zone
        </div>
      </div>
    </div>
  );
};

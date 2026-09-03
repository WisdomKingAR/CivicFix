// frontend/src/components/InteractiveMap.tsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoJsonFeatureCollection, ComplaintCluster, SensitiveLocation } from '../types';

interface InteractiveMapProps {
  geoJsonData?: GeoJsonFeatureCollection | null;
  clusters?: ComplaintCluster[];
  sensitiveLocations?: SensitiveLocation[];
  onSelectComplaint?: (id: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  geoJsonData,
  clusters = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const defaultSensitiveLocations: SensitiveLocation[] = [
    { id: '1', name: 'St. John’s Hospital', type: 'HOSPITAL', lat: 12.9344, lng: 77.6101 },
    { id: '2', name: 'National Public School', type: 'SCHOOL', lat: 12.9783, lng: 77.6408 },
    { id: '3', name: 'Manipal Hospital Indiranagar', type: 'HOSPITAL', lat: 12.9585, lng: 77.6482 },
  ];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    defaultSensitiveLocations.forEach((loc) => {
      const color = loc.type === 'HOSPITAL' ? '#F43F5E' : '#A855F7';
      const circle = L.circle([loc.lat, loc.lng], {
        radius: 500,
        color,
        fillColor: color,
        fillOpacity: 0.08,
        weight: 1,
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
        <div style="font-size: 13px; font-weight: 600; padding: 4px;">
          <div style="color: ${color}; font-size: 11px; text-transform: uppercase; font-weight: 700;">
            🏥 ${loc.type} (500m Sensitive Zone)
          </div>
          <div style="margin-top: 2px; color: white;">${loc.name}</div>
        </div>
      `);

      layerGroup.addLayer(circle);
      layerGroup.addLayer(marker);
    });

    if (geoJsonData && geoJsonData.features) {
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
          <div style="width: 240px; font-family: sans-serif;">
            <div style="position: relative; height: 120px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #1E293B;">
              <img src="${props.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Complaint" />
              <div style="position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.7); padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; color: ${statusColor}; border: 1px solid ${statusColor};">
                ${props.status}
              </div>
            </div>
            <div style="font-weight: 700; font-size: 14px; color: white; margin-bottom: 4px;">
              ${props.category.replace('_', ' ')}
            </div>
            <p style="font-size: 12px; color: #94A3B8; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${props.description}
            </p>
            ${
              props.priorityScore
                ? `<div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; font-weight: 600;">
                    <span style="color: #CBD5E1;">Priority Score</span>
                    <span style="color: ${statusColor}; font-weight: 800;">${Math.round(props.priorityScore)}/100</span>
                   </div>`
                : ''
            }
          </div>
        `;

        marker.bindPopup(popupContent);
        layerGroup.addLayer(marker);
      });
    }

    if (geoJsonData?.features && geoJsonData.features.length > 0) {
      const coords = geoJsonData.features.map((f) => [
        f.geometry.coordinates[1],
        f.geometry.coordinates[0],
      ] as [number, number]);
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [geoJsonData, clusters]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 z-[1000] glass-panel px-3 py-2 text-xs flex flex-wrap gap-3 items-center border border-white/10">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />
          High Priority (&gt;70)
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
          Medium
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
          Resolved
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-purple-400">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-white" />
          500m Hospital/School Zone
        </div>
      </div>
    </div>
  );
};

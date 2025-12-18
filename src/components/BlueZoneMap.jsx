import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const blueZones = [
  { name: 'Sardinia, Italy', position: [40.1209, 9.0129], type: 'Mediterranean Diet' },
  { name: 'Okinawa, Japan', position: [26.3344, 127.8056], type: 'Plant-Based Living' },
  { name: 'Loma Linda, USA', position: [34.0489, -117.2615], type: 'Faith & Community' },
  { name: 'Nicoya, Costa Rica', position: [10.1484, -85.4286], type: 'Natural Movement' },
  { name: 'Ikaria, Greece', position: [37.5997, 26.1435], type: 'Stress Reduction' }
];

export default function BlueZoneMap() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(null);

  const generateInsights = async (zone) => {
    if (insights[zone.name]) {
      setSelectedZone(zone);
      return;
    }

    setLoading(zone.name);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate biological insights about the Blue Zone: ${zone.name}. Focus on ${zone.type}.

Provide:
1. keyFactors: Array of 3 key longevity factors unique to this region
2. lifeExpectancy: Average lifespan (number)
3. uniquePractice: One unique cultural practice (string, 30-40 words)

Return as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            keyFactors: { type: "array", items: { type: "string" } },
            lifeExpectancy: { type: "number" },
            uniquePractice: { type: "string" }
          }
        }
      });

      setInsights(prev => ({ ...prev, [zone.name]: result }));
      setSelectedZone(zone);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[400px] rounded-sm overflow-hidden border border-white/10">
        <MapContainer
          center={[25, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%', background: '#0a1410' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />
          {blueZones.map((zone, i) => (
            <Marker
              key={i}
              position={zone.position}
              eventHandlers={{
                click: () => generateInsights(zone)
              }}
            >
              <Popup>
                <div className="font-mono text-xs">
                  <div className="font-bold text-sm mb-1">{zone.name}</div>
                  <div className="text-stone-500">{zone.type}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {selectedZone && (
        <div className="glass-panel p-6 rounded-sm">
          {loading === selectedZone.name ? (
            <div className="flex items-center justify-center py-8">
              <Sparkles className="w-6 h-6 text-copper-400 animate-pulse" />
              <span className="font-mono text-xs text-stone-400 ml-3">Analyzing terrain...</span>
            </div>
          ) : insights[selectedZone.name] ? (
            <div>
              <h3 className="font-serif text-xl text-stone-100 mb-4">{selectedZone.name}</h3>
              
              <div className="mb-4">
                <span className="font-mono text-xs text-bronze-400 uppercase tracking-widest">Average Lifespan</span>
                <div className="font-serif text-3xl text-copper-400 mt-1">
                  {insights[selectedZone.name].lifeExpectancy} years
                </div>
              </div>

              <div className="mb-4">
                <span className="font-mono text-xs text-bronze-400 uppercase tracking-widest block mb-2">Key Longevity Factors</span>
                <div className="space-y-2">
                  {insights[selectedZone.name].keyFactors.map((factor, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-copper-400 text-sm">→</span>
                      <span className="font-mono text-xs text-stone-300">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <span className="font-mono text-xs text-bronze-400 uppercase tracking-widest block mb-2">Unique Practice</span>
                <p className="font-mono text-xs text-stone-300 leading-relaxed">
                  {insights[selectedZone.name].uniquePractice}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
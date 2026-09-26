import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Landmark, MapPin, Phone, Clock, ShieldCheck, Navigation, ExternalLink, Search } from 'lucide-react';

// Source: Google Maps Platform Code Assist
// Source attribution as mandated by Google Maps Platform Code Assist skill rules

export interface BranchLocation {
  id: string;
  name: string;
  type: 'Private Wealth Enclave' | 'Regional HQ & Vault' | 'Sovereign Depository' | '24/7 ATM Enclave';
  address: string;
  city: string;
  stateCountry: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  routingAbas: string;
  vaultAccess: boolean;
}

export const NORTHERN_TRUST_LOCATIONS: BranchLocation[] = [
  {
    id: 'loc-chicago-hq',
    name: 'Northern Trust Global Headquarters',
    type: 'Regional HQ & Vault',
    address: '50 South La Salle Street',
    city: 'Chicago',
    stateCountry: 'IL 60603, USA',
    lat: 41.8804,
    lng: -87.6322,
    phone: '+1 (312) 630-6000',
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM CST',
    routingAbas: '021000089',
    vaultAccess: true
  },
  {
    id: 'loc-los-angeles',
    name: 'Los Angeles Private Wealth Enclave',
    type: 'Private Wealth Enclave',
    address: '2620 Los Feliz Blvd',
    city: 'Los Angeles',
    stateCountry: 'CA 90039, USA',
    lat: 34.1189,
    lng: -118.2618,
    phone: '+1 (213) 244-3800',
    hours: 'Mon-Fri: 8:30 AM - 5:00 PM PST',
    routingAbas: '021000089',
    vaultAccess: true
  },
  {
    id: 'loc-new-york',
    name: 'New York Wall Street Advisory Office',
    type: 'Private Wealth Enclave',
    address: '100 Wall Street, 19th Floor',
    city: 'New York',
    stateCountry: 'NY 10005, USA',
    lat: 40.7062,
    lng: -74.0076,
    phone: '+1 (212) 558-8800',
    hours: 'Mon-Fri: 8:00 AM - 6:00 PM EST',
    routingAbas: '021000089',
    vaultAccess: true
  },
  {
    id: 'loc-london',
    name: 'London International Depository & Custody',
    type: 'Sovereign Depository',
    address: '50 Bank Street, Canary Wharf',
    city: 'London',
    stateCountry: 'E14 5NT, United Kingdom',
    lat: 51.5033,
    lng: -0.0195,
    phone: '+44 20 7982 2000',
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM GMT',
    routingAbas: 'NTCOGB2L',
    vaultAccess: true
  },
  {
    id: 'loc-zurich',
    name: 'Zurich Private Banking Enclave',
    type: 'Sovereign Depository',
    address: 'Gotthardstrasse 26',
    city: 'Zurich',
    stateCountry: '8002 Zurich, Switzerland',
    lat: 47.3653,
    lng: 8.5367,
    phone: '+41 44 287 9000',
    hours: 'Mon-Fri: 8:30 AM - 5:00 PM CET',
    routingAbas: 'NTCOCHZZ',
    vaultAccess: true
  },
  {
    id: 'loc-singapore',
    name: 'Singapore Asia-Pacific Clearing Enclave',
    type: 'Private Wealth Enclave',
    address: '1 Wallich Street, #28-01 Guoco Tower',
    city: 'Singapore',
    stateCountry: '078881, Singapore',
    lat: 1.2764,
    lng: 103.8447,
    phone: '+65 6832 2000',
    hours: 'Mon-Fri: 9:00 AM - 5:30 PM SGT',
    routingAbas: 'NTCOSGSG',
    vaultAccess: true
  }
];

export const NorthernTrustBranchLocator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || 'AIzaSyAYEL0cQzcJb6rFF85upxIWGnBWPPEMcWs';

  const [selectedLocation, setSelectedLocation] = useState<BranchLocation | null>(NORTHERN_TRUST_LOCATIONS[0]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 39.8283, lng: -98.5795 });
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLocations = NORTHERN_TRUST_LOCATIONS.filter(
    loc =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.stateCountry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (loc: BranchLocation) => {
    setSelectedLocation(loc);
    setMapCenter({ lat: loc.lat, lng: loc.lng });
  };

  return (
    <div className={`bg-white rounded-2xl border-2 border-[#D8DEE8] shadow-sm p-4 sm:p-6 space-y-4 text-[#20242A] ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8DEE8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#147A52]/10 text-[#147A52] font-mono font-bold text-[10px] border border-[#147A52]/20">
              GLOBAL PRIVATE WEALTH LOCATOR
            </span>
            <span className="text-xs font-mono text-[#5F6670]">Google Maps Platform Active</span>
          </div>
          <h3 className="text-lg font-bold font-serif text-[#0B1F6A] flex items-center gap-2 mt-0.5">
            <Landmark className="w-5 h-5 text-[#0B1F6A]" />
            <span>Northern Trust Enclaves &amp; Depository Vaults</span>
          </h3>
          <p className="text-xs text-[#5F6670] mt-0.5">
            Locate high-security private wealth enclaves, regional vaults, and international clearing nodes.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-[#5F6670] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search city or branch name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-[#D8DEE8] rounded-xl text-xs bg-[#F5F7FA] focus:bg-white focus:border-[#0B1F6A] focus:outline-none"
          />
        </div>
      </div>

      {/* Grid Layout: Location List + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 Cols): Interactive Location List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => handleSelectLocation(loc)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-[#F0F4FA] border-[#0B1F6A] shadow-xs'
                    : 'bg-[#F5F7FA] border-[#D8DEE8] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0B1F6A] flex items-center gap-1.5">
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#147A52]' : 'text-[#0B1F6A]'}`} />
                    {loc.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-white rounded border border-[#D8DEE8] text-[#5F6670]">
                    {loc.city}
                  </span>
                </div>

                <p className="text-[11px] text-[#5F6670]">{loc.address}, {loc.stateCountry}</p>

                <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[10.5px]">
                  <span className="text-[#5F6670] flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-[#147A52]" /> {loc.phone}
                  </span>
                  {loc.vaultAccess && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                      <ShieldCheck className="w-3 h-3" /> Vault Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (7 Cols): Google Map View */}
        <div className="lg:col-span-7 h-[420px] rounded-xl overflow-hidden border border-[#D8DEE8] relative">
          <APIProvider apiKey={apiKey} libraries={['marker']}>
            <Map
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              center={mapCenter}
              zoom={selectedLocation ? 13 : 3}
              className="w-full h-full"
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              {NORTHERN_TRUST_LOCATIONS.map((loc) => (
                <AdvancedMarker
                  key={loc.id}
                  position={{ lat: loc.lat, lng: loc.lng }}
                  onClick={() => setSelectedLocation(loc)}
                  title={loc.name}
                >
                  <div className={`p-2 rounded-full border-2 shadow-md transition-transform ${
                    selectedLocation?.id === loc.id
                      ? 'bg-[#147A52] text-white border-white scale-125'
                      : 'bg-[#0B1F6A] text-white border-white hover:scale-110'
                  }`}>
                    <Landmark className="w-4 h-4" />
                  </div>
                </AdvancedMarker>
              ))}

              {selectedLocation && (
                <InfoWindow
                  position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  onCloseClick={() => setSelectedLocation(null)}
                >
                  <div className="p-1 space-y-1 text-xs max-w-[220px]">
                    <div className="font-bold text-[#0B1F6A] text-xs">{selectedLocation.name}</div>
                    <div className="text-[11px] text-[#5F6670]">{selectedLocation.address}, {selectedLocation.city}</div>
                    <div className="text-[10px] text-[#147A52] font-semibold flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3" /> {selectedLocation.hours}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        </div>
      </div>
    </div>
  );
};

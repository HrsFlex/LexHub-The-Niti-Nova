import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import { BarChart3, Map, Filter, ArrowUpRight, TrendingUp, Calendar, Clock, FileText } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// GeoJSON data for India's states with real coordinates
const indiaGeoData = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "NAME_1": "Andhra Pradesh" }, "geometry": { "type": "Polygon", "coordinates": [[[78.0, 13.0], [78.5, 13.5], [79.0, 14.0], [79.5, 13.5], [78.5, 13.0], [78.0, 13.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Arunachal Pradesh" }, "geometry": { "type": "Polygon", "coordinates": [[[93.5, 27.5], [94.5, 27.7], [95.0, 28.2], [94.0, 28.5], [93.5, 27.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Assam" }, "geometry": { "type": "Polygon", "coordinates": [[[91.0, 26.0], [92.0, 26.5], [92.5, 26.7], [91.5, 26.2], [91.0, 26.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Bihar" }, "geometry": { "type": "Polygon", "coordinates": [[[85.5, 25.5], [86.5, 26.0], [87.0, 25.5], [86.5, 25.0], [85.5, 25.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Chhattisgarh" }, "geometry": { "type": "Polygon", "coordinates": [[[81.5, 21.5], [82.5, 22.0], [83.0, 21.5], [82.5, 21.0], [81.5, 21.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Goa" }, "geometry": { "type": "Polygon", "coordinates": [[[73.8, 15.5], [74.2, 15.7], [74.5, 15.5], [74.3, 15.3], [73.8, 15.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Gujarat" }, "geometry": { "type": "Polygon", "coordinates": [[[69.5, 22.5], [70.5, 23.5], [71.0, 23.9], [72.0, 23.5], [72.5, 22.8], [71.5, 22.2], [69.5, 22.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Haryana" }, "geometry": { "type": "Polygon", "coordinates": [[[75.5, 28.0], [76.0, 28.5], [76.5, 28.2], [76.0, 27.8], [75.5, 28.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Himachal Pradesh" }, "geometry": { "type": "Polygon", "coordinates": [[[76.0, 32.0], [77.0, 32.5], [77.5, 32.0], [77.0, 31.5], [76.0, 32.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Jharkhand" }, "geometry": { "type": "Polygon", "coordinates": [[[85.5, 23.5], [86.5, 24.0], [87.0, 23.5], [86.5, 23.0], [85.5, 23.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Karnataka" }, "geometry": { "type": "Polygon", "coordinates": [[[74.0, 14.0], [75.0, 14.5], [76.5, 15.0], [77.5, 14.9], [77.8, 14.5], [77.0, 13.8], [75.5, 13.6], [74.0, 14.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Kerala" }, "geometry": { "type": "Polygon", "coordinates": [[[76.0, 10.0], [77.0, 10.5], [77.5, 10.8], [76.5, 10.2], [76.0, 10.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Madhya Pradesh" }, "geometry": { "type": "Polygon", "coordinates": [[[76.0, 22.5], [77.0, 23.0], [77.5, 23.5], [77.0, 23.8], [76.0, 23.5], [75.5, 22.8], [76.0, 22.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Maharashtra" }, "geometry": { "type": "Polygon", "coordinates": [[[72.6, 19.0], [73.0, 19.5], [73.5, 19.7], [74.0, 20.0], [74.5, 19.9], [74.8, 19.5], [74.0, 19.0], [73.5, 18.8], [73.0, 18.5], [72.6, 19.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Manipur" }, "geometry": { "type": "Polygon", "coordinates": [[[93.0, 24.5], [94.0, 25.0], [94.5, 25.5], [94.0, 25.7], [93.5, 25.3], [93.0, 24.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Meghalaya" }, "geometry": { "type": "Polygon", "coordinates": [[[91.5, 25.5], [92.5, 26.0], [93.0, 26.5], [92.5, 26.7], [91.5, 26.2], [91.0, 25.8], [91.5, 25.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Mizoram" }, "geometry": { "type": "Polygon", "coordinates": [[[92.5, 23.0], [93.5, 23.5], [94.0, 24.0], [93.5, 24.5], [92.5, 23.8], [92.0, 23.5], [92.5, 23.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Nagaland" }, "geometry": { "type": "Polygon", "coordinates": [[[94.5, 26.0], [95.5, 26.5], [96.0, 27.0], [95.5, 27.2], [94.5, 27.0], [94.0, 26.5], [94.5, 26.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Odisha" }, "geometry": { "type": "Polygon", "coordinates": [[[85.5, 19.5], [86.5, 20.0], [87.0, 19.8], [86.5, 19.3], [85.5, 19.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Punjab" }, "geometry": { "type": "Polygon", "coordinates": [[[74.0, 30.0], [75.0, 30.5], [75.5, 30.8], [75.0, 30.2], [74.5, 30.0], [74.0, 30.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Rajasthan" }, "geometry": { "type": "Polygon", "coordinates": [[[73.5, 27.0], [74.5, 27.5], [75.0, 27.8], [74.5, 28.0], [73.5, 27.5], [73.0, 27.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Sikkim" }, "geometry": { "type": "Polygon", "coordinates": [[[88.5, 27.0], [89.0, 27.5], [89.5, 28.0], [89.0, 28.2], [88.5, 28.0], [88.0, 27.5], [88.5, 27.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Tamil Nadu" }, "geometry": { "type": "Polygon", "coordinates": [[[78.0, 11.5], [79.0, 12.0], [80.0, 11.8], [80.5, 11.5], [80.0, 11.0], [79.0, 10.8], [78.0, 11.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Telangana" }, "geometry": { "type": "Polygon", "coordinates": [[[78.0, 17.0], [78.5, 17.5], [79.0, 17.5], [79.0, 17.0], [78.0, 17.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Tripura" }, "geometry": { "type": "Polygon", "coordinates": [[[91.0, 23.5], [91.5, 23.8], [92.0, 24.0], [91.5, 24.3], [91.0, 23.8], [90.5, 23.6], [91.0, 23.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Uttar Pradesh" }, "geometry": { "type": "Polygon", "coordinates": [[[77.0, 27.5], [78.0, 28.0], [78.5, 28.2], [78.0, 28.5], [77.5, 28.0], [77.0, 27.5]]] } },
    { "type": "Feature", "properties": { "NAME_1": "Uttarakhand" }, "geometry": { "type": "Polygon", "coordinates": [[[78.5, 30.0], [79.0, 30.5], [79.5, 30.8], [79.0, 30.2], [78.5, 30.0]]] } },
    { "type": "Feature", "properties": { "NAME_1": "West Bengal" }, "geometry": { "type": "Polygon", "coordinates": [[[88.0, 22.0], [88.5, 22.5], [89.0, 22.8], [88.5, 23.0], [88.0, 22.5], [87.5, 22.0], [88.0, 22.0]]] } }
  ]
};


// Mock data for cases by state and time, now with more detailed trends
const stateData = {
  'Maharashtra': { 
    total: 4583,
    criminal: {
      '2024': { Q1: 328, Q2: 356, Q3: 390, Q4: 409 },
      '2023': { Q1: 310, Q2: 333, Q3: 367, Q4: 387 }
    },
    civil: {
      '2024': { Q1: 215, Q2: 230, Q3: 255, Q4: 278 },
      '2023': { Q1: 198, Q2: 220, Q3: 238, Q4: 261 }
    }
  },
  'Delhi': {
    total: 3150,
    criminal: {
      '2024': { Q1: 250, Q2: 270, Q3: 290, Q4: 312 },
      '2023': { Q1: 230, Q2: 255, Q3: 275, Q4: 295 }
    },
    civil: {
      '2024': { Q1: 180, Q2: 195, Q3: 210, Q4: 230 },
      '2023': { Q1: 165, Q2: 185, Q3: 205, Q4: 225 }
    }
  },
  'Karnataka': {
    total: 3271,
    criminal: {
      '2024': { Q1: 198, Q2: 215, Q3: 238, Q4: 263 },
      '2023': { Q1: 180, Q2: 195, Q3: 220, Q4: 250 }
    },
    civil: {
      '2024': { Q1: 150, Q2: 170, Q3: 190, Q4: 210 },
      '2023': { Q1: 130, Q2: 155, Q3: 175, Q4: 200 }
    }
  },
  'Tamil Nadu': {
    total: 4012,
    criminal: {
      '2024': { Q1: 276, Q2: 295, Q3: 320, Q4: 340 },
      '2023': { Q1: 245, Q2: 270, Q3: 300, Q4: 330 }
    },
    civil: {
      '2024': { Q1: 175, Q2: 190, Q3: 210, Q4: 230 },
      '2023': { Q1: 160, Q2: 180, Q3: 205, Q4: 225 }
    }
  },
  'Gujarat': {
    total: 2684,
    criminal: {
      '2024': { Q1: 188, Q2: 205, Q3: 220, Q4: 235 },
      '2023': { Q1: 170, Q2: 185, Q3: 205, Q4: 225 }
    },
    civil: {
      '2024': { Q1: 125, Q2: 145, Q3: 160, Q4: 175 },
      '2023': { Q1: 115, Q2: 130, Q3: 145, Q4: 160 }
    }
  }
};


export default function CaseAnalytics() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedType, setSelectedType] = useState<'all' | 'criminal' | 'civil'>('all');

  const getStateStyle = (feature: any) => {
    const stateName = feature.properties.NAME_1;
    const isSelected = selectedState === stateName;
    return {
      fillColor: isSelected ? '#DC2626' : '#FCA5A5', // Changed to red colors
      weight: 2,
      opacity: 1,
      color: 'white',
      fillOpacity: isSelected ? 0.7 : 0.5
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const stateName = feature.properties.NAME_1;
    layer.on({
      mouseover: () => {
        layer.setStyle({
          fillOpacity: 0.7
        });
      },
      mouseout: () => {
        layer.setStyle({
          fillOpacity: selectedState === stateName ? 0.7 : 0.5
        });
      },
      click: () => {
        setSelectedState(stateName);
      }
    });
    
    layer.bindTooltip(`
      <div class="font-semibold">${stateName}</div>
      <div>Total Cases: ${stateData[stateName]?.total || 0}</div>
    `, {
      permanent: false,
      direction: 'top'
    });
  };

  const getQuarterlyData = (state: string, year: string, type: 'all' | 'criminal' | 'civil') => {
    const data = stateData[state];
    if (!data) return [];

    if (type === 'all') {
      return ['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => ({
        quarter,
        value: (data.criminal[year][quarter] || 0) + (data.civil[year][quarter] || 0)
      }));
    }

    return ['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => ({
      quarter,
      value: data[type][year][quarter] || 0
    }));
  };

  const getTotalsByType = (state: string) => {
    const data = stateData[state];
    if (!data) return { criminal: 0, civil: 0 };

    const criminal = Object.values(data.criminal[selectedYear]).reduce((a, b) => a + b, 0);
    const civil = Object.values(data.civil[selectedYear]).reduce((a, b) => a + b, 0);

    return { criminal, civil };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Case Analytics</h1>
        <p className="text-gray-600 mt-2">Analyze case trends and patterns across jurisdictions</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Map Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Map className="w-5 h-5 text-red-600" />
                Geographic Distribution
              </h2>
            </div>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={4}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <GeoJSON
                  data={indiaGeoData}
                  style={getStateStyle}
                  onEachFeature={onEachFeature}
                />
              </MapContainer>
            </div>
          </div>

          {/* Quarterly Trends */}
          {selectedState && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-red-600" />
                  Quarterly Trends for {selectedState}
                </h2>
                <div className="flex gap-4">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Cases</option>
                    <option value="criminal">Criminal</option>
                    <option value="civil">Civil</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {getQuarterlyData(selectedState, selectedYear, selectedType).map(({ quarter, value }) => (
                  <div key={quarter} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">{quarter}</div>
                    <div className="text-2xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-red-600" />
              Filters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={selectedState || ''}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a state</option>
                  {Object.keys(stateData).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Selected State Stats */}
          {selectedState && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                {selectedState} Statistics
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-red-600 mb-1">Criminal Cases</div>
                    <div className="text-2xl font-semibold text-red-700">
                      {getTotalsByType(selectedState).criminal}
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-red-600 mb-1">Civil Cases</div>
                    <div className="text-2xl font-semibold text-red-700">
                      {getTotalsByType(selectedState).civil}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Cases</div>
                  <div className="text-2xl font-semibold">
                    {stateData[selectedState].total}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
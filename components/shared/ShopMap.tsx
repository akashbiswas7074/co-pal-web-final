"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IShop } from "@/lib/database/models/shop.model";
import { Phone, Navigation } from "lucide-react";

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapUpdaterProps {
  center: [number, number];
  zoom: number;
}

function MapUpdater({ center, zoom }: MapUpdaterProps) {
  const map = useMap();
  
  useEffect(() => {
    // Standard view update
    map.setView(center, zoom, { animate: true, duration: 1.5 });
    
    // CRITICAL: Invalidate size after a tiny delay.
    // This fixes the "grey map" issue when the map container's display 
    // changes from 'none' to 'flex/block' on mobile.
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  
  return null;
}

interface ShopMapProps {
  shops: IShop[];
  focusedShop?: IShop | null;
}

export default function ShopMap({ shops, focusedShop }: ShopMapProps) {
  const defaultCenter: [number, number] = [20.5937, 78.9629]; // India Center
  const defaultZoom = 5;

  const currentCenter: [number, number] = focusedShop 
    ? [focusedShop.latitude, focusedShop.longitude] 
    : defaultCenter;
  
  const currentZoom = focusedShop ? 15 : defaultZoom;

  return (
    <div className="w-full h-full min-h-[400px] md:min-h-0 bg-gray-100">
      <MapContainer 
        center={currentCenter} 
        zoom={currentZoom} 
        style={{ height: "100%", width: "100%", minHeight: "500px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {shops.map((shop) => (
          <Marker 
            key={(shop._id as string)} 
            position={[shop.latitude, shop.longitude]}
          >
            <Popup className="shop-popup">
              <div className="p-1 max-w-[200px]">
                <h3 className="font-bold text-sm mb-1">{shop.name}</h3>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">{shop.address}</p>
                <div className="flex flex-col gap-2 mt-2">
                  <a 
                    href={`tel:${shop.phoneNumber}`} 
                    className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Phone size={12} />
                    {shop.phoneNumber}
                  </a>
                  {shop.googleMapLink && (
                    <a 
                      href={shop.googleMapLink} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-2 text-xs font-bold text-white bg-green-600 px-2 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Navigation size={12} />
                      Navigate Now
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapUpdater center={currentCenter} zoom={currentZoom} />
      </MapContainer>
    </div>
  );
}

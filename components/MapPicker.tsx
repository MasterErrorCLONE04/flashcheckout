'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icons in Next.js/Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapPickerProps {
  onLocationSelectAction: (lat: number, lng: number, address?: string, city?: string) => void
  initialLat?: number
  initialLng?: number
}

async function reverseGeocode(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'es' } }
    )
    const data = await response.json()
    const addr = data.address || {}
    const road = addr.road || addr.pedestrian || addr.suburb || ''
    const body = addr.house_number ? ` ${addr.house_number}` : ''
    const fullAddress = `${road}${body}`.trim()
    const city = addr.city || addr.town || addr.village || addr.municipality || ''
    
    return { address: fullAddress, city }
  } catch (error) {
    console.error('Geocoding error:', error)
    return { address: '', city: '' }
  }
}

function LocationMarker({ onLocationSelectAction, initialLat, initialLng }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  )

  const map = useMapEvents({
    async click(e) {
      setPosition(e.latlng)
      const { address, city } = await reverseGeocode(e.latlng.lat, e.latlng.lng)
      onLocationSelectAction(e.latlng.lat, e.latlng.lng, address, city)
      map.flyTo(e.latlng, map.getZoom())
    },
    async locationfound(e) {
      setPosition(e.latlng)
      const { address, city } = await reverseGeocode(e.latlng.lat, e.latlng.lng)
      onLocationSelectAction(e.latlng.lat, e.latlng.lng, address, city)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  useEffect(() => {
    if (!position && !initialLat) {
      map.locate()
    }
  }, [map, position, initialLat])

  return position === null ? null : (
    <Marker position={position} />
  )
}

export default function MapPicker({ onLocationSelectAction, initialLat, initialLng }: MapPickerProps) {
  return (
    <div className="h-[250px] w-full rounded-xl overflow-hidden border border-border mt-2 z-0">
      <MapContainer
        center={[initialLat || 4.5709, initialLng || -74.2973]} // Default to Colombia
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelectAction={onLocationSelectAction} initialLat={initialLat} initialLng={initialLng} />
      </MapContainer>
      <div className="bg-secondary/80 px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center border-t border-border">
        Toca el mapa para marcar tu ubicación exacta
      </div>
    </div>
  )
}

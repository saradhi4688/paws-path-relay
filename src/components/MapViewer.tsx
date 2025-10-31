import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Donation {
  id: string;
  food_type: string;
  quantity: string;
  latitude: number;
  longitude: number;
}

interface MapViewerProps {
  donations: Donation[];
  onDonationClick?: (donation: Donation) => void;
}

export function MapViewer({ donations, onDonationClick }: MapViewerProps) {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={11} style={{ height: "100%", width: "100%" }}>
      <>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
        {donations.map((donation) => (
          <Marker key={donation.id} position={[parseFloat(String(donation.latitude)), parseFloat(String(donation.longitude))]}>
            <Popup>
              <div className="p-2 space-y-2">
                <h3 className="font-semibold">{donation.food_type}</h3>
                <p className="text-sm">{donation.quantity}</p>
                {onDonationClick && (
                  <Button size="sm" onClick={() => onDonationClick(donation)} variant="default">
                    View Details
                  </Button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </>
    </MapContainer>
  );
}

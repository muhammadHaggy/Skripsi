import React, { useState, useEffect } from "react";
import { LoadScript, GoogleMap, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { Modal } from "../../components/Modal"; 
import axiosAuthInstance from '../../utils/axios-auth-instance';

function DetailPengiriman({ pengiriman, updatePengirimanList }) {
  const [modalKonfirmasi, setModalKonfirmasi] = useState(false);
  const [directions, setDirections] = useState(null);
  const [directionsRequested, setDirectionsRequested] = useState(false)

  useEffect(() => {
    setDirections(null);              // reset rute
    setDirectionsRequested(false);   // izinkan request rute baru
  }, [pengiriman]);

  const directionsCallback = (response) => {
    if (response !== null && response.status === 'OK') {
      setDirections(response);
      setDirectionsRequested(true);
    } else {
      console.error('Gagal mendapatkan rute:', response);
    }
  };

  if (!pengiriman) {
    return (
      <div className="w-2/3 bg-white rounded-lg p-6">
        <p className="text-gray-500">Pilih pengiriman untuk melihat detail.</p>
      </div>
    );
  }

  const convertMinutesToHoursAndMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return hours > 0 ? `${hours} Jam ${remainingMinutes} Menit` : `${remainingMinutes} Menit`;
  };

  const handleSimpanPengiriman = async () => {
    try {
      await axiosAuthInstance.patch(`/shipment/simpan/${pengiriman.shipment_num}`, {
        action: 'Simpan'
      });
      updatePengirimanList(pengiriman.shipment_num, 'saved');
      setModalKonfirmasi(false);
    } catch (error) {
      console.error('Gagal menyimpan pengiriman:', error);
      alert('Terjadi kesalahan saat menyimpan pengiriman.');
    }
  };


  const deliveryOrders = pengiriman.delivery_orders.map(order => ({
    location: order.loc_dest.customer.name,
    address: order.loc_dest.address,
    startTime: "08:00 WIB",
    endTime: "17:00 WIB",
    distance: `${order.loc_ori.dist_to_origin} Km`,
    arrivalTime: order.eta || 'N/A',
    departureTime: order.etd || 'N/A'
  }));

  const locationRoutes = pengiriman.location_routes || [];
  const dos = pengiriman.delivery_orders || [];
  const additionalInfo = pengiriman.additional_info || [];
  const updatedLocationRoutes = locationRoutes.map(route => {
    const matchingDOs = dos.filter(doItem => doItem.loc_dest_id === route.id);

    const loc_do = matchingDOs.map(doItem => doItem.delivery_order_num);
      const boxCounts = matchingDOs.reduce((total, doItem) => {
      return total + (doItem.boxes?.length || 0);
    }, 0);

    return {
      ...route,
      loc_do: loc_do.length > 0 ? loc_do : [],
      box_count: boxCounts,
  };
});


  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  };

  const center = locationRoutes.length > 0
  ? { lat: locationRoutes[0].latitude, lng: locationRoutes[0].longitude }
  : { lat: 0, lng: 0 };

  return (
    <div className="w-2/3 space-y-4">
      <div className="bg-neutral-10 rounded-b-md p-6">
        <h2 className="text-lg font-medium mb-4">Peta Rute</h2>
        <div className="h-[400px] bg-gray-100 rounded-lg mb-4">
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
        <GoogleMap
            key={pengiriman.shipment_num} // force remount saat shipment berubah
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={15}
          >
            {locationRoutes.length > 1 && !directionsRequested && (
              <DirectionsService
                options={{
                  destination: {
                    lat: locationRoutes[locationRoutes.length - 1].latitude,
                    lng: locationRoutes[locationRoutes.length - 1].longitude,
                  },
                  origin: {
                    lat: locationRoutes[0].latitude,
                    lng: locationRoutes[0].longitude,
                  },
                  waypoints: locationRoutes.slice(1, -1).map(route => ({
                    location: { lat: route.latitude, lng: route.longitude },
                    stopover: true,
                  })),
                  travelMode: 'DRIVING',
                }}
                callback={directionsCallback}
              />
            )}

            {directions && (
              <DirectionsRenderer
                options={{
                  directions: directions,
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
        </div>

        <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium mb-3">Informasi Pengiriman</h3>
            <div className="border border-primary-border rounded-lg p-4 grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600">Nomor Pengiriman</p>
                <p className="text-sm">{pengiriman.shipment_num}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">ETA</p>
                <p className="text-sm">{pengiriman.delivery_orders.at(-1).eta || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Jarak Tempuh</p>
                <p className="text-sm">{Math.round(pengiriman.total_dist / 1000)} Km</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Waktu Tempuh</p>
                <p className="text-sm">{convertMinutesToHoursAndMinutes(pengiriman.total_time)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Volume Muatan</p>
                <p className="text-sm">
                {`${pengiriman.current_capacity.toLocaleString('id-ID')} m³`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Biaya</p>
                <p className="text-sm">
                {`Rp${pengiriman.shipment_cost.toLocaleString('id-ID')},00`}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Informasi Truk</h3>
            <div className="border border-primary-border rounded-lg p-4 grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600">Nomor Plat</p>
                <p className="text-sm">{pengiriman.truck.plate_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Distribution Center</p>
                <p className="text-sm">{pengiriman.truck.dc.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Tipe Truk</p>
                <p className="text-sm">{pengiriman.truck.truck_type.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Volume Maksimal</p>
                <p className="text-sm">{`${pengiriman.truck.max_individual_capacity_volume.toLocaleString('id-ID')} m³`}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Daftar Delivery Order</h3>
            <div className="space-y-4">
              {updatedLocationRoutes.map((route, index) => (
                <div key={index} className="flex items-start gap-4 relative">
                  <div className="min-w-[24px] relative">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white relative z-10">
                      {index + 1}
                    </div>
                    {index < locationRoutes.length - 1 && (
                      <div 
                        className="absolute left-1/2 w-0.5 bg-neutral-200" 
                        style={{
                          height: '200px',
                          transform: 'translateX(-50%)',
                          top: '20px'
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                    <div className="justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{route.customer.name}</h4>
                        <div className="mb-1">
                          <h7 className="font-medium">{route.loc_do.join(", ")}</h7>
                          <div className="text-sm text-gray-600">Jumlah Box: {route.box_count} Box</div>
                        </div>
                        <div className="text-sm mb-1">
                          <span className="font-normal text-primary">{route.open_hour} - {route.close_hour}</span>
                        </div>
                        <p className="text-sm text-gray-600">{route.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-right">
                        <div className="text-xs text-neutral-50">Jarak Tempuh</div>
                        <div className="font-medium text-primary">{Math.round(additionalInfo[index]?.travel_distance / 1000)} Km</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-xs text-neutral-50">Waktu Tempuh</div>
                        <div className="font-medium text-primary">{convertMinutesToHoursAndMinutes(additionalInfo[index]?.travel_time)}</div>
                      </div>
                      <div className="text-sm text-right">
                        <div className="text-xs text-neutral-50">Tiba</div>
                        <div className="font-medium text-primary">{additionalInfo[index]?.eta}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> 

          <div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="bg-primary text-white px-4 py-2 rounded-md"
                onClick={() => setModalKonfirmasi(true)} // Show modal on click
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        variant="primary"
        isOpen={modalKonfirmasi}
        closeModal={() => setModalKonfirmasi(false)}
        title="Simpan Pengiriman"
        description="Anda yakin ingin menyimpan pengiriman ini?"
        rightButtonText="Yakin"
        leftButtonText="Batal"
        onClickRight={handleSimpanPengiriman}
      />
    </div>
  );
}

export default DetailPengiriman;

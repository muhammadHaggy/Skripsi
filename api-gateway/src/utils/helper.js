import googleDistance from "google-distance-matrix";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function IdGenerator(type, data) {
  if (type === "location") {
    const count_loc = await getTotalLocation();
    return (
      "IDN-" +
      data.provinsi.toUpperCase().substring(0, 3) +
      "-" +
      String(count_loc).padStart(4, "0")
    );
  } else if (type === "manifest") {
    return "MN-" + data.toString().padStart(4, "0");
  } else if (type === "shipment") {
    return "SP-" + data.toString().padStart(4, "0");
  }
}

export const distanceOriToDest = async (
  origin_lat,
  origin_long,
  dest_lat,
  dest_long
) => {
  if (origin_lat !== undefined && origin_long !== undefined) {
    googleDistance.key(process.env.GOOGLE_MAPS_API_KEY);
    googleDistance.mode("driving");
    return await new Promise((resolve, reject) => {
      googleDistance.matrix(
        [`${origin_lat},${origin_long}`],
        [`${dest_lat}, ${dest_long}`],
        (err, distances) => {
          if (err) {
            reject(err);
          }
          if (distances.status === "OK") {
            const distanceInMeters =
              distances.rows[0].elements[0].distance.value;
            resolve(distanceInMeters);
          } else {
            reject("Unable to calculate distance");
          }
        }
      );
    });
  } else {
    console.log("ga ada originnya");
    return "ga ada originnya";
  }
};

export const getRouteDetails = async (
  origin_lat,
  origin_long,
  dest_lat,
  dest_long
) => {
  if (!origin_lat || !origin_long || !dest_lat || !dest_long) {
    console.log("Missing coordinates for origin or destination");
    return "Missing coordinates for origin or destination";
  }

  const origin = `${origin_lat},${origin_long}`;
  const destination = `${dest_lat},${dest_long}`;
  const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(directionsUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error("Response from Google Maps was not OK");
    }
    const route = data.routes[0];
    const legs = route.legs[0];
    const distance = legs.distance.value; // meter
    const duration = legs.duration.value / 60; // minute
    const overviewPolyline = decodePolyline(route.overview_polyline.points); // Encoded polyline
    return {
      distance,
      duration,
      route: overviewPolyline, // You might want to decode this polyline depending on your needs
    };
  } catch (error) {
    console.error("Failed to fetch route details:", error);
    return "Failed to fetch route details";
  }
};

function decodePolyline(encoded) {
  let points = [];
  let index = 0,
    len = encoded.length;
  let lat = 0,
    lng = 0;

  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63; // finds ascii and subtracts 63
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

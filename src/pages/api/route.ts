import type { NextApiRequest, NextApiResponse } from 'next';

const ORS_API_KEY = process.env.ORS_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { coordinates, avoidPolygons } = req.body;

  try {
    const bodyPayload: any = {
      coordinates: coordinates,
      radiuses: [3000, 3000],
    };

    if (avoidPolygons && avoidPolygons.coordinates && avoidPolygons.coordinates.length > 0) {
      bodyPayload.options = {
        avoid_polygons: avoidPolygons
      };
    }

    const orsResponse = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car/geojson`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, application/geo+json',
        'Authorization': ORS_API_KEY ? ORS_API_KEY.trim() : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload)
    });

    const data = await orsResponse.json();
    console.log('ORS Response Status:', orsResponse.status, JSON.stringify(data));

    if (!orsResponse.ok || data.error) {
      return res.status(422).json({ 
        status: 'UNREACHABLE', 
        message: data?.error?.message || 'No safe route found',
        details: data 
      });
    }

    return res.status(200).json({ status: 'SUCCESS', route: data });
  } catch (error) {
    console.error('API catch error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Routing service error' });
  }
}
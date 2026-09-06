import type { NextApiRequest, NextApiResponse } from "next";

let liveIncidents = [
  {
    id: "obs-01",
    type: "FALLEN_TREE",
    lat: 16.5110,
    lng: 80.6380,
    severity: "HIGH",
    radiusKm: 0.35,
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ success: true, incidents: liveIncidents });
  }

  if (req.method === "POST") {
    const { type, lat, lng, severity } = req.body;

    if (!type || !lat || !lng || !severity) {
      return res.status(400).json({ success: false, message: "Missing required geospatial incident fields." });
    }

    const newReport = {
      id: `incident-${Date.now()}`,
      type,
      lat: Number(lat),
      lng: Number(lng),
      severity,
      radiusKm: severity === "HIGH" ? 0.4 : 0.25,
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
    };

    liveIncidents.push(newReport);
    return res.status(201).json({ success: true, incident: newReport });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
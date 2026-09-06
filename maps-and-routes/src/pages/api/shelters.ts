import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const shelters = [
      {
        id: "shelter-01",
        name: "City Relief Camp A (Ayodhya Nagar)",
        lat: 16.5200,
        lng: 80.6200,
        address: "Main Disaster Relief Center",
        totalCapacity: 600,
        currentOccupancy: 310,
        status: "ACTIVE",
      },
      {
        id: "shelter-02",
        name: "District Hub B (Patamata)",
        lat: 16.4950,
        lng: 80.6700,
        address: "Primary Public Health School",
        totalCapacity: 1200,
        currentOccupancy: 1200,
        status: "FULL",
      },
      {
        id: "shelter-03",
        name: "Bhavani Island Safe Point",
        lat: 16.5160,
        lng: 80.5900,
        address: "North River Bank Relief Post",
        totalCapacity: 400,
        currentOccupancy: 120,
        status: "ACTIVE",
      }
    ];

    return res.status(200).json({ success: true, data: shelters });
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
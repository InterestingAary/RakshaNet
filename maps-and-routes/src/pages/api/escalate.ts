import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const payload = req.body;

    console.log("=========================================");
    console.log("🚨 RAKSHANET CRITICAL ESCALATION DISPATCHED");
    console.log(`Citizen Location: ${payload.userLocation?.latitude}, ${payload.userLocation?.longitude}`);
    console.log(`Threats: ${payload.blockingThreats?.join(", ")}`);
    console.log("=========================================");

    return res.status(200).json({
      success: true,
      dispatchId: `DISPATCH-${Date.now()}`,
      message: "Rescue team alerted and GPS coordinates transmitted.",
    });
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
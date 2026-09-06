import dynamic from "next/dynamic";

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
});

export default function Home() {
  return (
    <main style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}>
      <Map />
    </main>
  );
}
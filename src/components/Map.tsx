"use client";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";

type Point = { lat: number; lng: number };

export default function Map({ points }: { points: Point[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    setOptions({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
    });

    (async () => {
      const { Map, Polyline } = (await importLibrary("maps")) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await importLibrary("marker")) as google.maps.MarkerLibrary;

      const center = points[0] ?? { lat: -25.296, lng: -57.635 };

      const map = new Map(ref.current as HTMLDivElement, {
        center,
        zoom: 13,
      });

      if (points.length) {
        new Polyline({
          map,
          path: points,
        });

        points.forEach((p) => {
          new AdvancedMarkerElement({ map, position: p });
        });
      }
    })();
  }, [points]);

  return <div ref={ref} style={{ width: "100%", height: 500 }} />;
}

"use client";

import { useEffect } from "react";
import boundaryData from "./data/Boundary_Demo.json";
import pointData from "./data/Point_Demo.json";

export default function TestData() {
  useEffect(() => {}, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Data Test Page</h1>
      <p className="mb-2">Check the console for data output.</p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Point Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(pointData, null, 2)}
        </pre>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Boundary Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(boundaryData, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/// app.js
import React from "react";

import ImageItem from "./ImageItem";

// DeckGL react component
export default function App() {
  let sources = [
    "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0048A/9846152.zarr/",
    "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.3/9836842.zarr",
    "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.2/6001240.zarr",
    "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/4495402.zarr"
  ]

  let items = sources.map((source) => <ImageItem key={source} source={source}/>);

  return (
    <table>
      <tbody>
        <tr>
          <th>Version</th>
          <th>s3 URL</th>
          <th>sizeX</th>
          <th>sizeY</th>
          <th>sizeZ</th>
          <th>sizeC</th>
          <th>sizeT</th>
          <th>Axes</th>
        </tr>
        {items}
      </tbody>
    </table>
  );
}

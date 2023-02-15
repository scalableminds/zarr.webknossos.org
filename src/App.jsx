/// app.js
import React from "react";

import ImageItem from "./ImageItem";

// DeckGL react component
export default function App() {
  const [datasets, setDatasets] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const res = await fetch("https://webknossos.org/api/publications");
      let publications = await res.json();

      publications = publications.sort(
        (a, b) => b.publicationDate - a.publicationDate
      );

      setDatasets(
        publications.flatMap((pub) => [
          ...pub.datasets
            .filter((dataset) => dataset.isActive)
            .map((ds) => ({ ...ds, publication: pub })),
          ...pub.annotations
            .filter((annotation) => annotation.dataSet.isActive)
            .map((annotation) => ({ ...annotation.dataSet, publication: pub })),
        ])
      );
    })();
  }, []);

  let items = datasets.map((dataset, i) => (
    <ImageItem key={i} dataset={dataset} />
  ));

  return (
    <>
      <img src="/wk-logo.svg" alt="WEBKNOSSOS" style={{ maxWidth: 200 }} />
      <h1>OME-Zarr Gallery</h1>
      {datasets.length > 0 && (
        <>
          <table>
            <tbody>
              <tr>
                <th>URL</th>
                <th>Size</th>
                <th>Voxel size</th>
                <th>Publication</th>
                <th>Thumbnail</th>
              </tr>
              {items}
            </tbody>
          </table>
          <p style={{ fontSize: "0.8em" }}>
            scalable minds {new Date().getFullYear()} &bull;{" "}
            <a href="https://webknossos.org/imprint">Imprint</a> &bull;{" "}
            <a href="https://webknossos.org/privacy">Privacy</a>
          </p>
          <p style={{ fontSize: "0.8em" }}>
            OME and its associated logo are trademarks of Glencoe Software Inc.,
            which holds these marks to protect them on behalf of the OME
            community.
          </p>
        </>
      )}
    </>
  );
}

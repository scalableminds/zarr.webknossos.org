/// app.js
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

import ImageItem from "./ImageItem";

function Publication({ publication }) {
  const datasets = [
    ...publication.datasets.filter(
      (dataset) => dataset.isActive && dataset.isPublic
    ),
    ...publication.annotations
      .filter(
        (annotation) =>
          annotation.dataSet.isActive && annotation.dataSet.isPublic
      )
      .map((annotation) => annotation.dataSet),
  ];

  return (
    <div className="publication">
      <h2>{publication.title}</h2>

      <ReactMarkdown remarkPlugins={[remarkBreaks]}>
        {publication.description}
      </ReactMarkdown>

      <div className="datasets">
        {datasets.map((dataset, i) => (
          <ImageItem key={i} dataset={dataset} />
        ))}
      </div>
    </div>
  );
}

// DeckGL react component
export default function App() {
  const [publications, setPublications] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const res = await fetch("https://webknossos.org/api/publications");
      let publications = await res.json();

      publications = publications.sort(
        (a, b) => b.publicationDate - a.publicationDate
      );

      setPublications(publications);
    })();
  }, []);

  return (
    <>
      <header>
        <h1>OME-Zarr Gallery</h1>
      </header>
      <div id="banner">
        <a href="https://webknossos.org" style={{ lineHeight: 0 }}>
          <img src="/wk-logo.svg" alt="WEBKNOSSOS" />
        </a>
      </div>

      <div id="container">
        {publications.length > 0 ? (
          <>
            {publications.map((publication, i) => (
              <Publication key={i} publication={publication} />
            ))}
          </>
        ) : (
          <p>Loading…</p>
        )}
      </div>
      {publications.length > 0 && (
        <footer>
          <p style={{ fontSize: "0.8em" }}>
            scalable minds {new Date().getFullYear()} &bull;{" "}
            <a href="https://webknossos.org/imprint">Imprint</a> &bull;{" "}
            <a href="https://webknossos.org/privacy">Privacy</a>
          </p>
          <p style={{ fontSize: "0.8em" }}>
            OME and its associated logo are trademarks of Glencoe Software Inc.,
            <br />
            which holds these marks to protect them on behalf of the OME
            community.
          </p>
          <p>
            <a href="https://webknossos.org">
              <img src="/wk-logo.svg" alt="WEBKNOSSOS" style={{ width: 175 }} />
            </a>
          </p>
        </footer>
      )}
    </>
  );
}

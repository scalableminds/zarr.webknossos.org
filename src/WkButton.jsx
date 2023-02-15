import React from "react";

export default function WkButton({ url }) {
  let buttonStyle = {
    background: "transparent",
    border: "none",
    padding: "0 2px",
    cursor: "pointer",
  };

  return (
    <a title="Open in WEBKNOSSOS" style={buttonStyle} href={url}>
      <img src="/wk.svg" />
    </a>
  );
}

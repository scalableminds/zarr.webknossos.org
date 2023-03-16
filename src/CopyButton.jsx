import React from "react";

export default function CopyButton({ url }) {
  let [shaking, setShaking] = React.useState(false);

  function copyTextToClipboard() {
    var textArea = document.createElement("textarea");
    // Place in the top-left corner of screen regardless of scroll position.
    textArea.style.position = "fixed";

    textArea.value = url;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    var successful;
    try {
      successful = document.execCommand("copy");
    } catch (err) {
      console.log("Oops, unable to copy");
    }
    document.body.removeChild(textArea);

    if (successful) {
      // show user that copying happened - update text on element (e.g. button)
      setShaking(true);
      setTimeout(() => {
        // reset after 1 second
        setShaking(false);
      }, 1000);
    } else {
      console.log("Copying failed");
    }
  }

  const buttonStyle = shaking
    ? // NB: seesaw is defined in global App.css
      { animation: "0.1s linear 0s infinite alternate seesaw" }
    : {};

  return (
    <button
      title="Copy OME-Zarr URL"
      className="zarr-button"
      style={buttonStyle}
      onClick={copyTextToClipboard}
    >
      <img src="/copy.svg" /> Copy Zarr URL
    </button>
  );
}

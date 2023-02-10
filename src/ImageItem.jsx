import React from "react";

import Viewer from "./Viewer";
import OpenWith from "./OpenWith";
import { loadOmeroMultiscales, open, getNgffAxes } from "./util";

// DeckGL react component
export default function ImageItem({ source }) {
  let config = { source };

  const [layers, setLayers] = React.useState([]);

  const [imgInfo, setImageInfo] = React.useState({});

  React.useEffect(() => {
    const fn = async function () {
      let node = await open(config.source);
      let attrs = await node.attrs.asObject();
      console.log("attrs", attrs);

      let keywords = [];
      let wells;
      let fields;

      // Check if we have a plate or bioformats2raw.layout...
      let redirectSource;
      if (attrs.plate) {
        fields = attrs.plate.field_count;
        wells = attrs.plate.wells.length;
        let wellPath = source + "/" + attrs.plate.wells[0].path;
        let wellJson = await fetch(wellPath + "/.zattrs").then(rsp => rsp.json());
        redirectSource = wellPath + "/" + wellJson.well.images[0].path;
      } else if (attrs['bioformats2raw.layout']) {
        // Use the first image at /0
        redirectSource = source + "/0";
      }
      if (redirectSource) {
        // reload with new source
        config = {source: redirectSource}
        node = await open(config.source);
        attrs = await node.attrs.asObject();
        keywords.push("bioformats2raw.layout");
      }

      const axes = getNgffAxes(attrs.multiscales);

      let layerData = await loadOmeroMultiscales(config, node, attrs);

      let shape = layerData.loader[0]._data.meta.shape;

      let selections = [];
      layerData.channelsVisible.forEach((visible, chIndex) => {
        if (visible) {
          selections.push(
            axes.map((axis, dim) => {
              if (axis.type == "time") return 0;
              if (axis.name == "z") return parseInt(shape[dim] / 2);
              if (axis.name == "c") return chIndex;
              return 0;
            })
          );
        }
      });
      const dims = {};
      axes.forEach((axis, dim) => (dims[axis.name] = shape[dim]));
      layerData.selections = selections;

      setLayers([layerData]);
      setImageInfo({
        dims: dims,
        axes: axes.map((axis) => axis.name).join(""),
        version: attrs.multiscales?.[0]?.version,
        keywords,
        wells,
        fields
      });
    };

    fn();
  }, []);

  let wrapperStyle = {
    width: 150,
    height: 100,
    position: "relative",
  };

  let sizes = ["x", "y", "z", "c", "t"].map((dim) => (
    <td key={dim}>{imgInfo?.dims?.[dim]}</td>
  ));

  return (
    <tr>
      <td>{imgInfo.version}</td>
      <td>
        <a href="{source}">source</a>
        <OpenWith source={source} />
      </td>
      {sizes}
      <td>{imgInfo.axes}</td>
      <td>{imgInfo.wells}</td>
      <td>{imgInfo.fields}</td>
      <td>{imgInfo?.keywords?.join(", ")}</td>
      <td>
        <div style={wrapperStyle}>
          <Viewer layersData={layers} />
        </div>
      </td>
    </tr>
  );
}

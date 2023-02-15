import React from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

import WkButton from "./WkButton";
import CopyButton from "./CopyButton";

function formatNumberToLength(numberInNm) {
  if (numberInNm < 1000) {
    return `${numberInNm} nm`;
  } else if (numberInNm < 1000000) {
    return `${Math.round(numberInNm / 1000)} μm`;
  } else {
    return `${Math.round(numberInNm / 1000000)} mm`;
  }
}

function formatScale(scaleArr) {
  if (scaleArr != null && scaleArr.length > 0) {
    let unit = "nm³";
    let scaleArrAdjusted = scaleArr;
    const smallestValue = Math.min(...scaleArr);
    if (smallestValue > 1000000) {
      scaleArrAdjusted = scaleArr.map((value) => value / 1000000);
      unit = "mm³";
    } else if (smallestValue > 1000) {
      scaleArrAdjusted = scaleArr.map((value) => value / 1000);
      unit = "μm³";
    }
    const scaleArrRounded = scaleArrAdjusted.map((value) => Math.round(value));
    return `${scaleArrRounded.join(" × ")} ${unit}/voxel`;
  } else {
    return "";
  }
}

function aggregateBoundingBox(boundingBoxes) {
  if (boundingBoxes.length === 0) {
    return {
      min: [0, 0, 0],
      max: [0, 0, 0],
    };
  }

  const allCoordinates = [0, 1, 2].map((index) =>
    boundingBoxes
      .map((box) => box.topLeft[index])
      .concat(
        boundingBoxes.map((box) => {
          const bottomRight = [
            box.topLeft[0] + box.width,
            box.topLeft[1] + box.height,
            box.topLeft[2] + box.depth,
          ];
          return bottomRight[index];
        })
      )
  );
  const min = [0, 1, 2].map((index) => Math.min(...allCoordinates[index]));
  const max = [0, 1, 2].map((index) => Math.max(...allCoordinates[index]));
  return { min, max };
}

function getDatasetExtentAsString(layer, scale) {
  const { min, max } = aggregateBoundingBox([layer.boundingBox]);
  const extentInVoxel = {
    topLeft: min,
    width: max[0] - min[0],
    height: max[1] - min[1],
    depth: max[2] - min[2],
    min,
    max,
  };
  const topLeft = extentInVoxel.topLeft.map((val, index) => val * scale[index]);
  const extent = {
    topLeft,
    width: extentInVoxel.width * scale[0],
    height: extentInVoxel.height * scale[1],
    depth: extentInVoxel.depth * scale[2],
  };
  return `${formatNumberToLength(extent.width)} × ${formatNumberToLength(
    extent.height
  )} × ${formatNumberToLength(extent.depth)}`;
}

export default function ImageItem({ dataset }) {
  const [layers, setLayers] = React.useState([]);

  const [imgInfo, setImageInfo] = React.useState({});

  let link_style = {
    maxWidth: 150,
    display: "block",
    textOverflow: "ellipsis",
    direction: "rtl",
    whiteSpace: "nowrap",
    overflow: "hidden",
  };
  const colorLayer = dataset.dataSource.dataLayers.find(
    (l) => l.category === "color" && !l.name.includes("prediction")
  );
  const zarrUrl = `${dataset.dataStore.url}/data/zarr/${dataset.owningOrganization}/${dataset.name}/${colorLayer.name}`;
  const wkUrl = `https://webknossos.org/datasets/${dataset.owningOrganization}/${dataset.name}`;

  return (
    <tr>
      <td>
        <WkButton url={wkUrl} />
        <CopyButton url={zarrUrl} />
      </td>
      <td>{getDatasetExtentAsString(colorLayer, dataset.dataSource.scale)}</td>
      <td>{formatScale(dataset.dataSource.scale)}</td>
      <td>
        <strong>{dataset.publication.title}</strong>
        <br />
        <ReactMarkdown remarkPlugins={[remarkBreaks]}>
          {dataset.publication.description}
        </ReactMarkdown>
      </td>
      <td>
        <img
          src={`https://webknossos.org/api/datasets/${encodeURIComponent(
            dataset.owningOrganization
          )}/${encodeURIComponent(dataset.name)}/layers/${encodeURIComponent(
            colorLayer.name
          )}/thumbnail?w=200&h=200`}
        />
      </td>
    </tr>
  );
}

import React from "react";

import CopyButton from "./CopyButton";

const unitMapping = {
  yoctometer: "ym",
  zeptometer: "zm",
  attometer: "am",
  femtometer: "fm",
  picometer: "pm",
  nanometer: "nm",
  micrometer: "µm",
  millimeter: "mm",
  centimeter: "cm",
  decimeter: "dm",
  meter: "m",
  hectometer: "hm",
  kilometer: "km",
  megameter: "Mm",
  gigameter: "Gm",
  terameter: "Tm",
  petameter: "Pm",
  exameter: "Em",
  zettameter: "Zm",
  yottameter: "Ym",
  ångström: "Å",
  inch: "in",
  foot: "ft",
  yard: "yd",
  mile: "mi",
  parsec: "pc",
};
function formatScale(scaleArr, scaleUnit) {
  if (scaleArr != null && scaleArr.length > 0) {
    let unit = unitMapping[scaleUnit] + "³";
    let scaleArrAdjusted = scaleArr;
    const smallestValue = Math.min(...scaleArr);
    if (scaleUnit == "nanometer" && smallestValue > 1000000) {
      scaleArrAdjusted = scaleArr.map((value) => value / 1000000);
      unit = "mm³";
    } else if (scaleUnit == "nanometer" && smallestValue > 1000) {
      scaleArrAdjusted = scaleArr.map((value) => value / 1000);
      unit = "μm³";
    }
    const scaleArrRounded = scaleArrAdjusted.map((value) => Math.round(value));
    return `${scaleArrRounded.join(" × ")} ${unit}/voxel`;
  } else {
    return "";
  }
}

function formatNumberToLength(numberInNm) {
  if (numberInNm < 1000) {
    return `${numberInNm} nm`;
  } else if (numberInNm < 1000000) {
    return `${Math.round(numberInNm / 1000)} μm`;
  } else {
    return `${Math.round(numberInNm / 1000000)} mm`;
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

function getDatasetExtentAsString(layer, dataset) {
  const datasetLayers = dataset.dataSource.dataLayers.filter(
    (layer) => !layer.name.includes("prediction")
  );
  const allBoundingBoxes = datasetLayers.map((layer) => layer.boundingBox);
  const unifiedBoundingBoxes = aggregateBoundingBox(allBoundingBoxes);
  const { min, max } = unifiedBoundingBoxes;
  const extentInVoxel = {
    topLeft: min,
    width: max[0] - min[0],
    height: max[1] - min[1],
    depth: max[2] - min[2],
    min,
    max,
  };
  const scale = dataset.dataSource.scale.factor;
  let extentUnit = dataset.dataSource.scale.unit;
  const topLeft = extentInVoxel.topLeft.map((val, index) => val * scale[index]);
  const extent = {
    topLeft,
    width: extentInVoxel.width * scale[0],
    height: extentInVoxel.height * scale[1],
    depth: extentInVoxel.depth * scale[2],
  };
  if (
    extentUnit == "nanometer" &&
    (extent.width > 1000000 ||
      extent.height > 1000000 ||
      extent.depth > 1000000)
  ) {
    extent.width /= 1000000;
    extent.height /= 1000000;
    extent.depth /= 1000000;
    extentUnit = "millimeter";
  }
  if (
    extentUnit == "nanometer" &&
    (extent.width > 1000 || extent.height > 1000 || extent.depth > 1000)
  ) {
    extent.width /= 1000;
    extent.height /= 1000;
    extent.depth /= 1000;
    extentUnit = "micrometer";
  }
  return `${extent.width} × ${extent.height} × ${extent.depth} ${unitMapping[extentUnit]}³`;
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
    <div className="dataset-item">
      <div className="dataset-item-thumbnail-wrapper">
        <a href={wkUrl}>
          <img
            src={`https://webknossos.org/api/datasets/${encodeURIComponent(
              dataset.owningOrganization
            )}/${encodeURIComponent(dataset.name)}/layers/${encodeURIComponent(
              colorLayer.name
            )}/thumbnail?w=200&h=200`}
          />
        </a>
      </div>
      <div className="dataset-item-content">
        <h3>{dataset.name}</h3>
        <p>
          {getDatasetExtentAsString(colorLayer, dataset)}
          <br />
          {formatScale(
            dataset.dataSource.scale.factor,
            dataset.dataSource.scale.unit
          )}
        </p>
        <p>
          <a className="wk-button" title="Open in WEBKNOSSOS" href={wkUrl}>
            <img src="/wk.svg" /> Open dataset
          </a>
          <CopyButton url={zarrUrl} />
        </p>
      </div>
    </div>
  );
}

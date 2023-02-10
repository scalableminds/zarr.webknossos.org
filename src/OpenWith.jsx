import React from "react";

import openwithJson from "../public/openwith.json";

export default function OpenWith({ source }) {

  let viewers = openwithJson.viewers;


  return (<div>
    {
      viewers.map(viewer => (
        <a target="_blank" href={viewer.href + source}>
          <img className="viewer_icon" src={viewer.logo}/>
        </a>
      ))
    }
  </div>);
}

import React, { useEffect } from "react";
import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const PdfViewer = ({ data }) => {
  const base64 = "data:application/pdf;base64," + data;
  const pdfContentType = "application/pdf";

  const base64toBlob = (data) => {
    const base64WithoutPrefix = data.substr(
      `data:${pdfContentType};base64,`.length
    );

    const bytes = atob(base64WithoutPrefix);
    let length = bytes.length;
    let out = new Uint8Array(length);

    while (length--) {
      out[length] = bytes.charCodeAt(length);
    }

    return new Blob([out], { type: pdfContentType });
  };

  const url = URL.createObjectURL(base64toBlob(base64));

  var link = document.createElement("a");
  link.href = url;
  link.download = "aDefaultFileName.txt";
  link.innerText = "Click here to download the file";
  link.click();

  console.log("datadata", url);
  return (
    <div
      style={{
        border: "1px solid rgba(0, 0, 0, 0.3)",
        height: "750px",
      }}
    >
      <Viewer fileUrl={url} />
    </div>
  );
};

export default PdfViewer;

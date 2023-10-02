import React, { useEffect } from "react";

const Certifications: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "//cdn.credly.com/assets/utilities/embed.js";
    document.getElementById("credly-badge-container")?.appendChild(script);
  }, []);

  return (
    <div
      id="credly-badge-container"
      data-iframe-width="150"
      data-iframe-height="270"
      data-share-badge-id="aeba96c1-d7f0-4d1d-bf1c-6555f1001746"
      data-share-badge-host="https://www.credly.com"
    ></div>
  );
};

export default Certifications;

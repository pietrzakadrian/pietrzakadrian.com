import React, { createRef, useEffect } from "react";

import { useTheme } from "@/hooks";

const Comments: React.FC = () => {
  const commentBox = createRef<HTMLDivElement>();
  const [{ mode }] = useTheme();

  useEffect(() => {
    let utterances = commentBox?.current?.querySelector(".utterances");

    if (utterances) {
      commentBox?.current?.removeChild(utterances);
    }

    const scriptElement = document.createElement("script");
    scriptElement.async = true;
    scriptElement.src = "https://utteranc.es/client.js";
    scriptElement.setAttribute(
      "repo",
      "pietrzakadrian/pietrzakadrian.com-blog-comments",
    );
    scriptElement.setAttribute("issue-term", "title");
    scriptElement.setAttribute("id", "utterances");
    scriptElement.setAttribute(
      "theme",
      mode === "dark" ? "dark-blue" : "github-light",
    );
    scriptElement.setAttribute("crossorigin", "anonymous");

    if (commentBox?.current) {
      commentBox.current.appendChild(scriptElement);
    }
  }, [mode]);

  return <div ref={commentBox} />;
};

export default Comments;

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  contentPath: string;
}

function MarkdownContent({ contentPath }: Props) {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(contentPath)
      .then((response) => response.text())
      .then((text) => setContent(text))
      .catch((error) =>
        console.error("Error loading markdown content:", error)
      );
  }, [contentPath]);

  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

export default MarkdownContent;

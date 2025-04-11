import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  contentString: string; // Changed prop name
}

function MarkdownContent({ contentString }: Props) {
  // Removed useState and useEffect for fetching

  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentString}</ReactMarkdown>
    </div>
  );
}

export default MarkdownContent;

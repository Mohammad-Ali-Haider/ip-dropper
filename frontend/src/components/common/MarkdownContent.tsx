import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  contentString: string;
}

function MarkdownContent({ contentString }: Props) {
  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentString}</ReactMarkdown>
    </div>
  );
}

export default MarkdownContent;

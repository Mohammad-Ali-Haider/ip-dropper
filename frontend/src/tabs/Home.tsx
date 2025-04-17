import MarkdownContent from "../components/common/MarkdownContent";
import homeContent from "../../src/content/home.md?raw";

function Home() {
  return <MarkdownContent contentString={homeContent} />;
}

export default Home;

import MarkdownContent from "../components/common/MarkdownContent";
import homeContent from "../../src/content/home.md?raw"; // Import as raw string

function Home() {
  return <MarkdownContent contentString={homeContent} />; // Pass the string
}

export default Home;

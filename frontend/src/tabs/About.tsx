import MarkdownContent from "../components/common/MarkdownContent";
import aboutContent from "../../src/content/about.md?raw";

function About() {
  return <MarkdownContent contentString={aboutContent} />;
}

export default About;

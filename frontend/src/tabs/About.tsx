import MarkdownContent from "../components/common/MarkdownContent";
import aboutContent from "../../src/content/about.md?raw"; // Import as raw string

function About() {
  return <MarkdownContent contentString={aboutContent} />; // Pass the string
}

export default About;

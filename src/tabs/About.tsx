import MarkdownContent from '../components/MarkdownContent';

function About() {
  return (
    <div className="no-border">
      <MarkdownContent contentPath="/src/content/about.md" />
    </div>
  );
}

export default About;

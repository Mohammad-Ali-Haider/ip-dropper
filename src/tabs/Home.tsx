import MarkdownContent from '../components/MarkdownContent';

function Home() {
  return (
    <div className="no-border">
      <MarkdownContent contentPath="/src/content/home.md" />
    </div>
  );
}

export default Home;

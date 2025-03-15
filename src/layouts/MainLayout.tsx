import { ReactNode } from "react";

interface MainLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

function MainLayout({ sidebar, content }: MainLayoutProps) {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-2 col-12 p-0 sidebar-container">
          {sidebar}
        </div>
        <div className="col-lg-10 col-12 main-content">
          {content}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
import { ReactNode } from "react";
import "../css/Sidebar.css";

interface Props {
  children: ReactNode;
}

function Sidebar({ children }: Props) {
  return (
    <div className="sidebar-container">
      <div className="sidebar-content">
        {children}
      </div>
    </div>
  );
}

export default Sidebar;
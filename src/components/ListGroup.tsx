import "../css/ListGroup.css";

interface Props {
  items: string[];
  selectedItem: number;
  onSelectItem: (index: number) => void;
}

function ListGroup({ items, selectedItem, onSelectItem }: Props) {
  return (
    <div className="list-group">
      {items.map((item, index) => (
        <button
          key={item}
          onClick={() => onSelectItem(index)}
          className={`list-group-item list-group-item-action ${
            selectedItem === index ? 'active' : ''
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default ListGroup;
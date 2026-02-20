import { useDroppable } from "@dnd-kit/core";
import css from "./battleships.module.css";

export default function DroppableCell({ id, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  const style = {
    backgroundColor: isOver ? "#61c6ff" : undefined,
    opacity: isOver ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={css.cell}>
      {children}
    </div>
  );
}

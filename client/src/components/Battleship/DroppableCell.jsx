import { useDroppable } from "@dnd-kit/core";
import css from "./battleships.module.css";

export default function DroppableCell({ id, children, previewCells }) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  const style = {
    backgroundColor: previewCells.includes(id) ? "#61c6ff" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={css.cell}>
      {children}
    </div>
  );
}

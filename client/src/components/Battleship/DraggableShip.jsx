import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Icon from "../Icon";
import css from "./battleships.module.css";

function getSegments(size) {
  return Array.from({ length: size }, (_, i) => {
    if (i === 0) return "back";
    if (i === size - 1) return "front";
    return "middle";
  });
}

export default function DraggableShip({ ship }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: ship.name,
      data: { size: ship.size, orientation: ship.orientation },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    zIndex: isDragging ? 999 : undefined,
    display: "flex",
    flexDirection: ship.orientation === "vertical" ? "column" : "row",
  };

  const segments = getSegments(ship.size);
  const rotationAngle = ship.orientation === "vertical" ? "180deg" : "90deg";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={css.ship}
    >
      {segments.map((type, index) => {
        let iconName = "boatMiddle";
        if (type === "front") iconName = "boatFront";
        if (type === "back") iconName = "boatBack";

        return (
          <div className={css.shipCell} key={index}>
            <Icon
              name={iconName}
              width="32px"
              height="32px"
              style={{
                transform: `rotate(${rotationAngle})`,
                display: "block",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

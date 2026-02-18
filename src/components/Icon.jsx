// import sprite from "../assets/symbol-defs.svg";

// export default function Icon({ name, width, height, className }) {
//   return (
//     <svg className={className} width={width} height={height}>
//       <use href={`${sprite}#icon-${name}`}></use>
//     </svg>
//   );
// }


export default function Icon({ name, className }) {
  return (
    <svg className={className}>
      <use href={`#icon-${name}`} />
    </svg>
  );
}


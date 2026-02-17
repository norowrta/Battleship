import css from "./header.module.css";

import figmaLogo from "../../assets/figma.svg";
import logo from "../../assets/battleship.svg";

export default function Header() {
  return (
    <header className={css.header}>
      <div className={css.headerContainer}>
        <a
          href="https://www.figma.com/community/file/954838223155879312"
          target="_blank"
          className={css.headerLink}
        >
          <img
            src={figmaLogo}
            alt="Figma logo"
            className={css.headerLogoFigma}
          />
        </a>
        <span className={css.headerLine}></span>
        <img src={logo} className={css.headerLogo} alt="ogo" />
      </div>
    </header>
  );
}

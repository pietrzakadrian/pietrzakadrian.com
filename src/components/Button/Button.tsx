import React from "react";

import cn from "classnames";
import { Link } from "gatsby";

import * as styles from "./Button.module.scss";

interface Props {
  isLink: boolean;
  title: string;
  className?: string;
  to?: string;
}

const Button: React.FC<Props> = ({ isLink, className, title, to }: Props) => {
  const buttonProps = {
    className: cn(styles.button, className),
    children: title,
  };

  if (to) {
    return isLink ? (
      <Link to={to} {...buttonProps} />
    ) : (
      <a
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        href={to}
      >
        <button {...buttonProps} />
      </a>
    );
  }

  return <button {...buttonProps} />;
};

export default Button;

import React from "react";
import styles from "./index.module.scss";
import clsx from "clsx";

const ShinyText: React.FC<{
  text: string;
  disabled: boolean;
  speed: number;
  className: string;
}> = ({ text, disabled = false, speed = 5, className = "" }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={clsx(styles.shiny, disabled && "disabled", className)}
      style={{ animationDuration }}
    >
      {text}
    </div>
  );
};

export default ShinyText;

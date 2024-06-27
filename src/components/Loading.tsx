import { useEffect, useState } from "react";
import styles from "./loading.module.scss";
import clsx from "clsx";

const Loading = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return;

    document.readyState === "complete" && setLoading(false);

    const handleLoad = () => {
      console.log("%cloaded", "font-size: 100px;");
      setLoading(false);
    };

    const clear = () => {
      clearTimeout(timer);
      setLoading(false);
      window.removeEventListener("load", handleLoad);
    };

    // timeout
    const timer = setTimeout(clear, 15_000);

    window.addEventListener("load", handleLoad);

    return clear;
  }, [loading]);

  return (
    loading && (
      <div
        className={clsx(
          "h-screen w-screen top-0 left-0 z-999 fixed",
          styles.container
        )}
      >
        <div className={clsx(styles.circle, styles.circle1)}></div>
        <div className={clsx(styles.circle, styles.circle2)}></div>
        <div className={clsx(styles.circle, styles.circle3)}></div>
        <div className={clsx(styles.circle, styles.circle4)}></div>
      </div>
    )
  );
};

export default Loading;

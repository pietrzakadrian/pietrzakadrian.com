import React, { useEffect } from "react";
import * as styles from "./Layout.module.scss";
import { useTheme } from "@/hooks";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }: Props) => {
  const [{ mode }] = useTheme();

  useEffect(() => {
    document.documentElement.className = mode;
  }, [mode]);

  return <div className={styles.layout}>{children}</div>;
};

export default Layout;

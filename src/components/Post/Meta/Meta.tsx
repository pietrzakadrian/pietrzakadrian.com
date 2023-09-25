import React from "react";

import * as styles from "./Meta.module.scss";

interface Props {
  date: string;
  timeToRead: number;
}

const Meta: React.FC<Props> = ({ date, timeToRead }: Props) => (
  <div className={styles.meta}>
    <p className={styles.date}>
      {new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </p>

    <span>—</span>

    <p>
      {timeToRead} min read
    </p>
  </div>
);

export default Meta;

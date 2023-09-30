import React from "react";

import { Author } from "@/components/Post/Author";

import * as styles from "./Content.module.scss";

interface Props {
  title: string;
  body: string;
  date: string;
  timeToRead: number;
}

const Content: React.FC<Props> = ({ body, title, date, timeToRead }: Props) => (
  <div className={styles.content}>
    <h1 className={styles.title}>{title}</h1>

    <Author date={date} timeToRead={timeToRead} />

    <div className={styles.body} dangerouslySetInnerHTML={{ __html: body }} />
  </div>
);

export default Content;

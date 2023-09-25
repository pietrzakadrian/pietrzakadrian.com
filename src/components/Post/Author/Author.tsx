import React from "react";

import { useSiteMetadata } from "@/hooks";
import { getContactHref } from "@/utils";

import * as styles from "./Author.module.scss";
import {ThemeSwitcher} from "@/components/ThemeSwitcher";
import {Link} from "gatsby";
import {Image} from "@/components/Image";
import {Meta} from "@/components/Post/Meta";

interface Props {
  date: string;
  timeToRead: number;
}
const Author = ({ date, timeToRead }: Props) => {
  const { author } = useSiteMetadata();

  return (
    <div className={styles.author}>
      <div className={styles.information}>
        <Image alt={author.name} path={author.photo} className={styles.photo}/>

        <div>
          <strong>{author.name}</strong>
          <Meta date={date} timeToRead={timeToRead} />
        </div>
      </div>

      <ThemeSwitcher />
    </div>
  );
};

export default Author;

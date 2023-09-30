import React from "react";

import { Link } from "gatsby";

import { Image } from "@/components/Image";

import constants from "../../../../internal/gatsby/constants/routes";

import * as styles from "./Author.module.scss";

type Props = {
  author: {
    name: string;
    bio: string;
    photo: string;
  };
  isIndex?: boolean;
};

const Author = ({ author, isIndex }: Props) => (
  <div className={styles.author}>
    <Link to={constants.indexRoute}>
      <Image alt={author.name} path={author.photo} className={styles.photo} />
    </Link>

    <div className={styles.titleContainer}>
      {isIndex ? (
        <h1 className={styles.title}>
          <Link className={styles.link} to={constants.indexRoute}>
            {author.name}
          </Link>
        </h1>
      ) : (
        <h2 className={styles.title}>
          <Link className={styles.link} to={constants.indexRoute}>
            {author.name}
          </Link>
        </h2>
      )}
    </div>
    <p className={styles.subtitle}>{author.bio}</p>
  </div>
);

export default Author;

import React from "react";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import type { Node } from "@/types";

import { Comments } from "./Comments";
import { Content } from "./Content";
import { Tags } from "./Tags";

import * as styles from "./Post.module.scss";
import { Copyright } from "./Copyright";
import {useSiteMetadata} from "@/hooks";

interface Props {
  post: Node;
}

const Post: React.FC<Props> = ({ post }: Props) => {
  const { html, timeToRead } = post;
  const { tagSlugs, slug } = post.fields;
  const { tags, title, date } = post.frontmatter;
  const { copyright } = useSiteMetadata();

  return (
    <div className={styles.post}>
      <div className={styles.content}>
        <Content body={html} title={title} date={date} timeToRead={timeToRead} />
      </div>

      <div>
        <Copyright copyright={copyright} />
      </div>

      <div className={styles.footer}>
        {tags && tagSlugs && <Tags tags={tags} tagSlugs={tagSlugs} />}
      </div>

      <div className={styles.comments}>
        <Comments postSlug={slug} postTitle={post.frontmatter.title} />
      </div>
    </div>
  );
};

export default Post;

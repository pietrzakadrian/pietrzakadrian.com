import React from "react";
import * as styles from "./Post.module.scss";
import { Form as NewsletterForm } from "@/components/Newsletter/Form";
import { Related } from "@/components/Post/Related";
import { useSiteMetadata } from "@/hooks";
import type { Edge, Node } from "@/types";
import { Comments } from "./Comments";
import { Content } from "./Content";
import { Copyright } from "./Copyright";
import { Tags } from "./Tags";

interface Props {
  post: Node;
  related: Array<Edge>;
}

const Post: React.FC<Props> = ({ post, related }: Props) => {
  const { html, timeToRead } = post;
  const { tagSlugs } = post.fields;
  const { tags, title, date } = post.frontmatter;
  const { copyright } = useSiteMetadata();

  return (
    <div className={styles.post}>
      <div className={styles.content}>
        <Content
          body={html}
          title={title}
          date={date}
          timeToRead={timeToRead}
        />
      </div>

      <div>
        <Copyright copyright={copyright} />
      </div>

      <div className={styles.footer}>
        {tags && tagSlugs && <Tags tags={tags} tagSlugs={tagSlugs} />}
      </div>

      <div className={styles.comments}>
        <Comments />
      </div>

      <div>
        <h2>Newsletter</h2>
        <NewsletterForm />
      </div>

      {related.length > 0 && (
        <>
          <hr />

          <div>
            <h2>Related articles</h2>
            <Related related={related} />
          </div>
        </>
      )}
    </div>
  );
};

export default Post;

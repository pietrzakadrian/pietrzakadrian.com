import React from "react";

import { Link } from "gatsby";

import Tags from "@/components/Post/Tags/Tags";
import { Edge } from "@/types";

import * as styles from "./Feed.module.scss";

type Props = {
  edges: Array<Edge>;
};

const Feed: React.FC<Props> = ({ edges }: Props) => (
  <div className={styles.feed}>
    {edges.map((edge) => (
      <div className={styles.item} key={edge.node.fields.slug}>
        <div className={styles.meta}>
          <time
            className={styles.time}
            dateTime={new Date(edge.node.frontmatter.date).toLocaleDateString(
              "en-US",
              { year: "numeric", month: "long", day: "numeric" },
            )}
          >
            {new Date(edge.node.frontmatter.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span className={styles.divider} />
          <span className={styles.category}>
            <Link to={edge.node.fields.categorySlug} className={styles.link}>
              {edge.node.frontmatter.category}
            </Link>
          </span>
        </div>
        <h2 className={styles.title}>
          <Link
            className={styles.link}
            to={edge.node.frontmatter?.slug || edge.node.fields.slug}
          >
            {edge.node.frontmatter.title}
          </Link>
        </h2>
        <p className={styles.description}>
          {edge.node.frontmatter.description}
        </p>

        <div className={styles.bottom}>
          {edge.node.frontmatter.tags && edge.node.fields.tagSlugs && (
            <div className={styles.tags}>
              <Tags
                tags={edge.node.frontmatter.tags}
                tagSlugs={edge.node.fields.tagSlugs}
              />
            </div>
          )}

          <small>{edge.node.timeToRead} min read</small>
        </div>
      </div>
    ))}
  </div>
);

export default Feed;

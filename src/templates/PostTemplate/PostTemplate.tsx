import React from "react";

import {graphql} from "gatsby";

import {Layout} from "@/components/Layout";
import {Meta} from "@/components/Meta";
import {Post} from "@/components/Post";
import {useSiteMetadata} from "@/hooks";
import {AllMarkdownRemark, Node} from "@/types";
import {Sidebar} from "@/components/Sidebar";
import {Page} from "@/components/Page";

interface Props {
  data: {
    markdownRemark: Node;
    allMarkdownRemark: AllMarkdownRemark;
  };
}

const PostTemplate: React.FC<Props> = ({data: {markdownRemark, allMarkdownRemark}}: Props) => {
  console.log(allMarkdownRemark);

  return (
    <Layout>
      <Sidebar/>
      <Page>
        <Post post={markdownRemark} related={allMarkdownRemark.edges}/>
      </Page>
    </Layout>
  )
};

export const query = graphql`
  query PostTemplate($slug: String!, $groups: [String]!, $id: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      timeToRead
      fields {
        slug
        tagSlugs
      }
      frontmatter {
        date
        description
        tags
        title
        socialImage {
          publicURL
        }
      }
    }
    allMarkdownRemark(
      limit: 2
      filter: {
        id: { ne: $id }
        frontmatter: {
          tags: { in: $groups }
          template: { eq: "post" }
          draft: { ne: true }
        }
      }
      sort: { order: DESC, fields: [frontmatter___date] }
    ) {
      edges {
        node {
          timeToRead
          fields {
            tagSlugs
            categorySlug
          }
          frontmatter {
            title
            slug
            date
            category
            description
            tags
            socialImage {
              publicURL
            }
          }
        }
      }
    }
  }
`;

export const Head: React.FC<Props> = ({data}) => {
  let {title, subtitle, url} = useSiteMetadata();
  title = `${title}: Software Engineering Blog`;

  const {
    frontmatter: {
      title: postTitle,
      description: postDescription = "",
      socialImage,
    },
  } = data.markdownRemark;

  const description = postDescription || subtitle;
  const image = socialImage?.publicURL && url.concat(socialImage?.publicURL);

  return (
    <Meta
      title={`${postTitle} — ${title}`}
      description={description}
      image={image}
    />
  );
};

export default PostTemplate;

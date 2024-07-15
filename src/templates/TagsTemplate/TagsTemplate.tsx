import React from "react";

import { Link } from "gatsby";

import { Layout } from "@/components/Layout";
import { Meta } from "@/components/Meta";
import { Page } from "@/components/Page";
import { Sidebar } from "@/components/Sidebar";
import { useSiteMetadata, useTagsList } from "@/hooks";
import { toKebabCase } from "@/utils";

import constants from "../../../internal/gatsby/constants/routes";

const TagsTemplate: React.FC = () => {
  const tags = useTagsList();

  return (
    <Layout>
      <Sidebar />
      <Page title="Tags">
        <ul>
          {tags.map((tag) => (
            <li key={tag.fieldValue}>
              <Link
                to={`${constants.tagRoute}/${toKebabCase(tag.fieldValue)}/`}
              >
                {tag.fieldValue} ({tag.totalCount})
              </Link>
            </li>
          ))}
        </ul>
      </Page>
    </Layout>
  );
};

export const Head: React.FC = () => {
  let { title, subtitle } = useSiteMetadata();
  title = `${title}: Software Engineering Blog`;
  const pageTitle = `Tags — ${title}`;

  return <Meta title={pageTitle} description={subtitle} />;
};

export default TagsTemplate;

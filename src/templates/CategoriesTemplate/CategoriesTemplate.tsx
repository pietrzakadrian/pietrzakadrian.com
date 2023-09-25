import React from "react";

import { Link } from "gatsby";

import { Layout } from "@/components/Layout";
import { Meta } from "@/components/Meta";
import { Page } from "@/components/Page";
import { Sidebar } from "@/components/Sidebar";
import { useCategoriesList, useSiteMetadata } from "@/hooks";
import { toKebabCase } from "@/utils";
import constants from "../../../internal/gatsby/constants/routes";

const CategoriesTemplate: React.FC = () => {
  const categories = useCategoriesList();

  return (
    <Layout>
      <Sidebar />
      <Page title="Categories">
        <ul>
          {categories.map((category) => (
            <li key={category.fieldValue}>
              <Link to={`${constants.categoryRoute}/${toKebabCase(category.fieldValue)}/`}>
                {category.fieldValue} ({category.totalCount})
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
  const pageTitle = `Categories — ${title}`;

  return <Meta title={pageTitle} description={subtitle} />;
};

export default CategoriesTemplate;

import React from "react";

import { Layout } from "@/components/Layout";
import { Meta } from "@/components/Meta";
import { Confirm } from "@/components/Newsletter/Confirm";
import { Page } from "@/components/Page";
import { Sidebar } from "@/components/Sidebar";
import { useSiteMetadata } from "@/hooks";

const NewsletterConfirmTemplate: React.FC = () => (
  <Layout>
    <Sidebar />
    <Page title="Thank you!">
      <Confirm />
    </Page>
  </Layout>
);

export const Head: React.FC = () => {
  const { title, subtitle } = useSiteMetadata();
  const pageTitle = `Thank you! — ${title}`;

  return <Meta title={pageTitle} description={subtitle} />;
};

export default NewsletterConfirmTemplate;

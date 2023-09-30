import React from "react";

import { Layout } from "@/components/Layout";
import { Meta } from "@/components/Meta";
import { Form } from "@/components/Newsletter/Form";
import { Page } from "@/components/Page";
import { Sidebar } from "@/components/Sidebar";
import { useSiteMetadata } from "@/hooks";

const NewsletterTemplate: React.FC = () => (
  <Layout>
    <Sidebar />
    <Page title="Newsletter">
      <Form />
    </Page>
  </Layout>
);

export const Head: React.FC = () => {
  const { title, subtitle } = useSiteMetadata();
  const pageTitle = `Newsletter — ${title}`;

  return <Meta title={pageTitle} description={subtitle} />;
};

export default NewsletterTemplate;

import React from "react";
import {Layout} from "@/components/Layout";
import {Sidebar} from "@/components/Sidebar";
import {Page} from "@/components/Page";
import {useSiteMetadata} from "@/hooks";
import {Meta} from "@/components/Meta";
import {Form} from "@/components/Newsletter/Form";

const NewsletterTemplate: React.FC = () => {
  return (
    <Layout>
      <Sidebar />
      <Page title="Newsletter">
        <Form />
      </Page>
    </Layout>
  );
};

export const Head: React.FC = () => {
  const { title, subtitle } = useSiteMetadata();
  const pageTitle = `Newsletter — ${title}`;

  return <Meta title={pageTitle} description={subtitle} />;
};

export default NewsletterTemplate;

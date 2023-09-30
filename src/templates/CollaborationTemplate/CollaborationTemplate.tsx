import React from "react";
import {useSiteMetadata} from "@/hooks";
import {Meta} from "@/components/Meta";
import {Layout} from "@/components/Layout";
import {Sidebar} from "@/components/Sidebar";
import {Page} from "@/components/Page";
import {Collaboration} from "@/components/Collaboration";

const CollaborationTemplate: React.FC = () => (
  <Layout>
    <Sidebar />
    <Page title="Collaboration">
      <Collaboration />
    </Page>
  </Layout>
);

export const Head: React.FC = () => {
  const { title, subtitle } = useSiteMetadata();
  const pageTitle = `Collaboration — ${title}`;

  return <Meta title={pageTitle} description={subtitle} />;
};

export default CollaborationTemplate;

import React from "react";

import { Layout } from "@/components/Layout";
import { Meta } from "@/components/Meta";
import { Page } from "@/components/Page";
import { Sidebar } from "@/components/Sidebar";
import { useSiteMetadata } from "@/hooks";
import { Certifications } from "@/components/Certifications";

const CertificationsTemplate: React.FC = () => (
  <Layout>
    <Sidebar />
    <Page title="Certifications">
      <Certifications />
    </Page>
  </Layout>
);

export const Head: React.FC = () => {
  const { title, subtitle } = useSiteMetadata();
  const pageTitle = `Certifications — ${title}`;

  return <Meta title={pageTitle} description={subtitle} />;
};

export default CertificationsTemplate;

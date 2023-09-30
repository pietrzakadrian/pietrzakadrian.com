import React, { useEffect } from "react";
import { navigate } from "gatsby";
import routes from '../../../internal/gatsby/constants/routes'
import {useSiteMetadata} from "@/hooks";
import {Meta} from "@/components/Meta";

const HomeTemplate: React.FC = () => {
  useEffect(() => {
    navigate(routes.indexRoute);
  }, []);

  return null;
};

export const Head: React.FC = () => {
  const { title, subtitle } = useSiteMetadata();

  return <Meta title={title} description={subtitle} />;
};

export default HomeTemplate;

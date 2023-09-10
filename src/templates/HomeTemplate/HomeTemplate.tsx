import React, { useEffect } from "react";
import { navigate } from "gatsby";
import routes from '../../../internal/gatsby/constants/routes'

const HomeTemplate: React.FC = () => {
  useEffect(() => {
    navigate(routes.indexRoute);
  }, []);

  return null;
};


export default HomeTemplate;

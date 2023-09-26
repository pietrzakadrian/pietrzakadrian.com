import React from "react";

import {testUtils} from "@/utils"

import BlogTemplate from "./HomeTemplate";
import * as mocks from "@/mocks";
import {StaticQuery, useStaticQuery} from "gatsby";

const mockedStaticQuery = StaticQuery as jest.Mock;
const mockedUseStaticQuery = useStaticQuery as jest.Mock;


describe("BlogTemplate", () => {
  beforeEach(() => {
    mockedStaticQuery.mockImplementationOnce(({ render }) =>
      render(mocks.siteMetadata),
    );
    mockedUseStaticQuery.mockReturnValue(mocks.siteMetadata);
  });

  it("renders correctly", () => {


    const tree = testUtils
      .createSnapshotsRenderer(<BlogTemplate />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});


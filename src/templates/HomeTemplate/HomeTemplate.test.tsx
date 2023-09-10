import React from "react";

import {testUtils} from "@/utils"

import HomeTemplate from "./HomeTemplate";
import * as mocks from "@/mocks";
import {StaticQuery, useStaticQuery} from "gatsby";

const mockedStaticQuery = StaticQuery as jest.Mock;
const mockedUseStaticQuery = useStaticQuery as jest.Mock;


describe("HomeTemplate", () => {
  beforeEach(() => {
    mockedStaticQuery.mockImplementationOnce(({ render }) =>
      render(mocks.siteMetadata),
    );
    mockedUseStaticQuery.mockReturnValue(mocks.siteMetadata);
  });

  it("renders correctly", () => {


    const tree = testUtils
      .createSnapshotsRenderer(<HomeTemplate />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});


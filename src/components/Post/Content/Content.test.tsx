import React from "react";

import { StaticQuery, useStaticQuery } from "gatsby";

import { Content } from "@/components/Post/Content";
import * as mocks from "@/mocks";
import { testUtils } from "@/utils";

const mockedStaticQuery = StaticQuery as jest.Mock;
const mockedUseStaticQuery = useStaticQuery as jest.Mock;

describe("Content", () => {
  beforeEach(() => {
    mockedStaticQuery.mockImplementationOnce(({ render }) =>
      render(mocks.siteMetadata),
    );

    mockedUseStaticQuery.mockReturnValue(mocks.siteMetadata);
  });

  test("renders correctly", () => {
    const props = {
      title: mocks.markdownRemark.frontmatter.title,
      body: mocks.markdownRemark.html,
      date: mocks.markdownRemark.frontmatter.date,
      timeToRead: mocks.markdownRemark.frontmatter.timeToRead,
    };

    const tree = testUtils
      .createSnapshotsRenderer(<Content {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

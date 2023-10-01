import React from "react";

import { Button } from "@/components/Button";

import downloadFile from "./report.pdf";
import * as styles from "./Collaboration.module.scss";

const Collaboration: React.FC = () => (
  <section className={styles.collaboration}>
    <p>
      My blog is visited by thousands of developers and IT-related people from
      all over the world. With many years of experience as a programmer, my
      articles become a help to the whole community and help solve problems
      encountered in the software development process and beyond.
    </p>

    <Button
      className={styles.button}
      isLink={false}
      title={"Get the GA4 report for the last 3 months"}
      to={downloadFile}
    />

    <hr />

    <p>
      I'm aiming to continuously expand my expertise in Software Engineering and
      Web Development through active participation in demanding, real-world
      projects. I'm driven by a career objective to collaboratively create
      top-tier software solutions with a dedicated and enthusiastic team.
    </p>

    <p>
      If you have any questions for me or would like to collaborate, make me an
      interesting job offer or start a partnership — you can contact me by
      email.
    </p>
  </section>
);

export default Collaboration;

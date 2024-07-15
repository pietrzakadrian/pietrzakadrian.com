import React from "react";

import { Link } from "gatsby";

import { Image } from "@/components/Image";

import * as styles from "./Partners.module.scss";

const Partners: React.FC = () => (
  <section className={styles.partners}>
    <h2>Partners</h2>

    <div className={styles.parent}>
      <Link className={styles.item} to="https://www.autonomous.ai/">
        <Image alt={"Autonomous"} path={"/media/Autonomous-logo.png"} />
      </Link>

      <Link className={styles.item} to="https://pl.genesis-zone.com/">
        <Image alt={"Genesis"} path={"/media/Genesis-logo.png"} />
      </Link>

      <Link className={styles.item} to="https://eyeshield.com/pietrzakadrian">
        <Image alt={"EyeShield"} path={"/media/EyeShield-logo.png"} />
      </Link>
    </div>
  </section>
);

export default Partners;

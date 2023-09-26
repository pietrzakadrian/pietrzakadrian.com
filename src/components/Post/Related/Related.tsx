import React from "react";

import { Feed } from "@/components/Feed";
import { Edge } from "@/types";

import * as styles from "./Related.module.scss";

interface Props {
  related: Array<Edge>;
}

const Related: React.FC<Props> = ({ related }: Props) => (
  <section className={styles.related}>
    <h2 className={styles.header}>Related articles</h2>

    <Feed edges={related} />
  </section>
);

export default Related;

import Fields from "./fields";
import Frontmatter from "./frontmatter";

interface Node {
  id: string;
  fields: Fields;
  timeToRead: number;
  frontmatter: Frontmatter;
  html: string;
}

export default Node;

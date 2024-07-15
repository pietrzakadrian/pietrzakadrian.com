import path from "path";

const templates = Object.freeze({
  blogTemplate: path.resolve("./src/templates/BlogTemplate/BlogTemplate.tsx"),
  homeTemplate: path.resolve("./src/templates/HomeTemplate/HomeTemplate.tsx"),
  newsletterTemplate: path.resolve(
    "./src/templates/NewsletterTemplate/NewsletterTemplate.tsx",
  ),
  newsletterConfirmTemplate: path.resolve(
    "./src/templates/NewsletterConfirmTemplate/NewsletterConfirmTemplate.tsx",
  ),
  collaborationTemplate: path.resolve(
    "./src/templates/CollaborationTemplate/CollaborationTemplate.tsx",
  ),
  certificationsTemplate: path.resolve(
    "./src/templates/CertificationsTemplate/CertificationsTemplate.tsx",
  ),
  notFoundTemplate: path.resolve(
    "./src/templates/NotFoundTemplate/NotFoundTemplate.tsx",
  ),
  categoryTemplate: path.resolve(
    "./src/templates/CategoryTemplate/CategoryTemplate.tsx",
  ),
  categoriesTemplate: path.resolve(
    "./src/templates/CategoriesTemplate/CategoriesTemplate.tsx",
  ),
  tagTemplate: path.resolve("./src/templates/TagTemplate/TagTemplate.tsx"),
  tagsTemplate: path.resolve("./src/templates/TagsTemplate/TagsTemplate.tsx"),
  pageTemplate: path.resolve("./src/templates/PageTemplate/PageTemplate.tsx"),
  postTemplate: path.resolve("./src/templates/PostTemplate/PostTemplate.tsx"),
});

export default templates;

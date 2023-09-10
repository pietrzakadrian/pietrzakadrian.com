---
title: Self reference model in React Native using MobX-state-tree
date: "2021-11-01T22:40:32.169Z"
template: "post"
draft: false
slug: "self-reference-mode-in-react-native-using-mobx-state-tree"
category: "Mobile Development"
tags:
  - "TypeScript"
  - "React Native"
description: "While I was programming my mobile application in React Native, using the Ignite stack (i.e. TypeScript and MobX-state-tree), I ran into a specific problem. My api response returns a list of categories and their subcategories, it looks like this..."
socialImage: "/media/thumbnail.jpeg"
---

![Thumbnail](/media/thumbnail.jpeg)

While I was programming my mobile application in React Native, using the [Ignite](https://github.com/infinitered/ignite) stack (i.e. TypeScript and MobX-state-tree), I ran into a specific problem.\
My api response returns a list of categories and their subcategories, it looks like this:

```json
[
  {
    "parentId": "aa483650311248828289ee00385d7d34",
    "name": "Clothing",
    "level": 2,
    "active": true,
    "children": [
      {
        "parentId": "a515ae260223466f8e37471d279e6406",
        "name": "Women",
        "level": 3,
        "active": true
      },
      {
        "parentId": "a515ae260223466f8e37471d279e6406",
        "name": "Men",
        "level": 3,
        "active": true
      }
    ]
  },
  {
    "parentId": "aa483650311248828289ee00385d7d34",
    "name": "Free time & electronics",
    "level": 2,
    "active": true
  }
]
```

There's an interesting case here, because as you can see: in the `children` key, we return the same as the parent. How can I declare a model for this answer?

## Standard attempt to solve this problem

The first thought comes to us programming it like this:

```typescript
import { Instance, SnapshotOut, types } from "mobx-state-tree";

/**
 * Model description here for TypeScript hints.
 */
export const CategoryModel = types.model("Category").props({
  id: types.maybe(types.string),
  parentId: types.maybe(types.string),
  name: types.maybe(types.string),
  level: types.maybe(types.number),
  children: types.optional(types.array(CategoryModel), []),
});

type CategoryType = Instance<typeof CategoryModel>;
export interface Category extends CategoryType {}
type CategorySnapshotType = SnapshotOut<typeof CategoryModel>;
export interface CategorySnapshot extends CategorySnapshotType {}
export const createCategoryDefaultModel = () =>
  types.optional(CategoryModel, {});
```

Unfortunately this cannot be done as the code will not be compiled.

```
Block-scoped variable 'CategoryModel' used before its declaration. ts(2448)
```

## The good solution to this problem

To program this model correctly, you need to do it like this:

```diff
- children: types.optional(types.array(CategoryModel), []),
+ children: types.optional(types.array(types.late(() => CategoryModel)), []),
```

Voilà! You achieved exactly what you wanted. 🙌\
Now you can enjoy working and well-written source code.

---

In this article, I have introduced you to all the tools I use in my work as a full-stack software engineer.

You can also find this article on [medium.com](https://medium.com/@pietrzakadrian) where I share my solutions to the problems I encountered during my software engineer career.

If you have additional questions, you can write to me on [LinkedIn](https://www.linkedin.com/in/pietrzakadrian/) or [Twitter](https://twitter.com/pietrzakadrian/).

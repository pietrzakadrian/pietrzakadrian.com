---
title: React Native Authentication flow with MobX-state-tree
date: "2021-10-03T22:40:32.169Z"
template: "post"
draft: false
slug: "/blog/react-native-authentication-flow-with-mobx-state-tree"
category: "Mobile Development"
tags:
  - "TypeScript"
  - "React Native"
description: "If you want to program professional software in React Native, you will definitely find the most popular TypeScript boilerplate Ignite by Infinite Red, Inc. This template is very good, but it lacks the description of the authentication process. Authentication flow is described in the React Navigation documentation, but there is an example using Redux. Ignite uses a MobX-State-Tree to manage the state and there is very little information on this."
socialImage: "./media/thumbnail.jpeg"
---

![Thumbnail](/media/thumbnail.jpeg)

If you want to program professional software in React Native, you will definitely find the most popular TypeScript boilerplate [Ignite](https://github.com/infinitered/ignite) by Infinite Red, Inc. This template is very good, but it lacks the description of the authentication process.

Authentication flow is described in the [React Navigation documentation](https://reactnavigation.org/docs/auth-flow/), but there is an example using Redux.
Ignite uses a MobX-State-Tree to manage the state and there is very little information on this.

In this article, I'll show you my way to implement authentication flow using MobX-State-Tree.

> **Note**: I am using the Ignite in version 7.5.0 and **@react-navigation/native** in v6.0.1.

---

## 1. Create the authentication-store model

In the project directory, execute the following command:

```
npx ignite-cli generate model authentication-store
```

This will generate the following code in the models directory:

```typescript
import { Instance, SnapshotOut, types } from "mobx-state-tree";

/**
 * Model description here for TypeScript hints.
 */
export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({})
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})); // eslint-disable-line @typescript-eslint/no-unused-vars

type AuthenticationStoreType = Instance<typeof AuthenticationStoreModel>;
export interface AuthenticationStore extends AuthenticationStoreType {}
type AuthenticationStoreSnapshotType = SnapshotOut<
  typeof AuthenticationStoreModel
>;
export interface AuthenticationStoreSnapshot
  extends AuthenticationStoreSnapshotType {}
export const createAuthenticationStoreDefaultModel = () =>
  types.optional(AuthenticationStoreModel, {});
```

Now add a new boolean variable that will correspond to whether the user is logged in or not.\
By default it will be not logged in.

```typescript
import { Instance, SnapshotOut, types } from "mobx-state-tree";

/**
 * Model description here for TypeScript hints.
 */
export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    isAuthenticationed: types.optional(types.boolean, false),
  });

type AuthenticationStoreType = Instance<typeof AuthenticationStoreModel>;
export interface AuthenticationStore extends AuthenticationStoreType {}
type AuthenticationStoreSnapshotType = SnapshotOut<
  typeof AuthenticationStoreModel
>;
export interface AuthenticationStoreSnapshot
  extends AuthenticationStoreSnapshotType {}
export const createAuthenticationStoreDefaultModel = () =>
  types.optional(AuthenticationStoreModel, {});
```

Then create two actions. One will be responsible for logging in, the other for logging out.

```typescript
import { flow, Instance, SnapshotOut, types } from "mobx-state-tree";
import { LoginResult, LogoutResult } from "../../services/api";
import { AuthenticationApi } from "../../services/api/authentication-api";
import { withEnvironment } from "../extensions/with-environment";
import { withStatus } from "../extensions/with-status";

/**
 * Model description here for TypeScript hints.
 */
export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    isAuthenticationed: types.optional(types.boolean, false),
  })
  .extend(withEnvironment)
  .extend(withStatus)
  .actions((self) => ({
    setAuthenticated(value: boolean) {
      self.isAuthenticationed = value;
    },
  }))
  .actions((self) => ({
    login: flow(function* (emailAddress: string, password: string) {
      self.setStatus("pending");

      const authenticationApi = new AuthenticationApi(self.environment.api);
      const result: LoginResult = yield authenticationApi.login(
        emailAddress,
        password,
      );

      if (result.kind === "ok") {
        self.setStatus("done");
        self.setAuthenticated(true);
      } else {
        self.setStatus("error");
        self.setAuthenticated(false);
        __DEV__ && console.tron.log(result.kind);
      }
    }),

    logout: flow(function* () {
      self.setStatus("pending");

      const authenticationApi = new AuthenticationApi(self.environment.api);
      const result: LogoutResult = yield authenticationApi.logout();

      if (result.kind === "ok") {
        self.setStatus("done");
        self.setAuthenticated(false);
      } else {
        self.setStatus("error");
        self.setAuthenticated(false);
        __DEV__ && console.tron.log(result.kind);
      }
    }),
  }));

type AuthenticationStoreType = Instance<typeof AuthenticationStoreModel>;
export interface AuthenticationStore extends AuthenticationStoreType {}
type AuthenticationStoreSnapshotType = SnapshotOut<
  typeof AuthenticationStoreModel
>;
export interface AuthenticationStoreSnapshot
  extends AuthenticationStoreSnapshotType {}
export const createAuthenticationStoreDefaultModel = () =>
  types.optional(AuthenticationStoreModel, {});
```

I created extend `withStatus` to facilitate handling of showing the ActivityIndicator in a screen.

```typescript
import { IObservableValue, observable } from "mobx";

export type StatusType = "idle" | "pending" | "done" | "error";

export const withStatus = () => {
  /**
   * The observable backing store for the status field.
   */
  const status: IObservableValue<string> = observable.box("idle");

  return {
    views: {
      get status() {
        return status.get() as StatusType;
      },

      set status(value: StatusType) {
        status.set(value);
      },
    },
    actions: {
      setStatus(value: StatusType) {
        status.set(value);
      },

      resetStatus() {
        status.set("idle");
      },
    },
  };
};
```

At the end, declare your AuthenticationStore in the main RootStoreModel:

```typescript
import { Instance, SnapshotOut, types } from "mobx-state-tree";
import { AuthenticationStoreModel } from "../models";

export const RootStoreModel = types.model("RootStore").props({
  authenticationStore: types.optional(AuthenticationStoreModel, {} as any),
});
```

Alright, our model is enough to handle login and logout. Now we need a new class that will be responsible for communication with API.

---

## 2. Create an AuthenticationApi class

My login and logout consists in sending a POST and PATCH request to the appropriate end address. I created this api myself, it is on my own server.

```typescript
import { ApiResponse } from "apisauce";
import { Api } from "./api";
import { getGeneralApiProblem } from "./api-problem";
import { LoginResult, LogoutResult } from "./api.types";

export class AuthenticationApi {
  private api: Api;

  constructor(api: Api) {
    this.api = api;
  }

  async login(emailAddress: string, password: string): Promise<LoginResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/Authentication/log-in",
        { emailAddress, password },
      );

      if (!response.ok) {
        const problem = getGeneralApiProblem(response);
        if (problem) return problem;
      }

      return { kind: "ok" };
    } catch (e) {
      __DEV__ && console.tron.log(e.message);
      return { kind: "bad-data" };
    }
  }

  async logout(): Promise<LogoutResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.patch(
        "/Authentication/log-out",
      );

      if (!response.ok) {
        const problem = getGeneralApiProblem(response);
        if (problem) return problem;
      }

      return { kind: "ok" };
    } catch (e) {
      __DEV__ && console.tron.log(e.message);
      return { kind: "bad-data" };
    }
  }
}
```

```typescript
export type LoginResult = { kind: "ok" } | GeneralApiProblem;
export type LogoutResult = { kind: "ok" } | GeneralApiProblem;
```

Now our MobX-State-Tree logic is ready to be used in components.

---

## 3. Edit app navigator

Now it's time for screens. Enter the `app-navigator.tsx` file and edit it as follows:

```tsx
import { useStores } from "../models";
import { observer } from "mobx-react-lite";

export const AppNavigator = observer((props: NavigationProps) => {
  const colorScheme = useColorScheme();
  const { authenticationStore } = useStores();

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      {authenticationStore.isAuthenticationed ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
});
```

> **Note**: Remember to wrap the component with observer () because you want to listen for changes dynamically.

If the user is logged in, give him access to all screens available after logging in.\
Otherwise, allow it to access only non-authorization screens.

So now in AppStack there are declared screens that you use for the application after logging in:

```tsx
export type NavigatorBottomTabParamList = {
  profile: undefined;
};

const Tab = createBottomTabNavigator<NavigatorBottomTabParamList>();

const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="profile"
    >
      <Tab.Screen name="profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
```

and in AuthStack there are screens that do not require authentication:

```tsx
export type NavigatorStackParamList = {
  login: undefined;
};

const Stack = createNativeStackNavigator<NavigatorStackParamList>();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="login"
    >
      <Stack.Screen name="login" component={LoginScreen} />
    </Stack.Navigator>
  );
};
```

With the wrapped observer() function, the mobile app will understand when to show the user AppStack and when to show AuthStack.

---

## 4. Create an action in the screen

To log in, you need to use the login action from Authentication Store:

```tsx
type FormData = {
  emailAddress: string;
  password: string;
};

const onLogin = async (data: FormData) =>
  await authenticationStore.login(data.emailAddress, data.password);
```

and logout action for log out:

```tsx
const onLogout = async () => await authenticationStore.logout();
```

> **Note**: I'm using the [react-hook-form](https://react-hook-form.com/) library for React Native forms.

The following is an example for Login Screen:

```tsx
import { observer } from "mobx-react-lite";
import React, { useLayoutEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { View, ViewStyle } from "react-native";
import { Button, Screen, TextField } from "../../components";
import { useStores } from "../../models";

const ROOT: ViewStyle = {
  flex: 1,
};

type FormData = {
  emailAddress: string;
  password: string;
};

export const LoginScreen = observer(function LoginScreen() {
  const { control, handleSubmit } = useForm<FormData>();
  const { authenticationStore } = useStores();

  useLayoutEffect(() => {
    return () => {
      authenticationStore.resetStatus();
    };
  }, [authenticationStore]);

  const onLogin = async (data: FormData) =>
    await authenticationStore.login(data.emailAddress, data.password);

  return (
    <Screen style={ROOT} preset="scroll">
      <View>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
          name="emailAddress"
          defaultValue=""
        />

        <Controller
          control={control}
          rules={{
            required: true,
            minLength: 6,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
          name="password"
          defaultValue=""
        />

        <Button
          text={
            authenticationStore.status === "pending" ? "Loading ..." : "Submit"
          }
          onPress={handleSubmit(onLogin)}
        />
      </View>
    </Screen>
  );
});
```

---

You can also find this article on [medium.com](https://medium.com/@pietrzakadrian) where I share my solutions to the problems I encountered during my software engineer career.

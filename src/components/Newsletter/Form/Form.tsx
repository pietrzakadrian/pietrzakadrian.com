import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Button from "../../Button/Button";

import * as styles from "./Form.module.scss";

type FormValues = {
  emailAddress: string;
};

const Form: React.FC = () => {
  const ENDPOINT = "https://api.convertkit.com/v3/forms/";
  const { CONVERTKIT_PUBLIC_KEY, CONVERTKIT_SIGNUP_FORM } = process.env;

  const [status, setStatus] = useState("idle");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await fetch(`${ENDPOINT}${CONVERTKIT_SIGNUP_FORM}/subscribe`, {
        method: "POST",
        body: JSON.stringify({
          email: data.emailAddress,
          api_key: CONVERTKIT_PUBLIC_KEY,
        }),
        headers: {
          "Content-Type": "application/json",
          charset: "utf-8",
        },
      });
      setStatus("success");
    } catch (err) {
      setStatus("failed");
    }
  };

  const content = () => {
    switch (status) {
      case "idle": {
        return (
          <section>
            <p>
              Get a once-per-month email with my latest article and additional
              details about my launches, products and experiments.
            </p>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.container}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Email address"
                  {...register("emailAddress", {
                    required: true,
                    pattern: /^\S+@\S+$/i,
                  })}
                />

                <div className={styles.error}>
                  {errors.emailAddress && <span>This field is required.</span>}
                </div>
              </div>

              <Button isLink={false} title="Get updates" />
            </form>

            <p>No spam, sales or ads. Unsubscribe as your heart desires.</p>
          </section>
        );
      }

      case "success": {
        return (
          <>
            <p>Thanks, but that's not all! 💚</p>

            <p>
              You will receive an email in a moment asking you to{" "}
              <strong>confirm the address</strong> you entered. I can't send you
              anything if you don't :(
            </p>

            <p>
              If the message did not arrive, check your SPAM and OFFERS folders.
            </p>

            <p>
              To be read soon!
              <br />
              Adrian Pietrzak
            </p>
          </>
        );
      }

      default: {
        return (
          <>
            <p>Oops! Something went wrong. ❌</p>

            <p>
              It looks like ConvertKit is having some problems. Please try again
              in a moment.
            </p>
          </>
        );
      }
    }
  };

  return <main className={styles.newsletter}>{content()}</main>;
};

export default Form;

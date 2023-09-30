import React from "react";
import {useSiteMetadata} from "@/hooks";
import {Contacts} from "@/components/Sidebar/Contacts";

const Confirm: React.FC = () => {
  const { author } = useSiteMetadata();

  return (
    <main>
      <p>Thank you for subscribing to my newsletter! ⭐️</p>

      <p>That means a lot to me. I hope it will be a good choice for you.</p>

      <p>If you have questions or feedback for me in the meantime, I’m always available on my email and social media
        profiles.</p>

      <Contacts contacts={author.contacts} />

      <p>
        Enjoy reading,
        <br />
        Adrian Pietrzak
      </p>
    </main>
  );
};

export default Confirm;

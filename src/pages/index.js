import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = () => (
<Layout>
    <SEO title="Portait of Adrian Pietrzak" />

    <main style={{ padding: "40px 0" }}>
      <section>
        <p style={{ fontSize: 16, fontFamily: "Gotham Book", }}>
          Jednym z najczęściej zadawanych mi pytań, jest czym się zajmuję. Aby
          odpowiedzieć na pytanie: „<strong style={{ fontSize: 16, fontFamily: "Gotham Book"}} >kim jest{" "}
          <h1
            style={{
              display: "inline",
              fontSize: "inherit",
              fontFamily: "inherit",
            }}
          >
            Adrian Pietrzak
          </h1>
          ?</strong>” – opiszę swoją drogę od dzieciństwa do tego, kim jestem dzisiaj.
        </p>
      </section>

      <hr />

      <section>
        <p style={{fontFamily: "Gotham Book", color: '#000'}}>
          Zawsze interesowały mnie technologie internetowe i zacząłem swoją
          podróż w bardzo młodym wieku. Uczyłem się tworzenia stron
          internetowych. W tamtym czasie to był dopiero początek rozwoju
          Internetu; Chodziło o język HTML i CSS. Swoją pierwszą stronę
          internetową uruchomiłem w wieku 10 lat –{" "}
          <a target="_blank" href="https://komiksy.pl.tl">https://komiksy.pl.tl</a>.
         
          Następne lata spędziłem w moim rodzinnym mieście, grając w gry
          internetowe MMO RPG i uczęszczając do szkół podstawowej i średniej.
        </p>
      </section>

      <section>
        <h4
          style={{
            marginBottom: 10,
            fontFamily: "Butler",
            fontSize: 37,
            fontWeight: 500,
            lineHeight: 1.8,
          }}
        >
          Dorastanie
        </h4>

        <p style={{fontFamily: "Gotham Book", color: '#000'}}>
          W 2011 roku, założyłem swój pierwszy kanał na YouTube, umieszczając na
          nim moje rozgrywki z gier. Zacząłem wtedy budować swoją społeczność.
          Kilka lat później, zmieniłem produkowany kontent z gier online na
          filmy z moją osobą w roli głównej. Zgromadzone doświadczenie pomogło
          mi zacząć tworzyć filmy viralowe i mój kanał, w kilka
          miesięcy, zasubskrybowało 250 tys. osób. Dzięki reklamom umieszczanych
          na filmach, udało mi się wygenerować z tego przyzwoite dochody, które
          wystarczyły mi na dalsze życie nastolatka.
          <br /><br />
          To było moje pierwsze doświadczenie w biznesie internetowym i od razu
          się połączyłem. Wiedziałem wtedy, że chcę tworzyć kolejne projekty i w
          ten sposób zarabiać pieniądze.
        </p>
      </section>

      <section>
        <h4
          style={{
            marginBottom: 10,
            fontFamily: "Butler",
            fontSize: 37,
            fontWeight: 400,
            lineHeight: 1.8,
          }}
        >
          Programowanie
        </h4>

        <p style={{fontFamily: "Gotham Book", color: '#000'}}> 
          Wybrałem studia informatyczne w trybie niestacjonarnym i zacząłem
          szukać pierwszej pracy. W wieku 20 lat zacząłem swoją karierę jako
          programista w niedużej firmie typu „Software House”. Udało mi się
          zdobyć sporo umiejętności z zakresu programowania i nabyć cenne
          doświadczenie w branży e-commerce.
          <br /><br />W między czasie, pracowałem nad moją aplikacją open source,
          która zdobyła ponad 1 tys. gwiazdek w serwisie github.com. Mój kod
          okazał się dużą pomocą dla wielu programistów na całym świecie. To
          samo oprogramowanie stało się częścią mojej pracy dyplomowej, którą
          obroniłem na początku 2021 roku.
        </p>

        <div style={{ textAlign: "center" }}>
          <iframe
            src="https://www.linkedin.com/embed/feed/update/urn:li:share:6697585094808494080"
            height="832"
            width="504"
            frameborder="0"
            allowfullscreen=""
            title="Osadzona publikacja"
          ></iframe>
        </div>
      </section>
      
      <p style={{fontFamily: "Gotham Book", color: '#000'}}>
        Będzie kontynuowane,
        <br />
        <h2
          style={{
            display: "inline",
            fontWeight: "normal",
            fontSize: "inherit",
            fontFamily: "inherit",
          }}
        >
          Adrian Pierzak
        </h2>
      </p>
    </main>
  </Layout>
)

export default IndexPage

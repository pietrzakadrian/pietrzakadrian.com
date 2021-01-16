import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

const Header = ({ siteTitle }) => (
  <header
    style={{
      background: `hsla(0, 0%, 0%, 0.8)`,
      marginBottom: `1.45rem`,
    }}
  >
    <div
      style={{
        margin: `0 auto`,
        maxWidth: 960,
        padding: `1.45rem 1.0875rem`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <h1 style={{ margin: 0 }}>
        <Link
          to="/"
          style={{
            color: `white`,
            textDecoration: `none`,
            fontFamily: "Butler",
          }}
        >
          {siteTitle}
        </Link>
      </h1>

      <iframe
        src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Ffacebook.com%2Fpietrzakadrian&width=108&layout=button_count&action=like&size=large&share=false&height=21&appId"
        width="140"
        height="30"
        style={{border:'none',overflow:'hidden', margin: 0}}
        scrolling="no"
        frameborder="0"
        allowfullscreen="true"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      ></iframe>
    </div>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header

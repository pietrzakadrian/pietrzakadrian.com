import { useEffect } from "react"
import { navigate } from "gatsby"

const IndexPage = () => {
  useEffect(() => {
    navigate("/portrait")
  }, [])

  return null
}

export default IndexPage

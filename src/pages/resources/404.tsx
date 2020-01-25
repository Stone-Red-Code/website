import { Location } from "@reach/router"
import { graphql } from "gatsby"
import React, { Fragment } from "react"

import { FileConnection } from "../../../generated/graphql"
import { ComponentQuery } from "../../../typings"
import { getPossibleCorrections } from "../../components/404LinkCorrection"
import { SEO } from "../../components/SEO"

export default ({ data }: ComponentQuery<{ allFile: FileConnection }>) => (
  <Fragment>
    <SEO title="404: Resource Not found" />
    <h1>RESOURCE NOT FOUND</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    <Location>
      {({ location }) => getPossibleCorrections("resources", location, data, 8)}
    </Location>
  </Fragment>
)

export const query = graphql`
  query {
    allFile(filter: { sourceInstanceName: { eq: "resources" } }) {
      edges {
        node {
          relativePath
        }
      }
    }
  }
`
